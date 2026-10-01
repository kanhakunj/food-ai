import React, { useState } from "react";
import { Utensils, Flame, Sparkles, ChefHat, Salad } from "lucide-react";

interface RecipeImageProps {
  src?: string;
  title: string;
  cuisine?: string;
  className?: string;
}

export const RecipeImage: React.FC<RecipeImageProps> = ({
  src,
  title,
  cuisine,
  className = "w-full h-full object-cover",
}) => {
  const [hasError, setHasError] = useState(false);

  // If explicit working src is provided and no error occurred, render it
  if (src && !hasError && !src.startsWith("/src/assets/images/")) {
    return (
      <img
        src={src}
        alt={`${title}${cuisine ? ` — ${cuisine}` : ""}`}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={className}
      />
    );
  }

  // Refined architectural culinary illustration & palette for each dish profile
  const text = `${title} ${cuisine || ""}`.toLowerCase();

  let theme = {
    bg: "from-[#FBF7F0] via-[#F3ECE0] to-[#E9DFCF]",
    border: "border-[#E5DBCB]",
    accent: "#B45309",
    icon: Flame,
    dishType: "Skillet & Braise",
    motif: "🍳",
  };

  if (
    text.includes("salmon") ||
    text.includes("fish") ||
    text.includes("miso") ||
    text.includes("japanese") ||
    text.includes("asian") ||
    text.includes("rice")
  ) {
    theme = {
      bg: "from-[#F2F5F3] via-[#E4ECE7] to-[#D5E2D9]",
      border: "border-[#C5D7CC]",
      accent: "#1E3A2F",
      icon: Utensils,
      dishType: "Steamed & Caramelized",
      motif: "🥢",
    };
  } else if (
    text.includes("pasta") ||
    text.includes("tagliatelle") ||
    text.includes("italian") ||
    text.includes("butter") ||
    text.includes("lemon")
  ) {
    theme = {
      bg: "from-[#FEFBF2] via-[#FBF4DE] to-[#F5E8C3]",
      border: "border-[#E8D6A6]",
      accent: "#92400E",
      icon: ChefHat,
      dishType: "Silk Ribbon Emulsion",
      motif: "🍋",
    };
  } else if (
    text.includes("cauliflower") ||
    text.includes("tahini") ||
    text.includes("salad") ||
    text.includes("roast") ||
    text.includes("vegan") ||
    text.includes("plant")
  ) {
    theme = {
      bg: "from-[#F5F8F2] via-[#E8EFE3] to-[#D8E4D0]",
      border: "border-[#C7D7BE]",
      accent: "#2D5A43",
      icon: Salad,
      dishType: "Spice-Seared Harvest",
      motif: "🌿",
    };
  } else if (text.includes("ai") || text.includes("synthes")) {
    theme = {
      bg: "from-[#FAF9F6] via-[#F1EFEA] to-[#E5E2D9]",
      border: "border-[#D6D2C4]",
      accent: "#1E3A2F",
      icon: Sparkles,
      dishType: "Custom AI Formulation",
      motif: "✨",
    };
  }

  const IconComponent = theme.icon;

  return (
    <div
      className={`relative flex flex-col justify-between p-6 bg-gradient-to-br ${theme.bg} border-b ${theme.border} text-[#18181B] select-none ${className}`}
    >
      {/* Decorative culinary background watermark geometry */}
      <div className="absolute top-3 right-4 font-mono text-3xl opacity-25">
        {theme.motif}
      </div>

      <div className="flex items-center justify-between text-xs text-[#52525B] font-mono tabular-nums">
        <span>{cuisine || "Artisanal Kitchen"}</span>
        <span>{theme.dishType}</span>
      </div>

      <div className="my-auto py-4 text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-full bg-white/80 border border-black/5 shadow-sm flex items-center justify-center text-[#1E3A2F]">
          <IconComponent className="w-5 h-5" style={{ color: theme.accent }} />
        </div>
        <div className="font-serif-display text-lg font-semibold text-[#18181B] tracking-tight leading-snug line-clamp-2 px-2">
          {title}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#71717A] border-t border-black/5 pt-2">
        <span>Chef Tested</span>
        <span className="font-mono">Pantry-Matched</span>
      </div>
    </div>
  );
};
