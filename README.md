# MindLens — AI-Powered Mental Wellness Platform

MindLens is a full-stack wellness platform that helps users track their emotional patterns, journal privately, connect with therapists, and receive personalized AI guidance.

## Features

- **Daily Check-ins** — Rate mood, energy, sleep, stress, and focus with AI-powered insights
- **Private Journal** — AES-256 encrypted entries with mood tagging
- **AI Companion "Lens"** — GPT-powered chat for support, breathing exercises, and motivation
- **Therapist Finder** — Google Places API integration to find licensed professionals nearby
- **Wellness Trends** — 7-day charts and averages powered by Recharts
- **Google OAuth** — Sign in with Google (ID token flow via @react-oauth/google)
- **Streak Tracking** — Daily check-in streaks to build healthy habits

## Tech Stack

| Layer     | Tech                                       |
|-----------|--------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS 3, Recharts   |
| Auth      | JWT, Google OAuth 2.0 (@react-oauth/google)|
| AI        | OpenAI GPT (via backend)                   |
| Backend   | Node.js, Express, MongoDB (Mongoose)       |
| Maps      | Google Places API                          |

## Project Structure

```
MindLensHackathon/
├── backend/                  # Express API
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   │   ├── auth.js           # Auth routes (login, register, Google OAuth)
│   │   ├── checkins.js       # Check-in CRUD + trends
│   │   ├── journal.js        # Journal CRUD (encrypted)
│   │   ├── ai.js             # AI insights, tips, companion chat
│   │   └── therapists.js     # Google Places nearby search
│   ├── utils/
│   └── server.js
└── frontend/                 # React + Vite SPA
    ├── src/
    │   ├── components/       # Navbar, ProtectedRoute
    │   ├── contexts/         # AuthContext
    │   ├── pages/            # Landing, Dashboard, CheckIn, Journal, Companion, Therapists, Profile
    │   └── utils/            # Axios API instance
    ├── tailwind.config.js
    └── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- OpenAI API key
- Google OAuth Client ID
- Google Places API key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # Fill in your environment variables
npm run dev
```

**Backend `.env` variables:**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mindlens
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
CLIENT_URL=http://localhost:5173
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # Fill in your environment variables
npm run dev
```

**Frontend `.env` variables:**

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_URL=http://localhost:5000/api
```

### Running Both Together

Open two terminals:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Visit `http://localhost:5173` in your browser.

## API Endpoints

### Auth
| Method | Endpoint               | Description                    |
|--------|------------------------|--------------------------------|
| POST   | /api/auth/register     | Email/password registration    |
| POST   | /api/auth/login        | Email/password login           |
| POST   | /api/auth/google-token | Google ID token authentication |
| GET    | /api/auth/google       | Google OAuth redirect flow     |
| GET    | /api/auth/me           | Get current user               |

### Check-ins
| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| POST   | /api/checkins         | Save daily check-in        |
| GET    | /api/checkins/trends  | Get 7-day trends           |

### Journal
| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| GET    | /api/journal          | List all entries           |
| POST   | /api/journal          | Create new entry           |
| PUT    | /api/journal/:id      | Update entry               |
| DELETE | /api/journal/:id      | Delete entry               |

### AI
| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| GET    | /api/ai/insights      | AI-generated insights      |
| GET    | /api/ai/tips          | Daily wellness tips        |
| POST   | /api/ai/companion     | Chat with Lens companion   |

### Therapists
| Method | Endpoint                 | Description                |
|--------|--------------------------|----------------------------|
| GET    | /api/therapists/nearby   | Find nearby therapists     |

## Deployment

### Frontend (Vercel / Netlify)

```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

Set environment variables in your hosting provider:
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_API_URL` (your deployed backend URL)

### Backend (Railway / Render / Fly.io)

Set all backend environment variables in your hosting provider's dashboard.

## Security

- Passwords hashed with bcrypt
- JWT tokens with 7-day expiry
- Journal entries encrypted server-side (AES-256)
- Google OAuth uses ID token verification
- CORS configured for specific origins

## License

MIT
