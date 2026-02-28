# 🌿 NutriGen — Advancing Nutrition Science through Gemini AI

A full-stack web application that delivers personalized nutrition intelligence powered by **Google Gemini AI**. NutriGen covers three key use cases: nutritional analysis, AI-driven meal planning, and virtual nutrition coaching.

---

## 🚀 Features

| Module | Description |
|--------|-------------|
| **🔬 Nutrition Analyzer** | Instant macronutrient & micronutrient breakdown for any food |
| **📅 Meal Planner** | 7-day personalized meal plan with recipes & grocery list |
| **🤖 AI Coach** | Chat with a virtual nutrition coach powered by Gemini |
| **⚖️ Food Comparison** | Side-by-side nutritional comparison with charts |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Recharts (data visualization), CSS3
- **Backend**: Node.js + Express
- **AI**: Google Gemini 1.5 Flash (`@google/generative-ai`)
- **Rate Limiting**: `express-rate-limit`

---

## 📦 Project Structure

```
nutrigen/
├── server/
│   └── index.js          # Express API server with Gemini routes
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js         # Main app with navigation
│       ├── App.css        # Global styles
│       └── components/
│           ├── NutritionAnalyzer.js
│           ├── MealPlanner.js
│           ├── NutritionCoach.js
│           └── FoodComparison.js
├── .env.example           # Environment variables template
├── package.json           # Server dependencies
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- A **Google Gemini API key** — [Get one here](https://makersuite.google.com/app/apikey)

### Step 1: Clone & Configure Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd nutrigen

# Create your environment file
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Step 2: Install Server Dependencies

```bash
npm install
```

### Step 3: Install Client Dependencies

```bash
cd client
npm install
cd ..
```

### Step 4: Run the Application

**Terminal 1 — Start the backend:**
```bash
npm start
# or for development with auto-reload:
npm run dev
```

**Terminal 2 — Start the frontend:**
```bash
cd client
npm start
```

Open **http://localhost:3000** in your browser 🎉

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/nutrition/analyze` | Analyze a food item's nutrition |
| POST | `/api/meal-plan/generate` | Generate a 7-day meal plan |
| POST | `/api/coach/chat` | Chat with the AI nutrition coach |
| POST | `/api/nutrition/compare` | Compare multiple foods nutritionally |
| GET | `/api/health` | Server health check |

### Example: Analyze a Food

```bash
curl -X POST http://localhost:5000/api/nutrition/analyze \
  -H "Content-Type: application/json" \
  -d '{"foodItem": "avocado", "quantity": "1", "unit": "piece"}'
```

---

## 📋 Usage Guide

### Nutrition Analyzer
1. Enter any food item (e.g., "grilled salmon", "brown rice", "almond milk")
2. Optionally specify quantity and unit
3. Click **Analyze Nutrition** to get instant results
4. View calories, macros, micros, health score, and benefits

### Meal Planner
1. Fill in your dietary restrictions, allergies, and health conditions
2. Set your activity level, calorie target, and goal
3. Add any food preferences or dislikes
4. Click **Generate My Meal Plan** for a complete 7-day plan with grocery list

### AI Coach
1. Click any quick question or type your own
2. Get personalized, evidence-based nutrition advice
3. Continue the conversation for follow-up questions
4. The coach maintains context throughout the session

### Food Comparison
1. Enter 2-3 foods to compare
2. Use preset comparisons for common queries
3. View side-by-side cards, bar charts, and radar charts

---

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | Required | Your Google Gemini API key |
| `PORT` | `5000` | Backend server port |
| `CLIENT_URL` | `http://localhost:3000` | Frontend URL for CORS |
| `NODE_ENV` | `development` | Environment mode |

---

## 🚢 Deployment

### Deploy Backend (e.g., Railway, Render)
```bash
# Set environment variables in your hosting platform
# Deploy from the root directory
npm start
```

### Deploy Frontend (e.g., Vercel, Netlify)
```bash
cd client
npm run build
# Deploy the build/ folder
```

Update the `proxy` in `client/package.json` to point to your deployed backend URL for production.

---

## ⚠️ Disclaimer

NutriGen provides general nutritional information for educational purposes only. The AI-generated content is not a substitute for professional medical or dietary advice. Always consult a registered dietitian or healthcare provider for personalized medical nutrition therapy.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
