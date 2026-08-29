# CivicAI - Smart AI Complaint & Assistance Platform for Pakistan

A modern, AI-powered civic complaint platform built for the Alibaba Cloud AI Hackathon Pakistan 2026. CivicAI enables citizens to report civic issues (potholes, garbage, water leakage, etc.) using photos, voice, or text. AI analyzes the input, classifies the issue, generates a structured complaint, and routes it to the appropriate government organization.

## Features

### For Citizens
- **Multi-modal Input**: Upload photos, record voice (Urdu/English), or type descriptions
- **AI Analysis**: Automatic categorization, severity assessment, and complaint generation
- **Auto-location**: GPS-based location detection with manual override
- **Bilingual Support**: Full English and Urdu (RTL) support
- **Progress Tracking**: Real-time status updates from pending to resolved
- **Complaint History**: View all submitted complaints with status

### For Administrators
- **Dashboard**: Overview stats, recent complaints, and trends
- **Complaint Management**: Filter, search, and update complaint statuses
- **Analytics**: Category, city, severity distribution, and weekly trends
- **Organization Management**: View and manage registered government organizations

### Technical
- **Next.js 16** with Pages Router and TypeScript
- **Tailwind CSS** for responsive, accessible UI
- **MongoDB** with Mongoose for data persistence
- **Alibaba Cloud DashScope (Qwen)**: qwen-vl-max vision model + qwen-plus for AI analysis
- **Web Speech API**: real in-browser Urdu/English speech-to-text
- **Modular Architecture**: Separate services for AI and Routing
- **API Routes**: RESTful endpoints for all operations
- **Auth**: NextAuth (Credentials, JWT sessions, role-based access)

## Project Structure

```
CivicAI/
├── frontend/                 # Next.js frontend
│   ├── components/           # Reusable UI components
│   │   ├── Navbar/          # Navigation with language toggle
│   │   ├── ImageUploader/   # Drag-drop image upload
│   │   ├── VoiceRecorder/   # Browser voice recording
│   │   ├── LocationPicker/  # GPS + manual address
│   │   ├── AIAnalysis/      # AI results display
│   │   ├── ComplaintPreview/ # Review before submit
│   │   ├── StatusTracker/   # Visual progress tracker
│   │   └── IssueCard/       # Complaint list item
│   ├── pages/               # Next.js pages
│   │   ├── Home/           # Landing page
│   │   ├── ReportIssue/    # Multi-step complaint form
│   │   ├── MyComplaints/   # User's complaint history
│   │   ├── ComplaintDetails/ # Detailed view with timeline
│   │   └── Profile/        # User profile & settings
│   ├── styles/             # Global styles (Tailwind)
│   └── types/              # TypeScript interfaces
├── backend/                  # Services & models
│   ├── services/            # Business logic
│   │   ├── aiService/       # Qwen-VL analysis (DashScope) + deterministic local fallback
│   │   └── routingService/  # DB-backed organization routing
│   └── database/            # Mongoose models (User, Complaint, Organization)
├── pages/                    # Next.js Pages Router
│   ├── api/                 # REST API routes
│   └── *.tsx                # Page shims → frontend/pages
├── admin-dashboard/         # Admin panel (React)
│   ├── analytics/           # Charts & visualizations
│   ├── complaints/          # Complaint management table
│   └── index.tsx            # Main dashboard
├── scripts/                  # seed.ts — demo data
├── lib/                      # API client, auth, i18n, db connection
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Navigate to project
cd CivicAI

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local: set MONGODB_URI, NEXTAUTH_SECRET, and DASHSCOPE_API_KEY

# Seed the database (demo orgs, users, complaints)
npx tsx scripts/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@civicai.pk | admin123 |
| Citizen (Urdu) | ahmed@civicai.pk | user123 |
| Citizen (English) | sarah@civicai.pk | user123 |

### Environment Variables

See `.env.example` for all available options. Key variables:

```env
MONGODB_URI=mongodb://localhost:27017/civicai
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
# Alibaba Cloud DashScope — https://bailian.console.aliyun.com/
# Without it, AI analysis runs in deterministic keyword fallback mode
DASHSCOPE_API_KEY=sk-...
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/complaints` | List complaints (with filters) |
| POST | `/api/complaints` | Create complaint (auth required, auto-routes to org) |
| GET | `/api/complaints/[id]` | Complaint details + status timeline |
| POST | `/api/ai/analyze` | Qwen AI analysis (photo/voice/text) |
| POST | `/api/auth/register` | Register user |
| POST/GET | `/api/auth/[...nextauth]` | NextAuth login/logout/session |
| GET | `/api/organizations` | Public organization directory |
| GET | `/api/admin/dashboard` | Admin stats (admin role) |
| GET | `/api/admin/complaints` | Admin complaint list (admin role) |
| PATCH | `/api/admin/complaints/[id]` | Update status (admin role) |

## AI Analysis Pipeline

1. **Input Collection**: Images (compressed client-side), voice transcript, text description
2. **Qwen Analysis**: DashScope `qwen-vl-max` (with photos) or `qwen-plus` (text-only) returns structured JSON: category, severity, confidence, title, description, detected objects — in the language of the report (English or Urdu)
3. **Fallback**: Without a `DASHSCOPE_API_KEY` (or on API failure), a deterministic keyword classifier runs locally — identical input always yields identical output
4. **Routing**: Query the Organization collection by category + city to assign the responsible department (exact city match → category match → city match)

## Supported Issue Categories

- `pothole` - Road potholes
- `garbage` - Waste accumulation
- `water_leakage` - Pipe leaks, water logging
- `streetlight` - Broken streetlights
- `drainage` - Blocked drains, sewer issues
- `traffic_signal` - Malfunctioning signals
- `road_damage` - Cracks, broken pavement
- `other` - Miscellaneous issues

## Seeded Organizations (scripts/seed.ts)

- **Karachi**: Karachi Metropolitan Corporation (garbage, drainage, roads, streetlights, potholes)
- **Lahore**: Lahore Waste Management Company (garbage, drainage)
- **Islamabad**: ICT Administration (potholes, streetlights, traffic signals, roads, water)
- **Rawalpindi**: WASA Rawalpindi (water leakage, drainage)
- **Faisalabad**: FWMC (garbage, drainage)
- **Multan**: WASA Multan (water leakage, drainage)
- **Hyderabad**: HMC (garbage, drainage, streetlights, potholes)
- **Peshawar**: PMC (garbage, drainage, streetlights, roads, potholes)

Routing falls back gracefully: exact city+category match → any org handling that category → any org in the city.

## Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **AI**: Alibaba Cloud DashScope — qwen-vl-max (vision), qwen-plus (text)
- **Speech**: Web Speech API (browser-native, Urdu + English)
- **Auth**: NextAuth with role-based access control

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```dockerfile
# Build
docker build -t civicai .
# Run
docker run -p 3000:3000 --env-file .env.local civicai
```

## Hackathon Highlights

- **AI-First Design**: Every complaint goes through Qwen vision/language analysis
- **Bilingual RTL Support**: Complete Urdu interface with RTL layout
- **Voice Input**: Real in-browser speech-to-text (Web Speech API, ur-PK / en-US)
- **Smart Routing**: DB-backed organization assignment by category + city
- **Real-time Tracking**: Visual status timeline for citizens
- **Admin Analytics**: SVG-based charts (no heavy dependencies)
- **Accessible**: Semantic HTML, ARIA labels, focus management
- **Responsive**: Mobile-first design works on all devices

## Future Enhancements

- [x] Real AI integration (Alibaba DashScope Qwen-VL)
- [x] Real Speech-to-Text (Web Speech API)
- [ ] Push notifications (Web Push API)
- [ ] Email/SMS notifications (SendGrid, Twilio)
- [ ] Mobile app (React Native / Expo)
- [ ] Organization portal for status updates
- [ ] Gamification (points, badges, leaderboards)
- [ ] Offline support (Service Workers)

## License

MIT License - Built for Alibaba Cloud AI Hackathon Pakistan 2026

## Team

CivicAI Team - Leveraging AI for Civic Good 🇵🇰