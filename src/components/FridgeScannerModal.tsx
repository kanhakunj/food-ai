import React, { useState, useRef } from "react";
import { X, Upload, Camera, Check, Sparkles } from "lucide-react";

interface DetectedIngredient {
  name: string;
  category: string;
  estimatedQuantity: string;
  freshnessNote: string;
}

interface FridgeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIngredients: (ingredients: string[]) => void;
}

export const FridgeScannerModal: React.FC<FridgeScannerModalProps> = ({
  isOpen,
  onClose,
  onAddIngredients,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSummary, setScanSummary] = useState<string>("");
  const [detected, setDetected] = useState<DetectedIngredient[]>([]);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const analyzeBase64Image = async (base64Data: string, mimeType: string) => {
    setIsScanning(true);
    setError(null);
    setDetected([]);
    setScanSummary("");

    try {
      const response = await fetch("/api/scan-fridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze kitchen photo.");
      }

      const items: DetectedIngredient[] = data.detectedIngredients || [];
      setDetected(items);
      setScanSummary(data.summary || "");
      setSelectedNames(new Set(items.map((i) => i.name)));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete visual ingredient scan."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      analyzeBase64Image(result, file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  // Quick fallback demo scan with sample kitchen items
  const handleScanSampleCountertop = async () => {
    setIsScanning(true);
    setError(null);
    window.setTimeout(() => {
      const sampleItems: DetectedIngredient[] = [
        {
          name: "Pasture-Raised Eggs",
          category: "Proteins & Eggs",
          estimatedQuantity: "6 eggs",
          freshnessNote: "Fresh carton",
        },
        {
          name: "Heirloom Tomatoes",
          category: "Produce & Aromatics",
          estimatedQuantity: "3 ripe units",
          freshnessNote: "Optimal sweet acidity",
        },
        {
          name: "Garlic",
          category: "Produce & Aromatics",
          estimatedQuantity: "1 head",
          freshnessNote: "Firm cloves",
        },
        {
          name: "Fresh Parsley",
          category: "Produce & Aromatics",
          estimatedQuantity: "1 bunch",
          freshnessNote: "Crisp and aromatic",
        },
        {
          name: "Extra-Virgin Olive Oil",
          category: "Condiments, Oils & Spices",
          estimatedQuantity: "Glass bottle",
          freshnessNote: "Cold-pressed staple",
        },
      ];
      setDetected(sampleItems);
      setScanSummary("Identified 5 prime Mediterranean and breakfast staples on the countertop.");
      setSelectedNames(new Set(sampleItems.map((i) => i.name)));
      setIsScanning(false);
    }, 900);
  };

  const toggleItem = (name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleConfirmAdd = () => {
    if (selectedNames.size > 0) {
      onAddIngredients(Array.from(selectedNames));
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-[#FAF9F6] border border-[#E5E4DF] rounded-xl shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E5E4DF]">
          <div>
            <h2
              id="scanner-modal-title"
              className="font-serif-display text-xl font-semibold text-[#18181B]"
            >
              Visual Larder & Fridge Scanner
            </h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              Upload a photo of your open refrigerator, countertop produce, or
              pantry shelf to extract ingredients automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner modal"
            className="p-2 text-[#52525B] hover:text-[#18181B] rounded-lg hover:bg-[#F3F2EE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload / Sample Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Kitchen Photo</span>
            </button>

            <button
              type="button"
              onClick={handleScanSampleCountertop}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#18181B] bg-white border border-[#D4D2CD] hover:border-[#18181B] rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Test with Sample Countertop Data</span>
            </button>
          </div>

          {/* Results Grid */}
          <div className="space-y-4">
            {previewUrl && (
              <div className="aspect-16/9 max-w-sm rounded-lg overflow-hidden border border-[#E5E4DF] bg-[#EFECE6]">
                <img
                  src={previewUrl}
                  alt="Uploaded kitchen ingredients preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {isScanning && (
              <div className="p-6 rounded-lg bg-white border border-[#E5E4DF] space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-[#1E3A2F]">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>
                    Inspecting produce, aromatics, and pantry staples...
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-[#F3F2EE] rounded animate-pulse" />
                  <div className="h-8 bg-[#F3F2EE] rounded animate-pulse" />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-white border border-[#DC2626] text-xs text-[#DC2626]">
                {error}
              </div>
            )}

            {!isScanning && detected.length > 0 && (
              <div className="bg-white border border-[#E5E4DF] rounded-lg p-4 space-y-4">
                {scanSummary && (
                  <p className="text-xs text-[#52525B] leading-relaxed border-b border-[#E5E4DF] pb-3">
                    {scanSummary}
                  </p>
                )}

                <div className="max-h-60 overflow-y-auto divide-y divide-[#E5E4DF]">
                  {detected.map((item, idx) => {
                    const isSelected = selectedNames.has(item.name);
                    return (
                      <div
                        key={`${item.name}-${idx}`}
                        className="py-2.5 flex items-center justify-between gap-3"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(item.name)}
                          className="flex items-start gap-2.5 text-left flex-1"
                        >
                          <span
                            className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border text-[10px] shrink-0 ${
                              isSelected
                                ? "bg-[#1E3A2F] border-[#1E3A2F] text-white"
                                : "border-[#A1A1AA] bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </span>
                          <div>
                            <div className="text-xs font-semibold text-[#18181B]">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-[#71717A]">
                              {item.category} · {item.estimatedQuantity} ·{" "}
                              {item.freshnessNote}
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-[#E5E4DF] flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-[#52525B] tabular-nums">
                    {selectedNames.size} ingredients selected
                  </span>
                  <button
                    type="button"
                    onClick={handleConfirmAdd}
                    disabled={selectedNames.size === 0}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A2F] hover:bg-[#162B22] rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    Add Selected to Pantry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
