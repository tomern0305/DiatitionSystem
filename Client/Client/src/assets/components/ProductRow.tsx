import React from "react";
import type { ProductData } from "../pages/ProductSettingsPage";
import type { CategoryData } from "../pages/CategorySettingsPage";
import ProductExpandedRow from "./ProductExpandedRow";

interface ProductRowProps {
  product: ProductData;
  categories: CategoryData[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSave: (id: string, updatedData: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ProductRow: React.FC<ProductRowProps> = ({
  product,
  categories,
  isExpanded,
  onToggleExpand,
  onSave,
  onDelete,
}) => {
  return (
    <React.Fragment>
      <tr
        className={`hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? "bg-blue-50/30" : ""}`}
        onClick={onToggleExpand}
      >
        <td className="p-4 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "-rotate-180 text-blue-500" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </td>
        <td className="p-4">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 rounded object-cover shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
              אין
            </div>
          )}
        </td>
        <td className="p-4 font-medium text-gray-800">{product.name}</td>
        <td className="p-4 text-gray-600">{product.category}</td>
        <td className="p-4 text-gray-600">{product.iddsi}</td>
        <td className="p-4 text-gray-600">{product.calories}</td>
        <td className="p-4 text-gray-600">{product.protein}</td>
        <td className="p-4 text-gray-600">
          {product.lastEditDate
            ? new Date(product.lastEditDate).toLocaleDateString("he-IL")
            : "-"}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td
            colSpan={8}
            className="p-0 border-b border-gray-100 bg-gray-50/50"
          >
            <ProductExpandedRow
              product={product}
              categories={categories}
              onSave={onSave}
              onDelete={onDelete}
              onClose={onToggleExpand}
            />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

export default ProductRow;
