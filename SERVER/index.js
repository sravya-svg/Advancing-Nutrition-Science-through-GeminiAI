require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: { error: "Too many requests. Please wait before trying again." },
});
app.use("/api/", limiter);

// Helper: call Gemini
async function callGemini(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ──────────────────────────────────────────────
// ROUTE 1: Nutritional Analysis
// ──────────────────────────────────────────────
app.post("/api/nutrition/analyze", async (req, res) => {
  try {
    const { foodItem, quantity, unit } = req.body;
    if (!foodItem) return res.status(400).json({ error: "Food item is required." });

    const prompt = `You are an expert nutritionist. Provide detailed nutritional information for: ${quantity || 1} ${unit || "serving"} of ${foodItem}.

Return ONLY a valid JSON object with this exact structure:
{
  "foodItem": "${foodItem}",
  "quantity": "${quantity || 1} ${unit || "serving"}",
  "calories": <number>,
  "macronutrients": {
    "protein": { "amount": <number>, "unit": "g", "dailyValue": <percentage> },
    "carbohydrates": { "amount": <number>, "unit": "g", "dailyValue": <percentage> },
    "fat": { "amount": <number>, "unit": "g", "dailyValue": <percentage> },
    "fiber": { "amount": <number>, "unit": "g", "dailyValue": <percentage> },
    "sugar": { "amount": <number>, "unit": "g", "dailyValue": <percentage> }
  },
  "micronutrients": {
    "vitamins": [
      { "name": <string>, "amount": <number>, "unit": <string>, "dailyValue": <percentage> }
    ],
    "minerals": [
      { "name": <string>, "amount": <number>, "unit": <string>, "dailyValue": <percentage> }
    ]
  },
  "healthScore": <1-10>,
  "healthBenefits": [<string>, <string>, <string>],
  "warnings": [<string>],
  "summary": "<2-sentence summary>"
}`;

    const text = await callGemini(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse nutritional data.");
    const data = JSON.parse(jsonMatch[0]);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Nutrition analysis error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze nutrition." });
  }
});

// ──────────────────────────────────────────────
// ROUTE 2: Meal Planning
// ──────────────────────────────────────────────
app.post("/api/meal-plan/generate", async (req, res) => {
  try {
    const {
      dietaryRestrictions,
      allergies,
      healthConditions,
      activityLevel,
      preferences,
      calorieTarget,
      goal,
    } = req.body;

    const prompt = `You are an expert dietitian. Create a personalized 7-day meal plan based on:
- Dietary Restrictions: ${dietaryRestrictions || "None"}
- Allergies: ${allergies || "None"}
- Health Conditions: ${healthConditions || "None"}
- Activity Level: ${activityLevel || "Moderate"}
- Food Preferences: ${preferences || "No specific preferences"}
- Daily Calorie Target: ${calorieTarget || "2000"} calories
- Goal: ${goal || "Maintain healthy weight"}

Return ONLY a valid JSON object:
{
  "weeklyPlan": [
    {
      "day": "Monday",
      "totalCalories": <number>,
      "meals": {
        "breakfast": { "name": <string>, "calories": <number>, "ingredients": [<string>], "prepTime": "<time>", "recipe": "<brief steps>" },
        "lunch": { "name": <string>, "calories": <number>, "ingredients": [<string>], "prepTime": "<time>", "recipe": "<brief steps>" },
        "dinner": { "name": <string>, "calories": <number>, "ingredients": [<string>], "prepTime": "<time>", "recipe": "<brief steps>" },
        "snacks": [{ "name": <string>, "calories": <number> }]
      }
    }
  ],
  "groceryList": {
    "produce": [<string>],
    "proteins": [<string>],
    "grains": [<string>],
    "dairy": [<string>],
    "other": [<string>]
  },
  "nutritionSummary": {
    "avgDailyCalories": <number>,
    "avgProtein": "<g>",
    "avgCarbs": "<g>",
    "avgFat": "<g>"
  },
  "tips": [<string>, <string>, <string>]
}`;

    const text = await callGemini(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse meal plan.");
    const data = JSON.parse(jsonMatch[0]);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Meal plan error:", err);
    res.status(500).json({ error: err.message || "Failed to generate meal plan." });
  }
});

// ──────────────────────────────────────────────
// ROUTE 3: Virtual Nutrition Coach (Chat)
// ──────────────────────────────────────────────
app.post("/api/coach/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });

    const systemContext = `You are NutriCoach, an expert virtual nutrition coach with deep knowledge of dietetics, sports nutrition, weight management, and healthy eating habits. You provide evidence-based, personalized nutrition guidance. You are warm, encouraging, and motivating. Keep responses concise (2-4 paragraphs max) and practical.

Previous conversation:
${(history || []).map((h) => `${h.role}: ${h.content}`).join("\n")}

User: ${message}
NutriCoach:`;

    const text = await callGemini(systemContext);
    res.json({ success: true, response: text.trim() });
  } catch (err) {
    console.error("Coach chat error:", err);
    res.status(500).json({ error: err.message || "Failed to get coach response." });
  }
});

// ──────────────────────────────────────────────
// ROUTE 4: Compare Foods
// ──────────────────────────────────────────────
app.post("/api/nutrition/compare", async (req, res) => {
  try {
    const { foods } = req.body;
    if (!foods || foods.length < 2) return res.status(400).json({ error: "At least 2 foods required." });

    const prompt = `Compare these foods nutritionally: ${foods.join(", ")}

Return ONLY a valid JSON array where each element has:
{
  "food": <string>,
  "calories": <number>,
  "protein": <number>,
  "carbs": <number>,
  "fat": <number>,
  "fiber": <number>,
  "healthScore": <1-10>,
  "bestFor": "<use case>",
  "highlight": "<one key benefit>"
}`;

    const text = await callGemini(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse comparison data.");
    const data = JSON.parse(jsonMatch[0]);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Compare error:", err);
    res.status(500).json({ error: err.message || "Failed to compare foods." });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "NutriGen API", version: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║   NutriGen Server Running          ║
  ║   Port: ${PORT}                       ║
  ║   Gemini AI: Connected             ║
  ╚════════════════════════════════════╝
  `);
});
