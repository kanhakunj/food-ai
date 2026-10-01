export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  preparation?: string;
  inPantry?: boolean;
  substitutionNote?: string;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  durationMinutes: number;
  techniqueTip?: string;
}

export interface RecipeNutrition {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  cuisine: string;
  mealType: "Breakfast & Brunch" | "Quick Lunch" | "Weeknight Dinner" | string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: "Effortless" | "Intermediate" | "Artisanal" | string;
  servings: number;
  matchPercentage?: number;
  dietaryTags: string[];
  flavorProfile: string;
  chefNote: string;
  zeroWasteTip: string;
  pairingSuggestion: string;
  imageUrl?: string;
  isAiGenerated?: boolean;
  nutrition: RecipeNutrition;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface PantryCategory {
  id: string;
  name: string;
  items: string[];
}

export interface PantryPreset {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  amountText: string;
  fromRecipeTitle: string;
  checked: boolean;
}

export interface SubstitutionOption {
  substituteName: string;
  usesAvailablePantry: boolean;
  ratioText: string;
  flavorImpact: string;
  bestFor: string;
}

export interface SubstitutionResponse {
  originalRole: string;
  substitutions: SubstitutionOption[];
}

export const PANTRY_CATEGORIES: PantryCategory[] = [
  {
    id: "produce",
    name: "Produce & Aromatics",
    items: [
      "Garlic",
      "Yellow Onion",
      "Heirloom Tomatoes",
      "Red Bell Pepper",
      "Meyer Lemon",
      "Baby Bok Choy",
      "Cauliflower",
      "Fresh Parsley",
      "Fresh Sage",
      "Fresh Cilantro",
      "Scallions",
      "Ginger",
      "Spinach",
      "Avocado",
      "Shallots",
    ],
  },
  {
    id: "proteins",
    name: "Proteins & Eggs",
    items: [
      "Pasture-Raised Eggs",
      "Salmon Fillet",
      "Chicken Thighs",
      "Firm Tofu",
      "Chickpeas",
      "Cannellini Beans",
      "Pancetta",
      "Prawns",
      "Ground Turkey",
    ],
  },
  {
    id: "dairy",
    name: "Dairy & Cheese",
    items: [
      "Unsalted Butter",
      "Feta Cheese",
      "Parmigiano-Reggiano",
      "Greek Yogurt",
      "Heavy Cream",
      "Pecorino Romano",
      "Whole Milk",
    ],
  },
  {
    id: "grains",
    name: "Grains, Bread & Nuts",
    items: [
      "Sourdough Bread",
      "Tagliatelle Pasta",
      "Jasmine Rice",
      "Pine Nuts",
      "Slivered Almonds",
      "Pomegranate Seeds",
      "Arborio Rice",
      "Quinoa",
      "Rolled Oats",
    ],
  },
  {
    id: "condiments",
    name: "Condiments, Oils & Spices",
    items: [
      "Extra-Virgin Olive Oil",
      "White Miso Paste",
      "Tahini",
      "Ground Cumin",
      "Smoked Paprika",
      "Sumac",
      "Soy Sauce",
      "Toasted Sesame Oil",
      "Rice Vinegar",
      "Honey",
      "Chili Flakes",
      "Dijon Mustard",
    ],
  },
];

export const ALL_KNOWN_INGREDIENTS: string[] = PANTRY_CATEGORIES.flatMap(
  (cat) => cat.items
);

export const PANTRY_PRESETS: PantryPreset[] = [
  {
    id: "mediterranean-morning",
    name: "Levantine & Mediterranean Larder",
    description: "Eggs, ripe tomatoes, feta, sourdough, garlic, warm spices, and olive oil.",
    ingredients: [
      "Pasture-Raised Eggs",
      "Heirloom Tomatoes",
      "Red Bell Pepper",
      "Garlic",
      "Yellow Onion",
      "Feta Cheese",
      "Fresh Parsley",
      "Sourdough Bread",
      "Ground Cumin",
      "Smoked Paprika",
      "Extra-Virgin Olive Oil",
    ],
  },
  {
    id: "japanese-pantry",
    name: "East Asian Umami Pantry",
    description: "Salmon, white miso, jasmine rice, bok choy, ginger, scallions, and sesame.",
    ingredients: [
      "Salmon Fillet",
      "White Miso Paste",
      "Jasmine Rice",
      "Baby Bok Choy",
      "Scallions",
      "Ginger",
      "Soy Sauce",
      "Toasted Sesame Oil",
      "Rice Vinegar",
      "Honey",
    ],
  },
  {
    id: "italian-trattoria",
    name: "Northern Italian Trattoria",
    description: "Tagliatelle, butter, Meyer lemon, Parmigiano-Reggiano, sage, and pine nuts.",
    ingredients: [
      "Tagliatelle Pasta",
      "Unsalted Butter",
      "Meyer Lemon",
      "Parmigiano-Reggiano",
      "Fresh Sage",
      "Pine Nuts",
      "Garlic",
      "Extra-Virgin Olive Oil",
    ],
  },
  {
    id: "plant-harvest",
    name: "Plant-Based Harvest Table",
    description: "Cauliflower, tahini, sumac, herbs, lemon, pomegranate, and toasted almonds.",
    ingredients: [
      "Cauliflower",
      "Tahini",
      "Sumac",
      "Meyer Lemon",
      "Fresh Parsley",
      "Fresh Cilantro",
      "Garlic",
      "Pomegranate Seeds",
      "Slivered Almonds",
      "Extra-Virgin Olive Oil",
      "Ground Cumin",
    ],
  },
];

export const CURATED_RECIPES: Recipe[] = [
  {
    id: "spiced-cast-iron-shakshuka",
    title: "Spiced Cast-Iron Shakshuka with Herbed Feta",
    subtitle:
      "Eggs gently poached in a jammy, cumin-scented heirloom tomato and roasted red pepper reduction, finished with sheep's milk feta and charred sourdough.",
    cuisine: "Levantine",
    mealType: "Breakfast & Brunch",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    difficulty: "Effortless",
    servings: 2,
    dietaryTags: ["Vegetarian", "High-Protein"],
    flavorProfile: "Warmly spiced, smoky, tangy, and rich",
    chefNote:
      "Sweating the tomato paste and spices in olive oil for 90 seconds before adding the fresh tomatoes unlocks fat-soluble aromatics and removes raw acidity.",
    zeroWasteTip:
      "Finely chop the tender parsley stems and sauté them alongside the onions and bell peppers instead of discarding them.",
    pairingSuggestion: "Mint-steeped green tea or a chilled dry rosé.",
    nutrition: {
      calories: 490,
      proteinGrams: 22,
      carbsGrams: 34,
      fatGrams: 28,
    },
    ingredients: [
      {
        name: "Pasture-Raised Eggs",
        amount: 4,
        unit: "large",
        preparation: "room temperature",
      },
      {
        name: "Heirloom Tomatoes",
        amount: 450,
        unit: "g",
        preparation: "roughly chopped with juices",
        substitutionNote: "Substitute 1 can (400g) whole peeled San Marzano tomatoes.",
      },
      {
        name: "Red Bell Pepper",
        amount: 1,
        unit: "medium",
        preparation: "diced into 1cm pieces",
      },
      {
        name: "Yellow Onion",
        amount: 1,
        unit: "small",
        preparation: "thinly sliced",
      },
      {
        name: "Garlic",
        amount: 3,
        unit: "cloves",
        preparation: "finely grated",
      },
      {
        name: "Feta Cheese",
        amount: 75,
        unit: "g",
        preparation: "coarsely crumbled",
        substitutionNote: "Substitute dollop of Greek Yogurt or goat cheese.",
      },
      {
        name: "Ground Cumin",
        amount: 1.5,
        unit: "tsp",
        preparation: "freshly toasted if whole",
      },
      {
        name: "Smoked Paprika",
        amount: 1,
        unit: "tsp",
      },
      {
        name: "Fresh Parsley",
        amount: 15,
        unit: "g",
        preparation: "leaves and tender stems chopped",
      },
      {
        name: "Sourdough Bread",
        amount: 2,
        unit: "thick slices",
        preparation: "charred with olive oil",
      },
      {
        name: "Extra-Virgin Olive Oil",
        amount: 2,
        unit: "tbsp",
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Sweat the Aromatics",
        instruction:
          "Warm extra-virgin olive oil in a 26cm cast-iron skillet over medium heat. Add sliced yellow onion, diced red bell pepper, and chopped parsley stems with a pinch of sea salt. Cook until softened and lightly caramelized at the edges.",
        durationMinutes: 7,
        techniqueTip:
          "Keep heat moderate so the onions turn translucent and sweet rather than brittle.",
      },
      {
        stepNumber: 2,
        title: "Bloom the Spices",
        instruction:
          "Stir in grated garlic, ground cumin, and smoked paprika. Cook while stirring constantly until fragrant and brick-red.",
        durationMinutes: 2,
        techniqueTip:
          "Spices burn quickly in dry heat; have your chopped tomatoes ready beside the stove.",
      },
      {
        stepNumber: 3,
        title: "Simmer the Tomato Reduction",
        instruction:
          "Add the chopped heirloom tomatoes and their juices. Simmer briskly, crushing larger tomato pieces with the back of a wooden spoon, until thickened into a spoon-coating ragù.",
        durationMinutes: 6,
      },
      {
        stepNumber: 4,
        title: "Poach Eggs & Finish with Feta",
        instruction:
          "Make 4 shallow wells in the sauce and crack an egg into each. Scatter crumbled feta around the skillet, cover loosely, and simmer on low until egg whites are opaque but yolks remain runny. Scatter fresh parsley and serve immediately with charred sourdough.",
        durationMinutes: 5,
        techniqueTip:
          "Remove the skillet from heat 30 seconds early—the cast iron retains enough residual heat to finish setting the whites.",
      },
    ],
  },
  {
    id: "caramelized-miso-salmon-bowl",
    title: "Caramelized White Miso Salmon with Charred Bok Choy",
    subtitle:
      "Center-cut salmon fillet lacquered in sweet white miso, honey, and ginger, broiled until blistered and served over fragrant jasmine rice with sesame-charred baby bok choy.",
    cuisine: "Modern Japanese",
    mealType: "Weeknight Dinner",
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    difficulty: "Effortless",
    servings: 2,
    dietaryTags: ["High-Protein", "Dairy-Free"],
    flavorProfile: "Savory umami, caramelized, ginger-bright, and toasted sesame",
    chefNote:
      "Miso sugars caramelize rapidly under high broiler heat. Position your oven rack 15cm below the heating element for a mahogany glaze while keeping the center medium-rare.",
    zeroWasteTip:
      "Steep the peeled ginger skins and scallion root trimmings in the rice cooking water to infuse subtle aromatic complexity.",
    pairingSuggestion: "Chilled Junmai Ginjo sake or roasted barley tea.",
    nutrition: {
      calories: 580,
      proteinGrams: 38,
      carbsGrams: 46,
      fatGrams: 24,
    },
    ingredients: [
      {
        name: "Salmon Fillet",
        amount: 360,
        unit: "g",
        preparation: "two 180g center-cut fillets, patted dry",
      },
      {
        name: "White Miso Paste",
        amount: 2,
        unit: "tbsp",
      },
      {
        name: "Honey",
        amount: 1,
        unit: "tbsp",
        substitutionNote: "Substitute maple syrup or brown sugar.",
      },
      {
        name: "Soy Sauce",
        amount: 1,
        unit: "tbsp",
      },
      {
        name: "Rice Vinegar",
        amount: 1,
        unit: "tbsp",
        substitutionNote: "Substitute fresh Meyer lemon juice.",
      },
      {
        name: "Ginger",
        amount: 15,
        unit: "g",
        preparation: "finely grated",
      },
      {
        name: "Baby Bok Choy",
        amount: 300,
        unit: "g",
        preparation: "halved lengthwise and rinsed",
      },
      {
        name: "Jasmine Rice",
        amount: 160,
        unit: "g",
        preparation: "rinsed until water runs clear",
      },
      {
        name: "Scallions",
        amount: 3,
        unit: "stalks",
        preparation: "thinly sliced on a sharp bias",
      },
      {
        name: "Toasted Sesame Oil",
        amount: 2,
        unit: "tsp",
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Steam the Jasmine Rice",
        instruction:
          "Combine rinsed jasmine rice with 240ml water and a pinch of salt in a small heavy-bottomed pot. Bring to a boil, cover tightly, reduce heat to lowest setting, and cook for 10 minutes, then rest off-heat for 5 minutes.",
        durationMinutes: 10,
      },
      {
        stepNumber: 2,
        title: "Whisk the Miso Lacquer",
        instruction:
          "In a small bowl, whisk together white miso paste, honey, soy sauce, rice vinegar, grated ginger, and 1 teaspoon toasted sesame oil until smooth and glossy. Brush generously over the top and sides of the salmon fillets.",
        durationMinutes: 3,
      },
      {
        stepNumber: 3,
        title: "Broil Salmon & Bok Choy",
        instruction:
          "Arrange the glazed salmon skin-side down on a foil-lined sheet pan alongside halved baby bok choy tossed with the remaining sesame oil. Broil on high until the salmon surface is bubbling and deeply caramelized and bok choy leaves are crisp-tender.",
        durationMinutes: 7,
        techniqueTip:
          "Watch closely during the final 90 seconds so the miso blisters into dark amber spots without charring.",
      },
      {
        stepNumber: 4,
        title: "Assemble the Ceramic Bowls",
        instruction:
          "Fluff the steamed jasmine rice into warm bowls, top with the caramelized salmon fillet and charred baby bok choy, spoon over any pan juices, and garnish generously with bias-cut scallions.",
        durationMinutes: 2,
      },
    ],
  },
  {
    id: "meyer-lemon-brown-butter-pasta",
    title: "Meyer Lemon Brown Butter Tagliatelle with Crispy Sage",
    subtitle:
      "Silky ribbon pasta emulsified in nutty toasted milk-solid butter, Meyer lemon zest, frizzled sage leaves, toasted pine nuts, and aged Parmigiano-Reggiano.",
    cuisine: "Northern Italian",
    mealType: "Weeknight Dinner",
    prepTimeMinutes: 5,
    cookTimeMinutes: 12,
    difficulty: "Intermediate",
    servings: 2,
    dietaryTags: ["Vegetarian"],
    flavorProfile: "Nutty hazelnut butter, bright citrus, herbal sage, and savory umami",
    chefNote:
      "Starchy pasta cooking water is the secret binder that transforms separated brown butter and cheese into a glossy, restaurant-grade emulsion.",
    zeroWasteTip:
      "Save your Parmigiano-Reggiano rinds in the freezer to simmer in vegetable broths or minestrone.",
    pairingSuggestion: "Crisp Pinot Grigio or sparkling mineral water with lemon peel.",
    nutrition: {
      calories: 610,
      proteinGrams: 19,
      carbsGrams: 58,
      fatGrams: 34,
    },
    ingredients: [
      {
        name: "Tagliatelle Pasta",
        amount: 220,
        unit: "g",
      },
      {
        name: "Unsalted Butter",
        amount: 55,
        unit: "g",
        preparation: "cut into even cubes",
      },
      {
        name: "Meyer Lemon",
        amount: 1,
        unit: "whole",
        preparation: "finely zested and juiced (2 tbsp juice)",
      },
      {
        name: "Fresh Sage",
        amount: 16,
        unit: "leaves",
        preparation: "wiped dry",
      },
      {
        name: "Pine Nuts",
        amount: 30,
        unit: "g",
        substitutionNote: "Substitute slivered almonds or crushed walnuts.",
      },
      {
        name: "Parmigiano-Reggiano",
        amount: 60,
        unit: "g",
        preparation: "finely grated with a microplane",
      },
      {
        name: "Garlic",
        amount: 1,
        unit: "clove",
        preparation: "lightly smashed in skin",
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Boil Tagliatelle in Less Water",
        instruction:
          "Bring a shallow wide pot of salted water to a boil (use 2 liters instead of 4 to concentrate pasta starch). Cook tagliatelle until 1 minute shy of al dente, reserving 180ml of starchy cooking water.",
        durationMinutes: 6,
      },
      {
        stepNumber: 2,
        title: "Brown the Butter & Frizzle Sage",
        instruction:
          "Melt unsalted butter with the smashed garlic clove in a wide stainless steel skillet over medium heat. Add pine nuts and fresh sage leaves; swirl the pan as the butter foams and milk solids toast to a golden hazelnut color.",
        durationMinutes: 4,
        techniqueTip:
          "Use a light-colored pan so you can monitor the exact moment the milk solids turn amber.",
      },
      {
        stepNumber: 3,
        title: "Emulsify with Pasta Water & Lemon",
        instruction:
          "Remove the garlic clove, ladle in 80ml starchy pasta water, and transfer the tagliatelle directly into the skillet. Toss vigorously over low heat, adding Meyer lemon zest, lemon juice, and finely grated Parmigiano-Reggiano in stages until a glossy sauce coats every strand.",
        durationMinutes: 2,
      },
    ],
  },
  {
    id: "sumac-roasted-cauliflower-tahini",
    title: "Sumac-Roasted Cauliflower Steak with Herb Green Tahini",
    subtitle:
      "Thick-cut cauliflower slabs roasted until deeply burnished with cumin and citrusy sumac, plated over whipped cilantro-parsley tahini with pomegranate and toasted almonds.",
    cuisine: "Eastern Mediterranean",
    mealType: "Weeknight Dinner",
    prepTimeMinutes: 12,
    cookTimeMinutes: 25,
    difficulty: "Effortless",
    servings: 2,
    dietaryTags: ["Vegetarian", "Gluten-Free", "Dairy-Free"],
    flavorProfile: "Earthy roasted brassica, nutty sesame, bright herb, and tart ruby fruit",
    chefNote:
      "Preheating your heavy baking sheet inside the oven for 10 minutes before laying down the cauliflower steaks creates an immediate sear that rivals a cast-iron plancha.",
    zeroWasteTip:
      "Roast the outer cauliflower florets and tender inner leaves alongside the steaks for a crispy salad topping the next day.",
    pairingSuggestion: "Dry Assyrtiko white wine or sparkling hibiscus infusion.",
    nutrition: {
      calories: 440,
      proteinGrams: 13,
      carbsGrams: 29,
      fatGrams: 32,
    },
    ingredients: [
      {
        name: "Cauliflower",
        amount: 1,
        unit: "large head",
        preparation: "sliced through the core into two 2.5cm steaks",
      },
      {
        name: "Tahini",
        amount: 75,
        unit: "g",
        preparation: "well-stirred",
      },
      {
        name: "Sumac",
        amount: 2,
        unit: "tsp",
      },
      {
        name: "Ground Cumin",
        amount: 1,
        unit: "tsp",
      },
      {
        name: "Meyer Lemon",
        amount: 1,
        unit: "whole",
        preparation: "juiced (3 tbsp)",
      },
      {
        name: "Fresh Parsley",
        amount: 20,
        unit: "g",
      },
      {
        name: "Fresh Cilantro",
        amount: 20,
        unit: "g",
      },
      {
        name: "Garlic",
        amount: 1,
        unit: "clove",
      },
      {
        name: "Pomegranate Seeds",
        amount: 45,
        unit: "g",
      },
      {
        name: "Slivered Almonds",
        amount: 30,
        unit: "g",
        preparation: "lightly toasted in a dry pan",
      },
      {
        name: "Extra-Virgin Olive Oil",
        amount: 3,
        unit: "tbsp",
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Season & Sear the Cauliflower Steaks",
        instruction:
          "Preheat oven to 220°C (425°F) with a heavy sheet pan inside. Brush both sides of the cauliflower steaks with extra-virgin olive oil, ground cumin, 1 tsp sumac, and flaky salt. Place carefully onto the hot pan and roast for 15 minutes, then flip and roast 10 minutes more until tender in the core and caramelized at the florets.",
        durationMinutes: 25,
      },
      {
        stepNumber: 2,
        title: "Whip the Herb Green Tahini",
        instruction:
          "While the cauliflower roasts, blend tahini, Meyer lemon juice, garlic clove, fresh parsley, fresh cilantro, 4 tablespoons ice-cold water, and a pinch of salt until smooth, pale emerald, and spoonable.",
        durationMinutes: 4,
        techniqueTip:
          "Ice water shocks the tahini emulsion so it whips up light and creamy rather than seizing.",
      },
      {
        stepNumber: 3,
        title: "Plate & Garnish",
        instruction:
          "Swoosh the herb green tahini across a warm stoneware platter, lay the roasted cauliflower steaks on top, and scatter with ruby pomegranate seeds, toasted slivered almonds, and the remaining sumac.",
        durationMinutes: 2,
      },
    ],
  },
];

// Helper function to compute live pantry match against a recipe
export function evaluateRecipeMatch(
  recipe: Recipe,
  pantrySet: Set<string>
): {
  matchPercentage: number;
  haveCount: number;
  missingCount: number;
  evaluatedIngredients: RecipeIngredient[];
} {
  const normalizedPantry = Array.from(pantrySet).map((i) =>
    i.toLowerCase().trim()
  );

  const evaluatedIngredients = recipe.ingredients.map((ing) => {
    const ingLower = ing.name.toLowerCase().trim();
    const isMatched = normalizedPantry.some(
      (p) =>
        p === ingLower ||
        ingLower.includes(p) ||
        p.includes(ingLower) ||
        (p.includes("egg") && ingLower.includes("egg")) ||
        (p.includes("tomato") && ingLower.includes("tomato")) ||
        (p.includes("lemon") && ingLower.includes("lemon")) ||
        (p.includes("onion") && ingLower.includes("onion")) ||
        (p.includes("olive oil") && ingLower.includes("olive oil")) ||
        (p.includes("butter") && ingLower.includes("butter")) ||
        (p.includes("parmigiano") && ingLower.includes("parmesan")) ||
        (p.includes("pasta") &&
          (ingLower.includes("pasta") ||
            ingLower.includes("tagliatelle") ||
            ingLower.includes("spaghetti")))
    );
    return {
      ...ing,
      inPantry: isMatched,
    };
  });

  const haveCount = evaluatedIngredients.filter((i) => i.inPantry).length;
  const totalCount = Math.max(1, evaluatedIngredients.length);
  const matchPercentage = Math.round((haveCount / totalCount) * 100);

  return {
    matchPercentage,
    haveCount,
    missingCount: totalCount - haveCount,
    evaluatedIngredients,
  };
}
