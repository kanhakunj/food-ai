# PantryPal 🍳

AI-powered recipe generator and meal recommendation studio that suggests recipes, meal plans, and intelligent culinary substitutions based on the ingredients currently in your kitchen.

![PantryPal Banner](https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop)

---

## ✨ Features

- **Pantry & Fridge Cataloging**: Add ingredients you have on hand with instant autocomplete, categorize staples (*Produce*, *Proteins*, *Dairy*, *Grains*, *Spices*), or pick curated regional presets (Levantine, East Asian, Italian Trattoria, Plant-Based Harvest).
- **Ingredient Overlap Scoring**: Live `% Pantry Match` calculations that separate ingredients you have from what you need.
- **AI Custom Recipe Formulation**: Powered by Google Gemini (`gemini-3.8-flash`) to generate restaurant-caliber, zero-waste recipes tailored to your ingredients, dietary constraints, and time limit.
- **Visual Fridge Scanner**: Upload or snapshot a kitchen photo to detect ingredients automatically using Gemini's multimodal vision capabilities.
- **Contiguous Recipe Studio & Portion Scaler**: Scale yield portions (`1x` to `12x`) with live quantity adjustments, check off cooking stages, run inline stage timers, and send missing items to your shopping list.
- **Culinary Substitution Lab**: Chemistry-backed substitutions calculated based on ingredients you already have in your pantry.
- **Kitchen Ledger & Grocery List**: Consolidate missing items across your weekly menu and check them off as you shop.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/pantrypal.git
cd pantrypal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Add your Gemini API Key from [Google AI Studio](https://aistudio.google.com):
```env
GEMINI_API_KEY="your_api_key_here"
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons
- **Backend**: Node.js, Express, Vite middleware
- **AI Engine**: `@google/genai` TypeScript SDK with `gemini-3.8-flash`
- **Build Tool**: Vite 8 & TSX

---

## 📄 License
MIT License
