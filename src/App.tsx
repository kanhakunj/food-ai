import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  X,
  Sparkles,
  Camera,
  Bookmark,
  ShoppingBag,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import {
  Recipe,
  ShoppingItem,
  SubstitutionResponse,
  HERO_IMAGE_URL,
  PANTRY_CATEGORIES,
  ALL_KNOWN_INGREDIENTS,
  PANTRY_PRESETS,
  CURATED_RECIPES,
  evaluateRecipeMatch,
} from "./data/culinaryData";
import { RecipeImage } from "./components/RecipeImage";
import { RecipeDetailModal } from "./components/RecipeDetailModal";
import { FridgeScannerModal } from "./components/FridgeScannerModal";
import { SavedMenuDrawer } from "./components/SavedMenuDrawer";

export function App() {
  // Active Pantry State (initialized with the Levantine & Mediterranean Larder preset)
  const [pantryItems, setPantryItems] = useState<string[]>(
    PANTRY_PRESETS[0].ingredients
  );
  const [ingredientInput, setIngredientInput] = useState<string>("");
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("produce");

  // Recommendation & Filter Constraints
  const [selectedMealType, setSelectedMealType] = useState<string>("All Meals");
  const [maxTimeMinutes, setMaxTimeMinutes] = useState<number>(60);
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [cravingNote, setCravingNote] = useState<string>("");
  const [recipeSearchQuery, setRecipeSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"match" | "time" | "calories">("match");

  // Recipes State (Curated + AI-Synthesized)
  const [recipes, setRecipes] = useState<Recipe[]>(CURATED_RECIPES);
  const [aiSynthesisSummary, setAiSynthesisSummary] = useState<string>("");
  const [isGeneratingRecipes, setIsGeneratingRecipes] =
    useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Active Recipe Detail Modal State
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Visual Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  // Saved Menu & Shopping List Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([
    "spiced-cast-iron-shakshuka",
  ]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  // Standalone Substitution Lab State
  const [subIngredientInput, setSubIngredientInput] =
    useState<string>("Heavy Cream");
  const [subDishContext, setSubDishContext] = useState<string>(
    "Pan Sauce or Creamy Pasta"
  );
  const [subLabLoading, setSubLabLoading] = useState<boolean>(false);
  const [subLabError, setSubLabError] = useState<string | null>(null);
  const [subLabResult, setSubLabResult] = useState<SubstitutionResponse | null>({
    originalRole: "Emulsified Dairy Fat, Silkiness & Acid Buffering",
    substitutions: [
      {
        substituteName: "Greek Yogurt + Unsalted Butter",
        usesAvailablePantry: true,
        ratioText: "3/4 cup Greek yogurt + 1/4 cup melted butter per 1 cup cream",
        flavorImpact:
          "Adds a subtle cultured tang while preserving rich mouthfeel; temper off-heat so proteins do not curdle.",
        bestFor: "Pan sauces, braises, and warm pasta finishes",
      },
      {
        substituteName: "Starchy Pasta Water + Finely Grated Parmigiano + Butter",
        usesAvailablePantry: true,
        ratioText: "1/2 cup starchy water + 40g butter + 30g cheese",
        flavorImpact:
          "Creates a glossy, restaurant-style emulsion with deeper savory umami and lighter viscosity.",
        bestFor: "Tagliatelle, skillet vegetables, and risottos",
      },
      {
        substituteName: "Whipped Tahini + Cold Water Emulsion",
        usesAvailablePantry: true,
        ratioText: "2 tbsp tahini whisked with 6 tbsp cold water",
        flavorImpact:
          "Dairy-free, nutty sesame richness that thickens sauces naturally under gentle heat.",
        bestFor: "Roasted vegetables, grain bowls, and savory stews",
      },
    ],
  });

  const pantrySet = useMemo(() => new Set(pantryItems), [pantryItems]);

  // Autocomplete suggestions for ingredient search input
  const autocompleteSuggestions = useMemo(() => {
    const q = ingredientInput.trim().toLowerCase();
    if (!q) return [];
    return ALL_KNOWN_INGREDIENTS.filter(
      (item) => item.toLowerCase().includes(q) && !pantrySet.has(item)
    ).slice(0, 6);
  }, [ingredientInput, pantrySet]);

  const handleToggleIngredient = (ingredientName: string) => {
    setPantryItems((prev) =>
      prev.includes(ingredientName)
        ? prev.filter((i) => i !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  const handleAddCustomIngredient = (e?: React.FormEvent, explicitItem?: string) => {
    if (e) e.preventDefault();
    const raw = (explicitItem ?? ingredientInput).trim();
    if (!raw) return;
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setPantryItems((prev) => {
      const next = [...prev];
      for (const part of parts) {
        const formatted =
          part.charAt(0).toUpperCase() + part.slice(1);
        if (!next.some((existing) => existing.toLowerCase() === formatted.toLowerCase())) {
          next.push(formatted);
        }
      }
      return next;
    });
    setIngredientInput("");
  };

  const handleAddMultipleIngredients = (newItems: string[]) => {
    setPantryItems((prev) => {
      const next = [...prev];
      for (const item of newItems) {
        const clean = item.trim();
        if (
          clean &&
          !next.some((existing) => existing.toLowerCase() === clean.toLowerCase())
        ) {
          next.push(clean);
        }
      }
      return next;
    });
  };

  const handleToggleDietary = (tag: string) => {
    setDietaryFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Evaluate and sort recipes based on live pantry match and active filters
  const evaluatedRecipes = useMemo(() => {
    return recipes
      .map((recipe) => {
        const match = evaluateRecipeMatch(recipe, pantrySet);
        return {
          recipe,
          ...match,
        };
      })
      .filter(({ recipe }) => {
        if (
          selectedMealType !== "All Meals" &&
          recipe.mealType.toLowerCase() !== selectedMealType.toLowerCase()
        ) {
          return false;
        }
        const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
        if (maxTimeMinutes < 60 && totalTime > maxTimeMinutes) {
          return false;
        }
        if (dietaryFilters.length > 0) {
          const recipeTagsLower = (recipe.dietaryTags || []).map((t) =>
            t.toLowerCase()
          );
          const allMatched = dietaryFilters.every((df) =>
            recipeTagsLower.some((rt) => rt.includes(df.toLowerCase()))
          );
          if (!allMatched) return false;
        }
        if (recipeSearchQuery.trim()) {
          const q = recipeSearchQuery.toLowerCase();
          const inTitle = recipe.title.toLowerCase().includes(q);
          const inCuisine = recipe.cuisine.toLowerCase().includes(q);
          const inIngredients = recipe.ingredients.some((i) =>
            i.name.toLowerCase().includes(q)
          );
          if (!inTitle && !inCuisine && !inIngredients) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "match") {
          return b.matchPercentage - a.matchPercentage;
        }
        if (sortBy === "time") {
          return (
            a.recipe.prepTimeMinutes +
            a.recipe.cookTimeMinutes -
            (b.recipe.prepTimeMinutes + b.recipe.cookTimeMinutes)
          );
        }
        return a.recipe.nutrition.calories - b.recipe.nutrition.calories;
      });
  }, [
    recipes,
    pantrySet,
    selectedMealType,
    maxTimeMinutes,
    dietaryFilters,
    recipeSearchQuery,
    sortBy,
  ]);

  // Call Server-Side Gemini AI Endpoint to Synthesize Custom Recipes
  const handleSynthesizeAiRecipes = async () => {
    if (pantryItems.length === 0) {
      setGenerationError(
        "Please add at least one ingredient to your pantry before synthesizing recipes."
      );
      return;
    }

    setIsGeneratingRecipes(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: pantryItems,
          dietary: dietaryFilters,
          mealType: selectedMealType,
          maxTimeMinutes,
          skillLevel: "Intermediate",
          cravingNote,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate AI recipe recommendations."
        );
      }

      const generatedList: Recipe[] = (data.recipes || []).map(
        (r: Recipe, idx: number) => ({
          ...r,
          id: `ai-recipe-${Date.now()}-${idx}`,
          isAiGenerated: true,
        })
      );

      if (generatedList.length > 0) {
        setRecipes((prev) => [...generatedList, ...prev]);
        setAiSynthesisSummary(data.chefSynthesisSummary || "");
        setRecipeSearchQuery("");
        setSortBy("match");
        const recSection = document.getElementById("recommendations");
        recSection?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err: unknown) {
      setGenerationError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while synthesizing recipes."
      );
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  // Run Standalone Substitution Lab Query
  const handleRunSubstitutionLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subIngredientInput.trim()) return;
    setSubLabLoading(true);
    setSubLabError(null);

    try {
      const response = await fetch("/api/substitute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missingIngredient: subIngredientInput.trim(),
          recipeContext: subDishContext.trim() || "Savory Home Cooking",
          availableIngredients: pantryItems,
          dietary: dietaryFilters,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Could not generate culinary substitutions."
        );
      }
      setSubLabResult(data);
    } catch (err: unknown) {
      setSubLabError(
        err instanceof Error
          ? err.message
          : "Failed to query substitution service."
      );
    } finally {
      setSubLabLoading(false);
    }
  };

  // Saved Recipes & Shopping List Handlers
  const handleToggleSaveRecipe = (recipeId: string) => {
    setSavedRecipeIds((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const handleAddMissingToShoppingList = (
    recipeTitle: string,
    missingIngredients: Array<{ name: string; amountText: string }>
  ) => {
    setShoppingList((prev) => {
      const next = [...prev];
      for (const item of missingIngredients) {
        const exists = next.some(
          (existing) =>
            existing.name.toLowerCase() === item.name.toLowerCase() &&
            !existing.checked
        );
        if (!exists) {
          next.push({
            id: `shop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: item.name,
            amountText: item.amountText,
            fromRecipeTitle: recipeTitle,
            checked: false,
          });
        }
      }
      return next;
    });
  };

  const handleToggleShoppingItem = (itemId: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleRemoveShoppingItem = (itemId: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleAddCustomShoppingItem = (name: string, amountText: string) => {
    setShoppingList((prev) => [
      ...prev,
      {
        id: `shop-${Date.now()}`,
        name,
        amountText,
        fromRecipeTitle: "Pantry Staple",
        checked: false,
      },
    ]);
  };

  const handleClearCheckedShoppingItems = () => {
    setShoppingList((prev) => prev.filter((item) => !item.checked));
  };

  const savedRecipesList = useMemo(
    () => recipes.filter((r) => savedRecipeIds.includes(r.id)),
    [recipes, savedRecipeIds]
  );

  const activeRecipeEvaluation = useMemo(() => {
    if (!selectedRecipe) return null;
    return evaluateRecipeMatch(selectedRecipe, pantrySet);
  }, [selectedRecipe, pantrySet]);

  const currentCategoryObj =
    PANTRY_CATEGORIES.find((c) => c.id === activeCategoryTab) ||
    PANTRY_CATEGORIES[0];

  const uncheckedShoppingCount = shoppingList.filter((i) => !i.checked).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#18181B]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-[#E5E4DF] px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Zone 1: Single text element Brand Wordmark */}
          <a
            href="#top"
            className="font-serif-display text-xl font-semibold tracking-tight text-[#18181B] whitespace-nowrap"
          >
            PantryPal
          </a>

          {/* Zone 2: 4 Clean Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#52525B]">
            <a
              href="#pantry-studio"
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Pantry Studio
            </a>
            <a
              href="#recommendations"
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Recommendations
            </a>
            <a
              href="#substitution-lab"
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Substitution Lab
            </a>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Shopping List
            </button>
          </nav>

          {/* Zone 3: 2 Primary Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#18181B] bg-white border border-[#D4D2CD] hover:border-[#18181B] rounded-lg transition-colors whitespace-nowrap"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Fridge</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap font-mono tabular-nums"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                Menu & List ({savedRecipesList.length + uncheckedShoppingCount})
              </span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Section 1: Editorial Split Hero + Live Pantry Status */}
        <section className="border-b border-[#E5E4DF]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left 7 Cols: Editorial Copy & Quick Ingredient Entry */}
              <div className="lg:col-span-7 space-y-6">
                <div className="text-xs text-[#52525B] font-mono tabular-nums">
                  <span>Ingredient-First Culinary Intelligence</span>
                  <span aria-hidden="true"> · </span>
                  <span>{pantryItems.length} Active Kitchen Ingredients</span>
                  <span aria-hidden="true"> · </span>
                  <span>Zero Waste Generation</span>
                </div>

                <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold text-[#18181B] tracking-tight leading-[1.12] text-balance max-w-2xl">
                  Cook extraordinary meals from the ingredients already in your
                  kitchen.
                </h1>

                <p className="text-base text-[#52525B] leading-relaxed max-w-xl">
                  Catalog what is inside your refrigerator and pantry. PantryPal
                  scores recipes by real-time ingredient overlap, synthesizes
                  bespoke dishes around your exact inventory, and formulates
                  smart culinary substitutions for anything you are missing.
                </p>

                {/* Primary Ingredient Quick-Add & AI Synthesis Bar */}
                <div className="pt-2 max-w-xl space-y-3">
                  <form
                    onSubmit={(e) => handleAddCustomIngredient(e)}
                    className="relative flex flex-col sm:flex-row gap-2.5"
                  >
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        placeholder="Add ingredients you have (e.g., Eggs, Garlic, Lemon, Miso)..."
                        aria-label="Add ingredients to your pantry"
                        className="w-full pl-10 pr-20 py-3 text-sm bg-white border border-[#D4D2CD] rounded-lg focus:outline-none focus:border-[#1E3A2F] text-[#18181B] placeholder:text-[#71717A]"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium text-[#18181B] bg-[#F3F2EE] hover:bg-[#E5E4DF] rounded-md transition-colors whitespace-nowrap"
                      >
                        + Add
                      </button>

                      {/* Autocomplete Dropdown */}
                      {autocompleteSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-[#D4D2CD] rounded-lg shadow-lg divide-y divide-[#E5E4DF]">
                          {autocompleteSuggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() =>
                                handleAddCustomIngredient(undefined, sug)
                              }
                              className="w-full px-4 py-2.5 text-left text-xs text-[#18181B] hover:bg-[#FAF9F6] flex items-center justify-between"
                            >
                              <span>{sug}</span>
                              <span className="text-[#71717A]">
                                Add to pantry
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSynthesizeAiRecipes}
                      disabled={isGeneratingRecipes || pantryItems.length === 0}
                      className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      <Sparkles
                        className={`w-4 h-4 ${
                          isGeneratingRecipes ? "animate-spin" : ""
                        }`}
                      />
                      <span>
                        {isGeneratingRecipes
                          ? "Synthesizing Recipes..."
                          : "Synthesize AI Menu"}
                      </span>
                    </button>
                  </form>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#71717A]">
                    <span>Quick presets:</span>
                    {PANTRY_PRESETS.map((preset, idx) => (
                      <React.Fragment key={preset.id}>
                        {idx > 0 && <span aria-hidden="true">·</span>}
                        <button
                          type="button"
                          onClick={() => setPantryItems(preset.ingredients)}
                          className="text-[#18181B] hover:text-[#1E3A2F] underline underline-offset-2 transition-colors whitespace-nowrap"
                        >
                          {preset.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Culinary Feature Card */}
              <div className="lg:col-span-5">
                <div className="rounded-xl overflow-hidden border border-[#E5E4DF] bg-white shadow-sm">
                  <div className="aspect-16/9 w-full relative overflow-hidden bg-[#EFECE6]">
                    <img
                      src={HERO_IMAGE_URL}
                      alt="Pantry counter arranged with fresh culinary ingredients"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                      <span className="text-xs text-white/90 font-mono">
                        Pantry Ingredients Matching
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs text-[#52525B] font-mono tabular-nums">
                      <span>Highest Inventory Match</span>
                      <span className="text-[#1E3A2F] font-semibold">
                        {evaluatedRecipes[0]?.matchPercentage || 91}% Overlap
                      </span>
                    </div>
                    <div className="font-serif-display text-xl font-semibold text-[#18181B]">
                      {evaluatedRecipes[0]?.recipe.title || "Spiced Cast-Iron Shakshuka"}
                    </div>
                    <p className="text-xs text-[#52525B] leading-relaxed line-clamp-2">
                      {evaluatedRecipes[0]?.recipe.subtitle ||
                        "Eggs gently poached in a jammy, cumin-scented heirloom tomato and roasted red pepper reduction."}
                    </p>
                    <div className="pt-2 border-t border-[#E5E4DF] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRecipe(
                            evaluatedRecipes[0]?.recipe || CURATED_RECIPES[0]
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A2F] hover:underline underline-offset-4"
                      >
                        <span>Open Cooking Studio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs text-[#71717A] font-mono tabular-nums">
                        {evaluatedRecipes[0]?.recipe.prepTimeMinutes +
                          evaluatedRecipes[0]?.recipe.cookTimeMinutes || 30}{" "}
                        min total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Pantry Studio & Constraint Controls */}
        <section
          id="pantry-studio"
          className="border-b border-[#E5E4DF] bg-white"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left 7 Cols: Categorized Pantry Inventory Builder */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <h2 className="font-serif-display text-2xl font-semibold text-[#18181B]">
                      01. Active Pantry & Kitchen Inventory
                    </h2>
                    <p className="text-xs text-[#71717A] mt-1">
                      Toggle ingredients you currently have on hand. Recipes
                      recalculate their match score instantaneously.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono font-semibold text-[#1E3A2F] tabular-nums">
                      {pantryItems.length} selected
                    </span>
                    {pantryItems.length > 0 && (
                      <>
                        <span className="text-[#D4D2CD]" aria-hidden="true">
                          ·
                        </span>
                        <button
                          type="button"
                          onClick={() => setPantryItems([])}
                          className="text-[#71717A] hover:text-[#18181B] flex items-center gap-1 whitespace-nowrap"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Clear All</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Category Tabs (Interactive Segmented Buttons) */}
                <div className="flex items-center gap-1 p-1 bg-[#F3F2EE] rounded-lg overflow-x-auto">
                  {PANTRY_CATEGORIES.map((cat) => {
                    const activeInCat = cat.items.filter((i) =>
                      pantrySet.has(i)
                    ).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategoryTab(cat.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 font-mono tabular-nums ${
                          activeCategoryTab === cat.id
                            ? "bg-white text-[#18181B] shadow-sm"
                            : "text-[#52525B] hover:text-[#18181B]"
                        }`}
                      >
                        <span className="font-sans">{cat.name}</span>{" "}
                        <span className="text-[11px] opacity-75">
                          ({activeInCat})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Ingredient Toggle Grid for Selected Category */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {currentCategoryObj.items.map((item) => {
                    const isSelected = pantrySet.has(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleIngredient(item)}
                        className={`px-3.5 py-2.5 text-xs font-medium rounded-lg border text-left flex items-center justify-between gap-2 transition-colors whitespace-nowrap ${
                          isSelected
                            ? "bg-[#1E3A2F] text-white border-[#1E3A2F]"
                            : "bg-[#FAF9F6] text-[#18181B] border-[#E5E4DF] hover:border-[#A1A1AA]"
                        }`}
                      >
                        <span className="truncate">{item}</span>
                        {isSelected ? (
                          <X className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 shrink-0 text-[#71717A]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active Pantry Summary Strip */}
                <div className="pt-4 border-t border-[#E5E4DF]">
                  <div className="text-xs font-semibold text-[#18181B] mb-2">
                    Your Current Kitchen Selection ({pantryItems.length})
                  </div>
                  {pantryItems.length === 0 ? (
                    <p className="text-xs text-[#71717A]">
                      No ingredients selected yet. Click items above, choose a
                      quick preset, or scan your kitchen items.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {pantryItems.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleToggleIngredient(item)}
                          title={`Remove ${item}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#F3F2EE] hover:bg-[#E5E4DF] text-[#18181B] rounded-md transition-colors whitespace-nowrap"
                        >
                          <span>{item}</span>
                          <X className="w-3 h-3 text-[#71717A]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right 5 Cols: Culinary Constraints & AI Synthesis Studio */}
              <div className="lg:col-span-5 lg:pl-8 lg:border-l border-[#E5E4DF] space-y-6">
                <div>
                  <h2 className="font-serif-display text-2xl font-semibold text-[#18181B]">
                    02. Culinary Parameters & AI Synthesis
                  </h2>
                  <p className="text-xs text-[#71717A] mt-1">
                    Set your time horizon, dietary boundaries, and flavor
                    cravings to filter the collection or generate bespoke
                    recipes.
                  </p>
                </div>

                {/* Meal Type Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#18181B]">
                    Meal Occasion
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#F3F2EE] rounded-lg">
                    {[
                      "All Meals",
                      "Breakfast & Brunch",
                      "Quick Lunch",
                      "Weeknight Dinner",
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedMealType(type)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap truncate ${
                          selectedMealType === type
                            ? "bg-white text-[#18181B] shadow-sm"
                            : "text-[#52525B] hover:text-[#18181B]"
                        }`}
                      >
                        {type === "Breakfast & Brunch"
                          ? "Brunch"
                          : type === "Weeknight Dinner"
                          ? "Dinner"
                          : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Cook Time Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#18181B]">
                      Maximum Total Time
                    </span>
                    <span className="font-mono text-[#1E3A2F] font-semibold tabular-nums">
                      {maxTimeMinutes >= 60
                        ? "Any duration"
                        : `≤ ${maxTimeMinutes} min`}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#F3F2EE] rounded-lg">
                    {[20, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setMaxTimeMinutes(mins)}
                        className={`px-3 py-1.5 text-xs font-mono tabular-nums font-medium rounded-md transition-colors whitespace-nowrap ${
                          maxTimeMinutes === mins
                            ? "bg-white text-[#18181B] shadow-sm"
                            : "text-[#52525B] hover:text-[#18181B]"
                        }`}
                      >
                        {mins === 60 ? "Any" : `${mins}m`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Preferences */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#18181B]">
                    Dietary Focus
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Vegetarian",
                      "High-Protein",
                      "Gluten-Free",
                      "Dairy-Free",
                    ].map((tag) => {
                      const active = dietaryFilters.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleDietary(tag)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                            active
                              ? "bg-[#1E3A2F] text-white border-[#1E3A2F]"
                              : "bg-[#FAF9F6] text-[#52525B] border-[#D4D2CD] hover:border-[#18181B]"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Craving / Chef Direction Note */}
                <div className="space-y-2">
                  <label
                    htmlFor="craving-input"
                    className="block text-xs font-semibold text-[#18181B]"
                  >
                    Optional Craving or Technique Direction
                  </label>
                  <input
                    id="craving-input"
                    type="text"
                    value={cravingNote}
                    onChange={(e) => setCravingNote(e.target.value)}
                    placeholder="e.g., One-skillet meal, extra crispy, bright citrus sauce..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#D4D2CD] rounded-lg focus:outline-none focus:border-[#1E3A2F] text-[#18181B]"
                  />
                </div>

                {/* Generate Custom AI Recipes Button */}
                <button
                  type="button"
                  onClick={handleSynthesizeAiRecipes}
                  disabled={isGeneratingRecipes || pantryItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  <Sparkles
                    className={`w-4 h-4 ${
                      isGeneratingRecipes ? "animate-spin" : ""
                    }`}
                  />
                  <span>
                    {isGeneratingRecipes
                      ? "Formulating 3 Custom Recipes from Your Ingredients..."
                      : `Generate 3 Custom AI Recipes (${pantryItems.length} Ingredients)`}
                  </span>
                </button>

                {generationError && (
                  <div className="p-3 rounded-lg border border-[#DC2626] bg-[#FEF2F2] text-xs text-[#DC2626]">
                    {generationError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Recommended Recipe Collection Grid */}
        <section id="recommendations" className="border-b border-[#E5E4DF]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16 space-y-8">
            {/* Section Header & Search/Sort Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5E4DF]">
              <div>
                <div className="text-xs text-[#52525B] font-mono tabular-nums mb-1">
                  Ranked by Ingredient Overlap · {evaluatedRecipes.length}{" "}
                  {evaluatedRecipes.length === 1 ? "Dish" : "Dishes"} Available
                </div>
                <h2 className="font-serif-display text-3xl font-semibold text-[#18181B] tracking-tight">
                  Tailored Recipe Recommendations
                </h2>
                {aiSynthesisSummary && (
                  <p className="mt-2 text-sm text-[#1E3A2F] max-w-2xl leading-relaxed">
                    {aiSynthesisSummary}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Live Search Filter */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={recipeSearchQuery}
                    onChange={(e) => setRecipeSearchQuery(e.target.value)}
                    placeholder="Filter by dish or ingredient..."
                    className="pl-8 pr-3 py-2 text-xs bg-white border border-[#D4D2CD] rounded-lg focus:outline-none focus:border-[#1E3A2F] w-52"
                  />
                </div>

                {/* Sort Segmented Control */}
                <div className="flex items-center gap-1 p-1 bg-[#F3F2EE] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSortBy("match")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      sortBy === "match"
                        ? "bg-white text-[#18181B] shadow-sm"
                        : "text-[#52525B] hover:text-[#18181B]"
                    }`}
                  >
                    Best Match
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("time")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      sortBy === "time"
                        ? "bg-white text-[#18181B] shadow-sm"
                        : "text-[#52525B] hover:text-[#18181B]"
                    }`}
                  >
                    Fastest
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("calories")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      sortBy === "calories"
                        ? "bg-white text-[#18181B] shadow-sm"
                        : "text-[#52525B] hover:text-[#18181B]"
                    }`}
                  >
                    Lightest
                  </button>
                </div>
              </div>
            </div>

            {/* Loading Skeleton State when AI is generating */}
            {isGeneratingRecipes && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-white border border-[#E5E4DF] rounded-xl overflow-hidden animate-pulse"
                  >
                    <div className="aspect-4/3 bg-[#EFECE6]" />
                    <div className="p-6 space-y-3">
                      <div className="h-3 w-2/3 bg-[#F3F2EE] rounded" />
                      <div className="h-6 w-5/6 bg-[#F3F2EE] rounded" />
                      <div className="h-12 w-full bg-[#F3F2EE] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State if filters exclude all recipes */}
            {!isGeneratingRecipes && evaluatedRecipes.length === 0 ? (
              <div className="bg-white border border-[#E5E4DF] rounded-xl p-12 text-center space-y-4">
                <SlidersHorizontal className="w-7 h-7 text-[#71717A] mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-serif-display text-xl font-semibold text-[#18181B]">
                    No Current Recipes Match Your Strict Filters
                  </h3>
                  <p className="text-xs text-[#71717A] max-w-md mx-auto">
                    Either relax your time/dietary filters or click Synthesize
                    AI Menu to formulate 3 custom recipes that strictly obey your
                    exact constraints.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMealType("All Meals");
                      setMaxTimeMinutes(60);
                      setDietaryFilters([]);
                      setRecipeSearchQuery("");
                    }}
                    className="px-4 py-2 text-xs font-medium text-[#18181B] bg-[#F3F2EE] hover:bg-[#E5E4DF] rounded-lg transition-colors whitespace-nowrap"
                  >
                    Reset Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleSynthesizeAiRecipes}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap"
                  >
                    Synthesize Custom AI Recipes
                  </button>
                </div>
              </div>
            ) : (
              /* 3-Column Featured Recipe Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {evaluatedRecipes.map(
                  ({
                    recipe,
                    matchPercentage,
                    haveCount,
                    missingCount,
                    evaluatedIngredients,
                  }) => {
                    const totalMinutes =
                      recipe.prepTimeMinutes + recipe.cookTimeMinutes;
                    const isSaved = savedRecipeIds.includes(recipe.id);
                    const matchedNames = evaluatedIngredients
                      .filter((i) => i.inPantry)
                      .map((i) => i.name)
                      .slice(0, 4);
                    const missingNames = evaluatedIngredients
                      .filter((i) => !i.inPantry)
                      .map((i) => i.name);

                    return (
                      <article
                        key={recipe.id}
                        className="group bg-white border border-[#E5E4DF] rounded-xl overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5"
                      >
                        {/* 4:3 Editorial Graphic / Image */}
                        <div
                          onClick={() => setSelectedRecipe(recipe)}
                          className="aspect-4/3 w-full bg-[#EFECE6] overflow-hidden cursor-pointer relative"
                        >
                          <RecipeImage
                            src={recipe.imageUrl}
                            title={recipe.title}
                            cuisine={recipe.cuisine}
                            className="w-full h-full"
                          />
                        </div>

                        {/* Card Body */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                          <div className="space-y-2.5">
                            {/* Zero-Pill Metadata Line */}
                            <div className="flex items-center flex-wrap gap-1.5 text-xs text-[#52525B] font-mono tabular-nums">
                              <span className="font-sans font-medium text-[#1E3A2F]">
                                {matchPercentage}% Match
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-sans">
                                {recipe.cuisine}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{totalMinutes} min</span>
                              <span aria-hidden="true">·</span>
                              <span>{recipe.nutrition.calories} kcal</span>
                            </div>

                            {/* Primary Title */}
                            <h3 className="font-serif-display text-xl font-semibold text-[#18181B] leading-snug group-hover:text-[#1E3A2F] transition-colors">
                              <button
                                type="button"
                                onClick={() => setSelectedRecipe(recipe)}
                                className="text-left"
                              >
                                {recipe.title}
                              </button>
                            </h3>

                            <p className="text-xs text-[#52525B] line-clamp-2 leading-relaxed">
                              {recipe.subtitle}
                            </p>
                          </div>

                          {/* Pantry Overlap Breakdown & Actions */}
                          <div className="pt-4 border-t border-[#E5E4DF] space-y-3">
                            <div className="text-xs space-y-1">
                              <div className="text-[#18181B] truncate">
                                <span className="font-semibold text-[#16A34A] font-mono tabular-nums">
                                  Have ({haveCount}):{" "}
                                </span>
                                <span className="text-[#52525B]">
                                  {matchedNames.length > 0
                                    ? matchedNames.join(", ")
                                    : "None selected"}
                                </span>
                              </div>

                              <div className="text-[#18181B] truncate">
                                <span className="font-semibold text-[#B45309] font-mono tabular-nums">
                                  Need ({missingCount}):{" "}
                                </span>
                                <span className="text-[#71717A]">
                                  {missingNames.length === 0
                                    ? "Ready to cook tonight"
                                    : missingNames.slice(0, 3).join(", ") +
                                      (missingNames.length > 3
                                        ? ` +${missingNames.length - 3} more`
                                        : "")}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setSelectedRecipe(recipe)}
                                className="px-3.5 py-2 text-xs font-medium text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap"
                              >
                                Cook & Scale
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleSaveRecipe(recipe.id)}
                                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                                  isSaved
                                    ? "bg-[#F3F2EE] text-[#18181B] border-[#18181B]"
                                    : "bg-white text-[#52525B] border-[#D4D2CD] hover:text-[#18181B]"
                                }`}
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>{isSaved ? "Saved" : "Save"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section 4: AI Culinary Substitution Lab */}
        <section
          id="substitution-lab"
          className="bg-white border-b border-[#E5E4DF]"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left 5 Cols: Substitution Form & Quick Triggers */}
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <div className="text-xs text-[#52525B] font-mono">
                    Culinary Chemistry & Ratio Converter
                  </div>
                  <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#18181B] mt-1 text-balance">
                    Missing a single ingredient mid-recipe?
                  </h2>
                  <p className="text-xs text-[#52525B] mt-2 leading-relaxed">
                    Enter any ingredient you are out of and the dish you are
                    preparing. The Substitution Lab evaluates fat, acid, umami,
                    and structural binding roles against your active{" "}
                    <span className="font-mono font-semibold tabular-nums">
                      {pantryItems.length}
                    </span>{" "}
                    pantry items.
                  </p>
                </div>

                <form onSubmit={handleRunSubstitutionLab} className="space-y-3">
                  <div>
                    <label
                      htmlFor="sub-ingredient"
                      className="block text-xs font-semibold text-[#18181B] mb-1"
                    >
                      Missing Ingredient
                    </label>
                    <input
                      id="sub-ingredient"
                      type="text"
                      value={subIngredientInput}
                      onChange={(e) => setSubIngredientInput(e.target.value)}
                      placeholder="e.g., Heavy Cream, White Miso, Buttermilk, Pine Nuts"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#D4D2CD] rounded-lg focus:outline-none focus:border-[#1E3A2F]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sub-context"
                      className="block text-xs font-semibold text-[#18181B] mb-1"
                    >
                      Dish or Cooking Application
                    </label>
                    <input
                      id="sub-context"
                      type="text"
                      value={subDishContext}
                      onChange={(e) => setSubDishContext(e.target.value)}
                      placeholder="e.g., Pan Sauce, Braised Stew, Salad Vinaigrette"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#D4D2CD] rounded-lg focus:outline-none focus:border-[#1E3A2F]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={subLabLoading || !subIngredientInput.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    <Sparkles
                      className={`w-3.5 h-3.5 ${
                        subLabLoading ? "animate-spin" : ""
                      }`}
                    />
                    <span>
                      {subLabLoading
                        ? "Calculating Ratios & Flavor Impact..."
                        : "Formulate Pantry Substitutions"}
                    </span>
                  </button>
                </form>

                {/* Quick Test Ingredient Buttons */}
                <div className="pt-2">
                  <span className="text-xs text-[#71717A] block mb-2">
                    Common missing ingredients:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { ing: "Heavy Cream", ctx: "Pasta Sauce or Soup" },
                      { ing: "White Miso Paste", ctx: "Glaze or Marinade" },
                      { ing: "Pine Nuts", ctx: "Brown Butter Pasta or Pesto" },
                      { ing: "Shallots", ctx: "Pan Sauce Aromatics" },
                      { ing: "Dry White Wine", ctx: "Deglazing Skillet" },
                    ].map((preset) => (
                      <button
                        key={preset.ing}
                        type="button"
                        onClick={() => {
                          setSubIngredientInput(preset.ing);
                          setSubDishContext(preset.ctx);
                        }}
                        className="px-2.5 py-1 text-xs bg-[#F3F2EE] hover:bg-[#E5E4DF] text-[#18181B] rounded-md transition-colors whitespace-nowrap"
                      >
                        {preset.ing}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: Substitution Output Table */}
              <div className="lg:col-span-7">
                {subLabError && (
                  <div className="p-4 rounded-lg border border-[#DC2626] bg-[#FEF2F2] text-xs text-[#DC2626] mb-4">
                    {subLabError}
                  </div>
                )}

                {subLabResult && (
                  <div className="bg-[#FAF9F6] border border-[#E5E4DF] rounded-xl p-6 space-y-5">
                    <div className="pb-4 border-b border-[#E5E4DF] flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <span className="text-xs text-[#71717A]">
                          Replacing{" "}
                        </span>
                        <span className="font-serif-display text-lg font-semibold text-[#18181B]">
                          {subIngredientInput}
                        </span>
                        <span className="text-xs text-[#71717A]">
                          {" "}
                          in {subDishContext}
                        </span>
                      </div>
                      <span className="text-xs text-[#1E3A2F] font-medium">
                        Role: {subLabResult.originalRole}
                      </span>
                    </div>

                    <div className="divide-y divide-[#E5E4DF]">
                      {subLabResult.substitutions.map((sub, idx) => (
                        <div
                          key={idx}
                          className="py-4 first:pt-0 last:pb-0 space-y-1.5"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="text-sm font-semibold text-[#18181B]">
                              0{idx + 1}. {sub.substituteName}
                            </h3>
                            <span className="font-mono text-xs font-semibold text-[#1E3A2F] tabular-nums">
                              {sub.ratioText}
                            </span>
                          </div>
                          <p className="text-xs text-[#52525B] leading-relaxed">
                            {sub.flavorImpact}
                          </p>
                          <div className="text-[11px] text-[#71717A]">
                            <span>Best application: {sub.bestFor}</span>
                            {sub.usesAvailablePantry && (
                              <>
                                <span aria-hidden="true"> · </span>
                                <span className="text-[#16A34A] font-medium">
                                  Available in your current pantry
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-[#FAF9F6] border-t border-[#E5E4DF] px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <div className="flex items-center gap-2">
            <span className="font-serif-display font-semibold text-[#18181B]">
              PantryPal
            </span>
            <span aria-hidden="true">·</span>
            <span>AI-Powered Recipe & Meal Recommendation Studio</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#pantry-studio"
              className="hover:text-[#18181B] transition-colors"
            >
              Pantry Studio
            </a>
            <a
              href="#recommendations"
              className="hover:text-[#18181B] transition-colors"
            >
              Recipes
            </a>
            <a
              href="#substitution-lab"
              className="hover:text-[#18181B] transition-colors"
            >
              Substitutions
            </a>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="hover:text-[#18181B] transition-colors"
            >
              Shopping List
            </button>
          </div>
        </div>
      </footer>

      {/* Contiguous Recipe Studio Modal */}
      {selectedRecipe && activeRecipeEvaluation && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          evaluatedIngredients={activeRecipeEvaluation.evaluatedIngredients}
          matchPercentage={activeRecipeEvaluation.matchPercentage}
          pantryList={pantryItems}
          dietaryFilters={dietaryFilters}
          isSaved={savedRecipeIds.includes(selectedRecipe.id)}
          onClose={() => setSelectedRecipe(null)}
          onToggleSave={handleToggleSaveRecipe}
          onAddMissingToShoppingList={handleAddMissingToShoppingList}
          onAddIngredientToPantry={(ingName) => {
            if (!pantrySet.has(ingName)) {
              setPantryItems((prev) => [...prev, ingName]);
            }
          }}
        />
      )}

      {/* Visual Fridge & Countertop Ingredient Scanner Modal */}
      <FridgeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddIngredients={handleAddMultipleIngredients}
      />

      {/* Saved Menu & Shopping List Drawer */}
      <SavedMenuDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        savedRecipes={savedRecipesList}
        pantrySet={pantrySet}
        shoppingList={shoppingList}
        onSelectRecipe={(r) => setSelectedRecipe(r)}
        onRemoveSavedRecipe={handleToggleSaveRecipe}
        onToggleShoppingItem={handleToggleShoppingItem}
        onRemoveShoppingItem={handleRemoveShoppingItem}
        onAddCustomShoppingItem={handleAddCustomShoppingItem}
        onClearCheckedShoppingItems={handleClearCheckedShoppingItems}
      />
    </div>
  );
}

export default App;
