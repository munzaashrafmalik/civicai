export interface AIAnalysisInput {
  images?: string[]; // base64 data URLs
  voiceTranscript?: string;
  textDescription?: string;
  location?: { latitude: number; longitude: number };
}

export interface AIAnalysisOutput {
  issueCategory: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedTitle: string;
  detectedObjects?: string[];
}

const DASHSCOPE_BASE_URL = process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const DASHSCOPE_ENDPOINT = DASHSCOPE_BASE_URL + '/chat/completions';
const VISION_MODELS = ['qwen3-vl-plus', 'qwen-vl-max'];
const TEXT_MODEL = process.env.DASHSCOPE_TEXT_MODEL || 'qwen-plus-character';

const VALID_CATEGORIES = [
  'pothole', 'garbage', 'water_leakage', 'streetlight',
  'drainage', 'traffic_signal', 'road_damage', 'other',
];
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];

const SYSTEM_PROMPT = `You are a civic issue analyst for Pakistani cities. Analyze the citizen's report (photos and/or text, which may be in English or Urdu) and classify it.

Respond with ONLY a JSON object, no markdown, no explanation:
{
  "issueCategory": one of ["pothole","garbage","water_leakage","streetlight","drainage","traffic_signal","road_damage","other"],
  "severity": one of ["low","medium","high","critical"],
  "confidence": number between 0 and 1,
  "suggestedTitle": short title (max 60 chars) in the same language as the report,
  "description": 1-3 sentence professional complaint description in the same language as the report,
  "detectedObjects": array of visible objects in photos, or key entities in text (max 5)
}

Rules:
- Judge severity by public safety impact: broken traffic signal or deep pothole on main road = high/critical; garbage pile = medium; single broken streetlight = low.
- confidence reflects how certain you are of the category, not the severity.
- If photos and text disagree, trust the photos and lower confidence.
- If you cannot determine the issue, use "other" with confidence below 0.5.`;

interface QwenContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

async function callQwen(model: string, content: QwenContentPart[] | string): Promise<AIAnalysisOutput> {
  const response = await fetch(DASHSCOPE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`DashScope API error ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const raw: string = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Empty response from DashScope');

  const parsed = JSON.parse(stripJsonFences(raw));

  return sanitizeOutput({
    issueCategory: parsed.issueCategory,
    confidence: parsed.confidence,
    severity: parsed.severity,
    description: parsed.description,
    suggestedTitle: parsed.suggestedTitle,
    detectedObjects: parsed.detectedObjects,
  });
}

async function analyzeWithQwen(
  text: string,
  images: string[]
): Promise<AIAnalysisOutput> {
  // With photos: try vision models first
  if (images.length > 0) {
    const content: QwenContentPart[] = [
      { type: 'text', text: text ? `Analyze this civic complaint report (photo + citizen's text):\n\n${text}` : 'Analyze this civic complaint report from the attached photo(s):' },
      ...images.slice(0, 4).map(image => ({ type: 'image_url' as const, image_url: { url: image } })),
    ];

    for (const model of VISION_MODELS) {
      try {
        return await callQwen(model, content);
      } catch (err: any) {
        const msg = String(err?.message || '');
        if (msg.includes('Unpurchased') || msg.includes('AccessDenied')) {
          console.warn(`[ai] Vision model ${model} not activated on this account, trying next...`);
          continue; // model exists but no quota — try next vision model
        }
        throw err; // real error (bad key, network) — bubble up to fallback
      }
    }
    // No vision model available — fall through to text-only analysis below
    console.warn('[ai] No vision model activated; analyzing text only. Activate a vision model in Model Studio for photo analysis.');
  }

  if (!text) {
    throw new Error('No text to analyze and no vision model available');
  }

  return callQwen(TEXT_MODEL, `Analyze this civic complaint report:\n\n${text}`);
}

function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '');
  }
  return trimmed;
}

function sanitizeOutput(out: Partial<AIAnalysisOutput>): AIAnalysisOutput {
  const issueCategory = VALID_CATEGORIES.includes(out.issueCategory as string)
    ? (out.issueCategory as string)
    : 'other';

  const severity = VALID_SEVERITIES.includes(out.severity as string)
    ? (out.severity as AIAnalysisOutput['severity'])
    : 'medium';

  const confidenceNum = typeof out.confidence === 'number'
    ? out.confidence
    : parseFloat(String(out.confidence)) || 0.5;
  const confidence = Math.min(0.99, Math.max(0.05, confidenceNum));

  const description = typeof out.description === 'string' && out.description.trim()
    ? out.description.trim().slice(0, 1000)
    : 'Civic issue reported at the location. Requires departmental review.';

  const suggestedTitle = typeof out.suggestedTitle === 'string' && out.suggestedTitle.trim()
    ? out.suggestedTitle.trim().slice(0, 60)
    : 'Civic Issue Reported';

  const detectedObjects = Array.isArray(out.detectedObjects)
    ? out.detectedObjects
        .filter((o): o is string => typeof o === 'string' && o.trim().length > 0)
        .map(o => o.trim())
        .slice(0, 5)
    : [];

  return { issueCategory, confidence, severity, description, suggestedTitle, detectedObjects };
}

// ---- Deterministic local fallback (no API key / API failure) ----

const categoryKeywords: Record<string, string[]> = {
  pothole: ['pothole', 'hole', 'pit', 'asphalt', 'گڑھا', 'سڑک کا گڑھا', 'کھڈا'],
  garbage: ['garbage', 'trash', 'waste', 'rubbish', 'litter', 'کوڑا', 'کچرا', 'گندگی'],
  water_leakage: ['water leak', 'leakage', 'pipe burst', 'water logging', 'پانی کا رساو', 'پانی بہ رہا ہے', 'پائپ پھٹ گیا'],
  streetlight: ['streetlight', 'street light', 'lamp post', 'light not working', 'سٹریٹ لائٹ', 'لائٹ نہیں جلی', 'کھمبہ'],
  drainage: ['drain', 'drainage', 'sewer', 'blocked drain', 'ڈرینج', 'نالی', 'سیوریج'],
  traffic_signal: ['traffic signal', 'traffic light', 'signal not working', 'ٹریفک سگنل', 'سگنل خراب'],
  road_damage: ['road damage', 'cracked road', 'broken road', 'سڑک ٹوٹی', 'سڑک کا نقصان'],
  other: [],
};

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function detectCategory(text: string, seedBase: string): { category: string; confidence: number } {
  const lowerText = text.toLowerCase();
  let bestMatch: { category: string; matched: boolean } = { category: 'other', matched: false };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        if (!bestMatch.matched) {
          bestMatch = { category, matched: true };
        }
        break;
      }
    }
  }

  // Deterministic confidence derived from input, so identical input yields identical output
  const confidence = bestMatch.matched
    ? 0.72 + (hashString(seedBase) % 100) / 500 // 0.72 - 0.92
    : 0.4;

  return { category: bestMatch.category, confidence };
}

function detectSeverity(category: string, text: string): 'low' | 'medium' | 'high' | 'critical' {
  const lowerText = text.toLowerCase();
  const urgentWords = ['urgent', 'emergency', 'dangerous', 'critical', 'severe', 'immediate', 'فوری', 'خطرناک'];
  const highWords = ['big', 'large', 'major', 'serious', 'significant', 'بڑا', 'شدید'];

  if (urgentWords.some(w => lowerText.includes(w))) return 'critical';
  if (highWords.some(w => lowerText.includes(w))) return 'high';
  if (category === 'pothole' || category === 'water_leakage') return 'high';
  if (category === 'garbage' || category === 'drainage') return 'medium';
  if (category === 'streetlight' || category === 'traffic_signal') return 'low';
  return 'medium';
}

const descriptionTemplates: Record<string, string> = {
  pothole: 'A pothole has been identified at the provided location. The affected area requires inspection and repair to prevent vehicle damage and traffic disruption.',
  garbage: 'Garbage accumulation has been reported at the location. The area requires cleanup to address health hazards and environmental concerns.',
  water_leakage: 'Water leakage detected from underground infrastructure causing water wastage and potential road damage. Repair required.',
  streetlight: 'Streetlight malfunction reported in the area. This poses safety concerns during night hours and requires maintenance.',
  drainage: 'Drainage blockage or overflow reported. This may cause waterlogging and requires attention.',
  traffic_signal: 'Traffic signal malfunction reported. This creates traffic safety hazards and needs urgent repair.',
  road_damage: 'Road damage identified requiring inspection and repair to ensure public safety.',
  other: 'A civic issue has been reported at the location and requires departmental review.',
};

const titleTemplates: Record<string, string> = {
  pothole: 'Pothole Reported',
  garbage: 'Garbage Accumulation',
  water_leakage: 'Water Leakage',
  streetlight: 'Broken Streetlight',
  drainage: 'Drainage Issue',
  traffic_signal: 'Traffic Signal Malfunction',
  road_damage: 'Road Damage',
  other: 'Civic Issue Reported',
};

const objectsByCategory: Record<string, string[]> = {
  pothole: ['pothole', 'road', 'asphalt damage'],
  garbage: ['garbage', 'waste', 'trash bins'],
  water_leakage: ['water leak', 'pipe', 'water pooling'],
  streetlight: ['streetlight', 'lamp post', 'light fixture'],
  drainage: ['drain', 'manhole', 'water logging'],
  traffic_signal: ['traffic light', 'signal pole', 'traffic sign'],
  road_damage: ['road crack', 'pavement damage', 'road surface'],
  other: [],
};

function localAnalysis(text: string, hasImages: boolean): AIAnalysisOutput {
  const seed = `${text}||${hasImages ? 1 : 0}`;
  const { category, confidence } = detectCategory(text, seed);
  const severity = detectSeverity(category, text);

  return {
    issueCategory: category,
    confidence: hasImages && !text ? 0.4 : confidence,
    severity,
    description: descriptionTemplates[category] || descriptionTemplates.other,
    suggestedTitle: titleTemplates[category] || titleTemplates.other,
    detectedObjects: objectsByCategory[category] || [],
  };
}

export async function analyzeIssue(input: AIAnalysisInput): Promise<AIAnalysisOutput> {
  const text = [
    input.voiceTranscript || '',
    input.textDescription || '',
  ].join(' ').trim();

  const images = (input.images || []).filter(Boolean);

  if (process.env.DASHSCOPE_API_KEY) {
    try {
      return await analyzeWithQwen(text, images);
    } catch (error) {
      console.error('DashScope analysis failed, using local fallback:', error);
    }
  } else {
    console.warn('DASHSCOPE_API_KEY not set — AI analysis running in local fallback mode (keyword-based). Add the key to .env.local for real Qwen analysis.');
  }

  return localAnalysis(text, images.length > 0);
}
