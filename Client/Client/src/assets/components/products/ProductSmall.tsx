interface ProductSmallProps {
  image: string;
  name: string;
  iddsi: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugares: number;
  sodium: number;
  contains?: string[];
  mayContain?: string[];
  texture?: string | null;
  properties?: string[];
  state?: "regular" | "selected" | "disabled" | "warning";
  textureNotes?: string;
  allergyNotes?: string;
  forbiddenFor?: string;
}

const ProductSmall = ({
  image,
  name,
  iddsi,
  contains = [],
  mayContain = [],
  texture,
  properties = [],
  state = "regular",
  textureNotes,
  allergyNotes,
  forbiddenFor,
}: ProductSmallProps) => {
  // Determine classes based on the state
  let baseContainer =
    "bg-white/90 backdrop-blur-2xl border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]";
  let stateClasses =
    "hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1";

  if (state === "selected") {
    baseContainer =
      "bg-blue-50/40 backdrop-blur-2xl border-blue-400 shadow-[0_8px_30px_rgba(59,130,246,0.15)] ring-1 ring-blue-400";
    stateClasses = "scale-[1.02]";
  } else if (state === "disabled") {
    baseContainer =
      "bg-gray-50/80 backdrop-blur-sm border-gray-200 opacity-60 grayscale-[40%]";
    stateClasses = "pointer-events-none";
  } else if (state === "warning") {
    baseContainer =
      "bg-white/90 backdrop-blur-2xl border-orange-400 shadow-[0_8px_30px_rgba(249,115,22,0.15)] ring-1 ring-orange-400";
    stateClasses =
      "hover:shadow-[0_20px_40px_rgba(249,115,22,0.2)] hover:-translate-y-1";
  }

  return (
    <div
      className={`w-full max-w-[200px] rounded-[20px] transition-all duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] p-2 group overflow-hidden flex flex-col ${baseContainer} ${stateClasses}`}
    >
      {/* Floating Image Container */}
      <div className="relative h-28 w-full rounded-[16px] overflow-hidden shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] shrink-0">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent && !parent.querySelector(".fallback-text")) {
                const fallbackDiv = document.createElement("div");
                fallbackDiv.className =
                  "fallback-text w-full h-full flex items-center justify-center p-3 text-center bg-gradient-to-br from-gray-100 to-gray-200";
                fallbackDiv.innerHTML = `<span class="text-sm font-bold text-gray-500 max-h-full overflow-hidden text-ellipsis">${name}</span>`;
                parent.insertBefore(fallbackDiv, parent.firstChild);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3 text-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-sm font-bold text-gray-500 line-clamp-3">
              {name}
            </span>
          </div>
        )}
        {/* Sleek, frosted-glass IDDSI badge */}
        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1 cursor-default hover:bg-black/50 transition-colors">
          <div className="w-1 h-1 rounded-full bg-white opacity-90"></div>
          <span className="text-[9px] font-bold text-white tracking-wider uppercase leading-none">
            IDDSI {iddsi}
          </span>
        </div>
      </div>

      <div className="pt-3 pb-2 px-1 flex-1 flex flex-col justify-between">
        {/* Title */}
        <div className="mb-2 line-clamp-2 min-h-[40px]">
          <h3 className="text-[15px] font-bold text-gray-800 leading-tight tracking-tight">
            {name}
          </h3>
        </div>

        {/* Dietary Tags Section - Softer, more pill-like */}
        {(texture ||
          contains.length > 0 ||
          mayContain.length > 0 ||
          properties.length > 0 ||
          (textureNotes && textureNotes.trim() !== "") ||
          (allergyNotes && allergyNotes.trim() !== "") ||
          (forbiddenFor && forbiddenFor.trim() !== "")) && (
          <div className="flex flex-col gap-2 mb-3 mt-0.5">
            <div className="flex flex-wrap gap-1">
              {texture && (
                <span className="bg-blue-50/80 text-blue-600 border border-blue-100 text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] leading-none">
                  מרקם {texture}
                </span>
              )}

              {contains.map((allergen) => (
                <span
                  key={`contains-${allergen}`}
                  className="bg-red-50/80 text-red-600 border border-red-100 text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] leading-none"
                >
                  מכיל {allergen}
                </span>
              ))}

              {mayContain.map((allergen) => (
                <span
                  key={`maycontain-${allergen}`}
                  className="bg-orange-50/80 text-orange-600 border border-orange-100 text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] leading-none"
                >
                  עלול להכיל {allergen}
                </span>
              ))}
            </div>

            {/* Extra Notes Sections */}
            {allergyNotes && allergyNotes.trim() !== "" && (
              <div className="flex flex-col bg-red-50/50 p-1.5 rounded-md border border-red-100/50">
                <span className="text-[9px] text-red-500 font-bold">
                  הערות אלרגיות
                </span>
                <span className="text-[10px] text-gray-700 leading-tight mt-0.5">
                  {allergyNotes}
                </span>
              </div>
            )}

            {textureNotes && textureNotes.trim() !== "" && (
              <div className="flex flex-col bg-blue-50/50 p-1.5 rounded-md border border-blue-100/50">
                <span className="text-[9px] text-blue-500 font-bold">
                  הערות מרקם
                </span>
                <span className="text-[10px] text-gray-700 leading-tight mt-0.5">
                  {textureNotes}
                </span>
              </div>
            )}

            {forbiddenFor && forbiddenFor.trim() !== "" && (
              <div className="flex flex-col bg-purple-50/50 p-1.5 rounded-md border border-purple-100/50">
                <span className="text-[9px] text-purple-500 font-bold">
                  למי אסור
                </span>
                <span className="text-[10px] text-gray-700 leading-tight mt-0.5">
                  {forbiddenFor}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSmall;
