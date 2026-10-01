import React, { useState } from "react";
import { X, Check, Trash2, Plus, Copy, ArrowUpRight } from "lucide-react";
import { Recipe, ShoppingItem, evaluateRecipeMatch } from "../data/culinaryData";

interface SavedMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedRecipes: Recipe[];
  pantrySet: Set<string>;
  shoppingList: ShoppingItem[];
  onSelectRecipe: (recipe: Recipe) => void;
  onRemoveSavedRecipe: (recipeId: string) => void;
  onToggleShoppingItem: (itemId: string) => void;
  onRemoveShoppingItem: (itemId: string) => void;
  onAddCustomShoppingItem: (name: string, amountText: string) => void;
  onClearCheckedShoppingItems: () => void;
}

export const SavedMenuDrawer: React.FC<SavedMenuDrawerProps> = ({
  isOpen,
  onClose,
  savedRecipes,
  pantrySet,
  shoppingList,
  onSelectRecipe,
  onRemoveSavedRecipe,
  onToggleShoppingItem,
  onRemoveShoppingItem,
  onAddCustomShoppingItem,
  onClearCheckedShoppingItems,
}) => {
  const [activeTab, setActiveTab] = useState<"menu" | "shopping">("menu");
  const [customItemName, setCustomItemName] = useState("");
  const [customItemAmount, setCustomItemAmount] = useState("");
  const [copiedNotice, setCopiedNotice] = useState(false);

  if (!isOpen) return null;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;
    onAddCustomShoppingItem(
      customItemName.trim(),
      customItemAmount.trim() || "1 unit"
    );
    setCustomItemName("");
    setCustomItemAmount("");
  };

  const handleCopyShoppingList = () => {
    if (shoppingList.length === 0) return;
    const text = shoppingList
      .map(
        (item) =>
          `${item.checked ? "[x]" : "[ ]"} ${item.name} (${item.amountText}) — ${item.fromRecipeTitle}`
      )
      .join("\n");
    navigator.clipboard?.writeText(text);
    setCopiedNotice(true);
    window.setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="relative w-full max-w-md bg-[#FAF9F6] border-l border-[#E5E4DF] h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E5E4DF] flex items-center justify-between">
          <h2
            id="drawer-title"
            className="font-serif-display text-xl font-semibold text-[#18181B]"
          >
            Kitchen Ledger & Menu
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-2 text-[#52525B] hover:text-[#18181B] rounded-lg hover:bg-[#F3F2EE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Control Tabs */}
        <div className="px-6 pt-4 pb-2 bg-white border-b border-[#E5E4DF]">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F3F2EE] rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("menu")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === "menu"
                  ? "bg-white text-[#18181B] shadow-sm"
                  : "text-[#52525B] hover:text-[#18181B]"
              }`}
            >
              Saved Menu ({savedRecipes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shopping")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === "shopping"
                  ? "bg-white text-[#18181B] shadow-sm"
                  : "text-[#52525B] hover:text-[#18181B]"
              }`}
            >
              Shopping List ({shoppingList.filter((i) => !i.checked).length})
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "menu" ? (
            savedRecipes.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="font-serif-display text-lg text-[#18181B]">
                  Your Saved Menu is Empty
                </p>
                <p className="text-xs text-[#71717A] max-w-xs mx-auto leading-relaxed">
                  Bookmark any curated or AI-synthesized recipe card to build
                  your weeknight cooking lineup and consolidate missing
                  groceries.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedRecipes.map((recipe) => {
                  const match = evaluateRecipeMatch(recipe, pantrySet);
                  return (
                    <div
                      key={recipe.id}
                      className="p-4 rounded-lg bg-white border border-[#E5E4DF] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectRecipe(recipe);
                          }}
                          className="text-left group"
                        >
                          <h3 className="font-serif-display text-base font-semibold text-[#18181B] group-hover:text-[#1E3A2F] transition-colors flex items-center gap-1">
                            <span>{recipe.title}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                          </h3>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveSavedRecipe(recipe.id)}
                          aria-label={`Remove ${recipe.title} from saved menu`}
                          className="p-1 text-[#71717A] hover:text-[#DC2626] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-[#71717A] font-mono tabular-nums">
                        {recipe.cuisine} ·{" "}
                        {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min ·{" "}
                        <span className="text-[#1E3A2F] font-semibold">
                          {match.matchPercentage}% match
                        </span>{" "}
                        · {match.missingCount} missing
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="space-y-4">
              {/* Add custom grocery item form */}
              <form onSubmit={handleAddCustom} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    placeholder="Add grocery item (e.g. Shallots)"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-[#D4D2CD] rounded-lg focus:outline-none focus:border-[#1E3A2F]"
                  />
                  <input
                    type="text"
                    value={customItemAmount}
                    onChange={(e) => setCustomItemAmount(e.target.value)}
                    placeholder="Qty (e.g. 250g)"
                    className="w-24 px-3 py-2 text-xs bg-white border border-[#D4D2CD] rounded-lg focus:outline-none focus:border-[#1E3A2F] font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="px-3 py-2 text-xs font-medium text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {shoppingList.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="font-serif-display text-lg text-[#18181B]">
                    No Missing Groceries
                  </p>
                  <p className="text-xs text-[#71717A] max-w-xs mx-auto leading-relaxed">
                    Add missing ingredients directly from any recipe studio view
                    or enter custom market staples above.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-[#52525B]">
                    <button
                      type="button"
                      onClick={handleCopyShoppingList}
                      className="flex items-center gap-1.5 text-[#1E3A2F] hover:underline font-medium"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>
                        {copiedNotice ? "Copied to Clipboard" : "Copy List"}
                      </span>
                    </button>
                    {shoppingList.some((i) => i.checked) && (
                      <button
                        type="button"
                        onClick={onClearCheckedShoppingItems}
                        className="text-[#71717A] hover:text-[#18181B]"
                      >
                        Clear Checked
                      </button>
                    )}
                  </div>

                  <div className="bg-white border border-[#E5E4DF] rounded-lg divide-y divide-[#E5E4DF]">
                    {shoppingList.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 flex items-center justify-between gap-3"
                      >
                        <button
                          type="button"
                          onClick={() => onToggleShoppingItem(item.id)}
                          className="flex items-start gap-2.5 text-left flex-1 min-w-0"
                        >
                          <span
                            className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                              item.checked
                                ? "bg-[#1E3A2F] border-[#1E3A2F] text-white"
                                : "border-[#A1A1AA] bg-white"
                            }`}
                          >
                            {item.checked && <Check className="w-3 h-3" />}
                          </span>
                          <div className="min-w-0">
                            <div
                              className={`text-xs font-medium truncate ${
                                item.checked
                                  ? "line-through text-[#A1A1AA]"
                                  : "text-[#18181B]"
                              }`}
                            >
                              {item.name}
                            </div>
                            <div className="text-[11px] text-[#71717A] truncate">
                              {item.fromRecipeTitle}
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs text-[#52525B] tabular-nums">
                            {item.amountText}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveShoppingItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="p-1 text-[#A1A1AA] hover:text-[#DC2626]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
