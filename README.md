# VitalCommand IQ — Personal Health Command Center

Mobile-first, dark-theme health dashboard that combines data from Garmin, WHOOP, Withings, CPAP, Blood Pressure, and Oura Ring into one unified command center.

## Features

### Dashboard
- At-a-glance metric cards: Body Comp, BP, Sleep/Recovery, Activity, Nutrition, Weather
- Live weather with AQI, UV index, hourly forecast (Madison, MS default)
- Quick-action buttons for logging food, weight, BP, workouts

### Nutrition
- **60+ pre-loaded food favorites** organized by restaurant/category
- Quick-add with full macro data (calories, protein, carbs, fat)
- Restaurants: Newk's, Primo's Café, Two Rivers, Chick-fil-A, Schlotzsky's, Smoothie King
- Protein shakes, fruits, snacks, treats, drinks
- Custom food entry that saves to favorites (AI learns)
- Real-time macro tracking with progress bars
- Today's food log with timestamps

### AI Tab
- Upload screenshots from ANY device (Garmin, WHOOP, BP, CPAP, Withings, Oura)
- Claude Vision AI parses metrics automatically
- Upload food photos → AI identifies items with nutrition estimates
- One-tap save to dashboard or nutrition log
- Confidence scoring on all parsed values

### Body Composition
- Manual logging: weight, body fat %, muscle mass, visceral fat, ECG/EKG
- Journey tracker: 280 → 210 → 195 goal with progress bar
- Withings Body Comp integration via AI screenshot parsing

### Blood Pressure
- Morning/Evening manual logging with pulse
- WHOOP MD estimated BP tracking
- Supabase persistence for trend analysis

### Workouts
- Quick-start workout types (Upper, Lower, Full Body, Cardio, Core, Outdoor)
- Activity metrics from Garmin + WHOOP combined via AI parsing

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Database**: Supabase (Postgres + Auth + RLS)
- **Serverless**: Netlify Functions
- **AI**: Anthropic Claude Vision API
- **Weather**: WeatherAPI.com
- **Fonts**: Outfit + JetBrains Mono

## Project Structure
```
vital-command-iq/
├── index.html                    # Vite entry
├── package.json
├── vite.config.js
├── tailwind.config.js            # Custom VitalCommand theme
├── postcss.config.js
├── netlify.toml                  # Netlify build config
├── supabase_schema.sql           # 8 tables with RLS
├── .env.example
├── netlify/functions/
│   ├── weather.js                # WeatherAPI with AQI/UV
│   └── ai-parse.js               # Claude Vision for screenshots
└── src/
    ├── main.jsx
    ├── index.css                  # Tailwind + custom styles
    ├── supabase.js                # Supabase client
    ├── App.jsx                    # Auth + routing + layout
    ├── hooks/
    │   ├── useSession.js
    │   └── useToast.js
    ├── lib/
    │   └── favorites.js           # 60+ food items with macros
    ├── components/
    │   ├── Card.jsx               # Accent-colored metric card
    │   ├── MetricBox.jsx          # Individual metric display
    │   ├── TabBar.jsx             # Bottom nav with AI fab
    │   ├── Toast.jsx              # Notification toast
    │   └── Modal.jsx              # Bottom sheet modal
    └── pages/
        ├── Dashboard.jsx          # Main command center
        ├── Food.jsx               # Nutrition logging
        ├── AITab.jsx              # Screenshot AI analysis
        ├── Workouts.jsx           # Workout logging
        └── Profile.jsx            # Body comp, BP, account
```

## Setup

### 1. Supabase
- Create a Supabase project
- Run `supabase_schema.sql` in SQL Editor
- Copy your project URL and anon key

### 2. API Keys
- **WeatherAPI**: Free at weatherapi.com
- **Anthropic**: Your Claude API key

### 3. Local Development
```bash
npm install
cp .env.example .env
# Fill in your env values
npm run dev
```

### 4. Deploy to Netlify
1. Push to GitHub
2. Netlify → New site from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `WEATHERAPI_KEY`
   - `ANTHROPIC_API_KEY`

## Notes
- All API keys stay server-side via Netlify Functions
- Supabase RLS ensures each user only sees their own data
- Supports multi-user (you and your wife, or future subscribers)
- Food favorites auto-seed on first login
- Custom foods are saved and learned over time
