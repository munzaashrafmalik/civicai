import { analyzeIssue } from '@/backend/services/aiService/aiService';

describe('AI Service - Local Fallback', () => {
  const origKey = process.env.DASHSCOPE_API_KEY;

  beforeEach(() => {
    delete process.env.DASHSCOPE_API_KEY;
  });

  afterAll(() => {
    if (origKey) process.env.DASHSCOPE_API_KEY = origKey;
  });

  it('should detect pothole from text', async () => {
    const result = await analyzeIssue({ textDescription: 'There is a large pothole on the road' });
    expect(result.issueCategory).toBe('pothole');
    expect(result.severity).toBe('high');
    expect(result.confidence).toBeGreaterThanOrEqual(0.72);
    expect(result.confidence).toBeLessThanOrEqual(0.92);
    expect(result.suggestedTitle).toBeTruthy();
    expect(result.description).toBeTruthy();
  });

  it('should detect garbage from text', async () => {
    const result = await analyzeIssue({ textDescription: 'Garbage is overflowing from the bins' });
    expect(result.issueCategory).toBe('garbage');
    expect(result.severity).toBe('medium');
  });

  it('should detect water leakage', async () => {
    const result = await analyzeIssue({ textDescription: 'Water leakage from pipe burst on street' });
    expect(result.issueCategory).toBe('water_leakage');
    expect(result.severity).toBe('high');
  });

  it('should detect drainage issues', async () => {
    const result = await analyzeIssue({ textDescription: 'Drain is completely blocked, sewer overflow' });
    expect(result.issueCategory).toBe('drainage');
  });

  it('should detect streetlight issues', async () => {
    const result = await analyzeIssue({ textDescription: 'Streetlight not working on main road' });
    expect(result.issueCategory).toBe('streetlight');
    expect(result.severity).toBe('low');
  });

  it('should detect traffic signal issues', async () => {
    const result = await analyzeIssue({ textDescription: 'Traffic signal not working at intersection' });
    expect(result.issueCategory).toBe('traffic_signal');
  });

  it('should detect road damage', async () => {
    const result = await analyzeIssue({ textDescription: 'Road damage with cracked surface' });
    expect(result.issueCategory).toBe('road_damage');
  });

  it('should return "other" for unrecognized text', async () => {
    const result = await analyzeIssue({ textDescription: 'Something weird happened near the park' });
    expect(result.issueCategory).toBe('other');
    expect(result.confidence).toBe(0.4);
  });

  it('should detect Urdu keywords', async () => {
    const result = await analyzeIssue({ textDescription: 'سڑک پر بہت بڑا گڑھا ہے' });
    expect(result.issueCategory).toBe('pothole');
  });

  it('should set critical severity for urgent words', async () => {
    const result = await analyzeIssue({ textDescription: 'Emergency! Large pothole causing dangerous accidents' });
    expect(result.severity).toBe('critical');
  });

  it('should lower confidence when only images provided (no text)', async () => {
    const result = await analyzeIssue({ images: ['data:image/jpeg;base64,fakedata'] });
    expect(result.confidence).toBe(0.4);
  });

  it('should produce deterministic results for same input', async () => {
    const input = { textDescription: 'Pothole on main street' };
    const result1 = await analyzeIssue(input);
    const result2 = await analyzeIssue(input);
    expect(result1.issueCategory).toBe(result2.issueCategory);
    expect(result1.confidence).toBe(result2.confidence);
    expect(result1.severity).toBe(result2.severity);
  });

  it('should sanitize output to valid categories only', async () => {
    const result = await analyzeIssue({ textDescription: 'pothole' });
    const validCategories = ['pothole', 'garbage', 'water_leakage', 'streetlight', 'drainage', 'traffic_signal', 'road_damage', 'other'];
    expect(validCategories).toContain(result.issueCategory);
  });

  it('should clamp confidence between 0.05 and 0.99', async () => {
    const result = await analyzeIssue({ textDescription: 'pothole' });
    expect(result.confidence).toBeGreaterThanOrEqual(0.05);
    expect(result.confidence).toBeLessThanOrEqual(0.99);
  });

  it('should include detected objects', async () => {
    const result = await analyzeIssue({ textDescription: 'Large pothole on the road' });
    expect(Array.isArray(result.detectedObjects)).toBe(true);
    expect(result.detectedObjects!.length).toBeGreaterThan(0);
    expect(result.detectedObjects!.length).toBeLessThanOrEqual(5);
  });

  it('should truncate long suggested titles to 60 chars', async () => {
    const result = await analyzeIssue({ textDescription: 'pothole' });
    expect(result.suggestedTitle.length).toBeLessThanOrEqual(60);
  });

  it('should truncate long descriptions to 1000 chars', async () => {
    const result = await analyzeIssue({ textDescription: 'pothole' });
    expect(result.description.length).toBeLessThanOrEqual(1000);
  });
});
