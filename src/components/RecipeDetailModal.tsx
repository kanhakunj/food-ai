import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Minus,
  Check,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Bookmark,
} from "lucide-react";
import {
  Recipe,
  RecipeIngredient,
  SubstitutionOption,
} from "../data/culinaryData";
import { RecipeImage } from "./RecipeImage";

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  evaluatedIngredients: RecipeIngredient[];
  matchPercentage: number;
  pantryList: string[];
  dietaryFilters: string[];
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (recipeId: string) => void;
  onAddMissingToShoppingList: (
    recipeTitle: string,
    missingIngredients: Array<{ name: string; amountText: string }>
  ) => void;
  onAddIngredientToPantry: (ingredientName: string) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  evaluatedIngredients,
  matchPercentage,
  pantryList,
  dietaryFilters,
  isSaved,
  onClose,
  onToggleSave,
  onAddMissingToShoppingList,
  onAddIngredientToPantry,
}) => {
  const [servings, setServings] = useState<number>(2);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [addedToCartNotice, setAddedToCartNotice] = useState(false);

  // Kitchen Timer state
  const [activeTimerStep, setActiveTimerStep] = useState<number | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // AI Inline Substitution state
  const [subTargetIngredient, setSubTargetIngredient] = useState<string | null>(
    null
  );
  const [subLoading, setSubLoading] = useState<boolean>(false);
  const [subResults, setSubResults] = useState<{
    originalRole: string;
    substitutions: SubstitutionOption[];
  } | null>(null);
  const [subError, setSubError] = useState<string | null>(null);

  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings || 2);
      setCompletedSteps(new Set());
      setActiveTimerStep(null);
      setIsTimerRunning(false);
      setTimerSecondsLeft(0);
      setSubTargetIngredient(null);
      setSubResults(null);
      setSubError(null);
      setAddedToCartNotice(false);
    }
  }, [recipe]);

  useEffect(() => {
    if (!isTimerRunning || timerSecondsLeft <= 0) {
      if (timerSecondsLeft === 0 && isTimerRunning) {
        setIsTimerRunning(false);
      }
      return;
    }
    const interval = window.setInterval(() => {
      setTimerSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  if (!recipe) return null;

  const scaleFactor = servings / (recipe.servings || 2);

  const formatAmount = (amount: number): string => {
    const scaled = amount * scaleFactor;
    if (Number.isInteger(scaled)) return scaled.toString();
    return scaled.toFixed(1).replace(/\.0$/, "");
  };

  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleStartStepTimer = (stepNumber: number, minutes: number) => {
    if (activeTimerStep === stepNumber) {
      setIsTimerRunning((prev) => !prev);
    } else {
      setActiveTimerStep(stepNumber);
      setTimerSecondsLeft(minutes * 60);
      setIsTimerRunning(true);
    }
  };

  const handleResetTimer = (minutes: number) => {
    setIsTimerRunning(false);
    setTimerSecondsLeft(minutes * 60);
  };

  const toggleStepCompletion = (stepNumber: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };

  const missingIngredients = evaluatedIngredients.filter((ing) => !ing.inPantry);

  const handleAddMissing = () => {
    if (missingIngredients.length === 0) return;
    const formatted = missingIngredients.map((ing) => ({
      name: ing.name,
      amountText: `${formatAmount(ing.amount)} ${ing.unit}`,
    }));
    onAddMissingToShoppingList(recipe.title, formatted);
    setAddedToCartNotice(true);
    window.setTimeout(() => setAddedToCartNotice(false), 3000);
  };

  const handleFetchSubstitutions = async (ingredientName: string) => {
    if (subTargetIngredient === ingredientName && subResults) {
      setSubTargetIngredient(null);
      return;
    }
    setSubTargetIngredient(ingredientName);
    setSubLoading(true);
    setSubError(null);
    setSubResults(null);

    try {
      const res = await fetch("/api/substitute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missingIngredient: ingredientName,
          recipeContext: `${recipe.title} (${recipe.cuisine})`,
          availableIngredients: pantryList,
          dietary: dietaryFilters,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to fetch substitutions.");
      }
      setSubResults(data);
    } catch (err: unknown) {
      setSubError(
        err instanceof Error ? err.message : "Failed to load substitutions."
      );
    } finally {
      setSubLoading(false);
    }
  };

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-modal-title"
    >
      <div className="relative w-full max-w-6xl bg-[#FAF9F6] border border-[#E5E4DF] rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E4DF] bg-white shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#52525B] font-mono tabular-nums">
            <span>{recipe.cuisine}</span>
            <span aria-hidden="true">·</span>
            <span>{recipe.mealType}</span>
            <span aria-hidden="true">·</span>
            <span>{totalTime} min total</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-[#1E3A2F]">
              {matchPercentage}% Pantry Match
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleSave(recipe.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                isSaved
                  ? "bg-[#1E3A2F] text-white border-[#1E3A2F]"
                  : "bg-white text-[#18181B] border-[#D4D2CD] hover:border-[#18181B]"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? "Saved in Menu" : "Save to Menu"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close recipe studio"
              className="p-2 text-[#52525B] hover:text-[#18181B] rounded-lg hover:bg-[#F3F2EE] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Two-Column Content */}
        <div className="overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E4DF]">
          {/* Left Column: Visuals, Notes & Nutrition (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 space-y-8 bg-[#FAF9F6]">
            <div className="aspect-4/3 w-full rounded-lg overflow-hidden bg-[#EFECE6] border border-[#E5E4DF]">
              <RecipeImage
                src={recipe.imageUrl}
                title={recipe.title}
                cuisine={recipe.cuisine}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h2
                id="recipe-modal-title"
                className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#18181B] tracking-tight leading-snug text-balance"
              >
                {recipe.title}
              </h2>
              <p className="mt-3 text-sm text-[#52525B] leading-relaxed">
                {recipe.subtitle}
              </p>

              {/* Unboxed Dietary & Flavor Metadata */}
              <div className="mt-4 pt-4 border-t border-[#E5E4DF] text-xs text-[#52525B] space-y-1.5">
                <div>
                  <span className="font-semibold text-[#18181B]">
                    Flavor Architecture:{" "}
                  </span>
                  <span>{recipe.flavorProfile}</span>
                </div>
                {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                  <div>
                    <span className="font-semibold text-[#18181B]">
                      Dietary Profile:{" "}
                    </span>
                    <span>{recipe.dietaryTags.join(" · ")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chef's Note & Zero-Waste Tip */}
            <div className="space-y-4 pt-4 border-t border-[#E5E4DF]">
              <div>
                <h3 className="text-xs font-semibold text-[#18181B] tracking-tight">
                  01. Culinary Technique Note
                </h3>
                <p className="mt-1 text-xs text-[#52525B] leading-relaxed">
                  {recipe.chefNote}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#18181B] tracking-tight">
                  02. Root-to-Stem Zero Waste
                </h3>
                <p className="mt-1 text-xs text-[#52525B] leading-relaxed">
                  {recipe.zeroWasteTip}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#18181B] tracking-tight">
                  03. Sommelier & Beverage Pairing
                </h3>
                <p className="mt-1 text-xs text-[#52525B] leading-relaxed">
                  {recipe.pairingSuggestion}
                </p>
              </div>
            </div>

            {/* Tabular Nutrition Breakdown */}
            <div className="pt-4 border-t border-[#E5E4DF]">
              <h3 className="text-xs font-semibold text-[#18181B] mb-3">
                Nutritional Composition (Per Serving)
              </h3>
              <div className="grid grid-cols-4 border border-[#E5E4DF] rounded-lg bg-white divide-x divide-[#E5E4DF]">
                <div className="p-3 text-center">
                  <div className="font-mono text-sm font-semibold text-[#18181B] tabular-nums">
                    {recipe.nutrition.calories}
                  </div>
                  <div className="text-[11px] text-[#71717A] mt-0.5">kcal</div>
                </div>
                <div className="p-3 text-center">
                  <div className="font-mono text-sm font-semibold text-[#18181B] tabular-nums">
                    {recipe.nutrition.proteinGrams}g
                  </div>
                  <div className="text-[11px] text-[#71717A] mt-0.5">
                    Protein
                  </div>
                </div>
                <div className="p-3 text-center">
                  <div className="font-mono text-sm font-semibold text-[#18181B] tabular-nums">
                    {recipe.nutrition.carbsGrams}g
                  </div>
                  <div className="text-[11px] text-[#71717A] mt-0.5">Carbs</div>
                </div>
                <div className="p-3 text-center">
                  <div className="font-mono text-sm font-semibold text-[#18181B] tabular-nums">
                    {recipe.nutrition.fatGrams}g
                  </div>
                  <div className="text-[11px] text-[#71717A] mt-0.5">Lipids</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Scaled Ingredients & Interactive Steps (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-white space-y-8">
            {/* Section 1: Ingredients & Portion Scaling */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E4DF]">
                <div>
                  <h3 className="font-serif-display text-xl font-semibold text-[#18181B]">
                    Mise en Place & Ingredients
                  </h3>
                  <p className="text-xs text-[#71717A] mt-0.5 font-mono tabular-nums">
                    {evaluatedIngredients.filter((i) => i.inPantry).length} of{" "}
                    {evaluatedIngredients.length} ingredients in your pantry
                  </p>
                </div>

                {/* Portion Scaler */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#52525B]">Yield:</span>
                  <div className="flex items-center border border-[#D4D2CD] rounded-lg bg-[#FAF9F6]">
                    <button
                      type="button"
                      onClick={() => setServings((s) => Math.max(1, s - 1))}
                      aria-label="Decrease servings"
                      className="p-2 text-[#52525B] hover:text-[#18181B] transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono font-semibold text-[#18181B] tabular-nums whitespace-nowrap">
                      {servings} {servings === 1 ? "serving" : "servings"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setServings((s) => Math.min(12, s + 1))}
                      aria-label="Increase servings"
                      className="p-2 text-[#52525B] hover:text-[#18181B] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Missing Ingredients Action Bar */}
              {missingIngredients.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-[#FAF9F6] border border-[#E5E4DF]">
                  <div className="text-xs text-[#52525B]">
                    <span className="font-semibold text-[#18181B]">
                      {missingIngredients.length} missing{" "}
                      {missingIngredients.length === 1
                        ? "ingredient"
                        : "ingredients"}
                    </span>{" "}
                    — add to your grocery list or click Substitute on any item.
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMissing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-md transition-colors whitespace-nowrap"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>
                      {addedToCartNotice
                        ? "Added to Shopping List"
                        : "Add Missing to List"}
                    </span>
                  </button>
                </div>
              )}

              {/* Ingredient List */}
              <div className="mt-4 divide-y divide-[#E5E4DF]">
                {evaluatedIngredients.map((ing, idx) => {
                  const isSubOpen = subTargetIngredient === ing.name;
                  return (
                    <div key={`${ing.name}-${idx}`} className="py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[#18181B]">
                              {ing.name}
                            </span>
                            {ing.preparation && (
                              <span className="text-xs text-[#71717A]">
                                ({ing.preparation})
                              </span>
                            )}
                          </div>
                          {ing.substitutionNote && (
                            <p className="text-xs text-[#71717A] mt-0.5">
                              Chef tip: {ing.substitutionNote}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className="font-mono text-xs font-semibold text-[#18181B] tabular-nums whitespace-nowrap">
                            {formatAmount(ing.amount)} {ing.unit}
                          </span>

                          {ing.inPantry ? (
                            <span className="text-xs font-medium text-[#16A34A] whitespace-nowrap">
                              In Pantry
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onAddIngredientToPantry(ing.name)}
                                className="text-xs text-[#52525B] hover:text-[#18181B] underline underline-offset-2 whitespace-nowrap"
                              >
                                Have it
                              </button>
                              <span
                                className="text-[#D4D2CD]"
                                aria-hidden="true"
                              >
                                ·
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleFetchSubstitutions(ing.name)
                                }
                                className="flex items-center gap-1 text-xs font-medium text-[#B45309] hover:text-[#92400E] whitespace-nowrap"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Substitute</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Inline AI Substitution Drawer */}
                      {isSubOpen && (
                        <div className="mt-3 p-3.5 rounded-lg bg-[#FAF9F6] border border-[#E5E4DF] space-y-2">
                          {subLoading && (
                            <p className="text-xs text-[#52525B]">
                              Analyzing culinary chemistry & your active pantry
                              for {ing.name} alternatives...
                            </p>
                          )}
                          {subError && (
                            <p className="text-xs text-[#DC2626]">{subError}</p>
                          )}
                          {subResults && (
                            <div className="space-y-2.5">
                              <div className="text-xs text-[#52525B]">
                                <span className="font-semibold text-[#18181B]">
                                  Functional Role:{" "}
                                </span>
                                {subResults.originalRole}
                              </div>
                              <div className="divide-y divide-[#E5E4DF]">
                                {subResults.substitutions.map((sub, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="py-2 first:pt-0 last:pb-0 text-xs"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-semibold text-[#18181B]">
                                        {sub.substituteName}
                                      </span>
                                      <span className="font-mono text-[#1E3A2F] tabular-nums">
                                        {sub.ratioText}
                                      </span>
                                    </div>
                                    <p className="text-[#52525B] mt-0.5">
                                      {sub.flavorImpact} ·{" "}
                                      {sub.usesAvailablePantry
                                        ? "Matches your pantry"
                                        : sub.bestFor}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Interactive Cook-Along Steps & Live Kitchen Timer */}
            <div className="pt-6 border-t border-[#E5E4DF]">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-serif-display text-xl font-semibold text-[#18181B]">
                    Step-by-Step Execution
                  </h3>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Click any step to mark progress or start an inline stage
                    timer.
                  </p>
                </div>
                <span className="font-mono text-xs text-[#52525B] tabular-nums">
                  {completedSteps.size} / {recipe.steps.length} completed
                </span>
              </div>

              <div className="space-y-5">
                {recipe.steps.map((step) => {
                  const isDone = completedSteps.has(step.stepNumber);
                  const isThisTimerActive = activeTimerStep === step.stepNumber;

                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-4 rounded-lg border transition-colors ${
                        isDone
                          ? "bg-[#FAF9F6] border-[#E5E4DF] opacity-75"
                          : "bg-white border-[#D4D2CD]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => toggleStepCompletion(step.stepNumber)}
                          className="flex items-start gap-3 text-left group"
                        >
                          <span
                            className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border text-xs font-mono shrink-0 transition-colors ${
                              isDone
                                ? "bg-[#1E3A2F] border-[#1E3A2F] text-white"
                                : "border-[#A1A1AA] text-[#52525B] group-hover:border-[#18181B]"
                            }`}
                          >
                            {isDone ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              step.stepNumber
                            )}
                          </span>
                          <div>
                            <h4
                              className={`text-sm font-semibold ${
                                isDone
                                  ? "line-through text-[#71717A]"
                                  : "text-[#18181B]"
                              }`}
                            >
                              {step.title}
                            </h4>
                          </div>
                        </button>

                        {step.durationMinutes > 0 && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                handleStartStepTimer(
                                  step.stepNumber,
                                  step.durationMinutes
                                )
                              }
                              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono tabular-nums rounded-md border transition-colors whitespace-nowrap ${
                                isThisTimerActive && isTimerRunning
                                  ? "bg-[#1E3A2F] text-white border-[#1E3A2F]"
                                  : "bg-[#FAF9F6] text-[#18181B] border-[#D4D2CD] hover:border-[#18181B]"
                              }`}
                            >
                              {isThisTimerActive && isTimerRunning ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                              <span>
                                {isThisTimerActive
                                  ? formatTimer(timerSecondsLeft)
                                  : `${step.durationMinutes}:00`}
                              </span>
                            </button>
                            {isThisTimerActive && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleResetTimer(step.durationMinutes)
                                }
                                aria-label="Reset timer"
                                className="p-1 text-[#71717A] hover:text-[#18181B]"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <p className="mt-2.5 pl-8 text-sm text-[#3F3F46] leading-relaxed">
                        {step.instruction}
                      </p>

                      {step.techniqueTip && (
                        <p className="mt-2 pl-8 text-xs text-[#71717A] italic">
                          Cue: {step.techniqueTip}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
