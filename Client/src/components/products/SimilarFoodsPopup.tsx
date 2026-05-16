import { useEffect, useRef } from "react";
import type { ProductData } from "../../types";
import { useSimilarProducts } from "../../hooks/useSimilarProducts";

interface Props {
  product: ProductData;
  anchorRect: DOMRect;
  onClose: () => void;
}

const POPUP_WIDTH = 272;
const POPUP_MAX_HEIGHT = 360;
const GAP = 8;

function calcStyle(anchorRect: DOMRect): React.CSSProperties {
  const { top, bottom, left, right } = anchorRect;
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  // Prefer showing below; if not enough room flip to above
  const spaceBelow = vh - bottom;
  const showAbove = spaceBelow < POPUP_MAX_HEIGHT && top > POPUP_MAX_HEIGHT;
  const topPos = showAbove ? top - POPUP_MAX_HEIGHT - GAP : bottom + GAP;

  // RTL: prefer aligning right edge of popup with right edge of card
  const rightEdge = vw - right;
  const leftEdge = left;
  const fitsAlignedRight = rightEdge + POPUP_WIDTH <= vw;

  return {
    position: "fixed",
    top: Math.max(GAP, Math.min(topPos, vh - POPUP_MAX_HEIGHT - GAP)),
    ...(fitsAlignedRight
      ? { right: Math.max(GAP, rightEdge) }
      : { left: Math.max(GAP, leftEdge) }),
    width: POPUP_WIDTH,
    zIndex: 50,
  };
}

const NutrientBadge = ({ label, value, unit }: { label: string; value: number; unit: string }) => (
  <span className="flex flex-col items-center bg-gray-50 rounded-lg px-2 py-1 min-w-[48px]">
    <span className="text-[9px] text-gray-400 font-semibold">{label}</span>
    <span className="text-[11px] font-bold text-gray-700 leading-none mt-0.5">
      {value}{unit}
    </span>
  </span>
);

const SkeletonRow = () => (
  <div className="flex items-center gap-2 p-2 animate-pulse">
    <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-2.5 bg-gray-100 rounded w-3/4" />
      <div className="h-2 bg-gray-100 rounded w-1/2" />
    </div>
  </div>
);

const SimilarFoodsPopup = ({ product, anchorRect, onClose }: Props) => {
  const { similar, loading } = useSimilarProducts(product.id);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      style={calcStyle(anchorRect)}
      className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          <span className="text-[11px] font-semibold text-gray-500 truncate">
            דומה ל: <span className="text-gray-800">{product.name}</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors shrink-0 ml-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto" style={{ maxHeight: POPUP_MAX_HEIGHT - 44 }}>
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[0, 1, 2, 4, 5].map((i) => <SkeletonRow key={i} />)}
          </div>
        ) : similar.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">לא נמצאו מוצרים דומים</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {similar.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50/80 transition-colors">
                {/* Thumbnail */}
                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-100">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[8px] font-bold text-gray-400 text-center px-0.5 leading-tight">{p.name.slice(0, 8)}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 truncate leading-tight">{p.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <NutrientBadge label="קל׳" value={p.calories} unit="" />
                    <NutrientBadge label="חלבון" value={p.protein} unit="g" />
                    <NutrientBadge label="פחמ׳" value={p.carbs} unit="g" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarFoodsPopup;
