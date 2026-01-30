
import React, { useState, useMemo } from 'react';
import { products as initialProducts } from './data/products';
import Sidebar from './components/Sidebar';
import ProductCard from './components/ProductCard';
import NavMenu from './components/NavMenu';
import ProductManagement from './components/ProductManagement';
import LineWorkerCatalog from './components/LineWorkerCatalog';
import MealBuilder from './components/MealBuilder';
import { Search, Menu } from 'lucide-react';
import './index.css';

import SavedMeals from './components/SavedMeals';

function App() {
  const [products, setProducts] = useState(initialProducts.map(p => ({
    ...p,
    lastUpdated: p.lastUpdated || new Date().toISOString()
  })));

  const [currentView, setCurrentView] = useState('inventory'); // 'inventory' | 'management' | 'lineworker' | 'meal-builder' | 'saved-meals'
  const [isNavOpen, setIsNavOpen] = useState(false);

  // --- Saved Meals State ---
  const [savedMeals, setSavedMeals] = useState([]);
  const [editingMeal, setEditingMeal] = useState(null); // Passed to MealBuilder

  const handleSaveMeal = (mealData) => {
    // Check if updating existing meal
    const existingIndex = savedMeals.findIndex(m => m.id === mealData.id);

    if (existingIndex >= 0) {
      // Update
      const updated = [...savedMeals];
      updated[existingIndex] = mealData;
      setSavedMeals(updated);
      alert('Meal updated successfully!');
    } else {
      // Create New
      setSavedMeals([mealData, ...savedMeals]);
      alert('Meal saved successfully!');
    }
  };

  const deleteMeal = (id) => {
    setSavedMeals(savedMeals.filter(m => m.id !== id));
  };

  const startEditMeal = (meal) => {
    setEditingMeal(meal); // Pass existing ID -> Update mode
    setCurrentView('meal-builder');
  };

  const startDuplicateMeal = (meal) => {
    // Create copy with NEW ID (or null to let Builder generate it)
    // We'll pass it as "editingMeal" but with id: null so Builder treats it as new
    setEditingMeal({ ...meal, id: null, date: new Date().toISOString() });
    setCurrentView('meal-builder');
  };

  // --- Inventory State ---
  const [filters, setFilters] = useState({
    allergens: new Set(),
    consistencies: new Set(),
    showMayContain: false
  });
  const [searchQuery, setSearchQuery] = useState("");

  // --- CRUD Handlers ---
  const handleAddProduct = (newProduct) => {
    const productWithTimestamp = {
      ...newProduct,
      lastUpdated: new Date().toISOString()
    };
    setProducts([productWithTimestamp, ...products]);
  };

  const handleEditProduct = (updatedProduct) => {
    const productWithTimestamp = {
      ...updatedProduct,
      lastUpdated: new Date().toISOString()
    };
    setProducts(products.map(p => p.id === updatedProduct.id ? productWithTimestamp : p));
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // --- Inventory Logic ---
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!product.name.toLowerCase().includes(query)) return false;
      }

      // 2. Allergen Filter (Strict)
      if (filters.allergens.size > 0) {
        // Direct
        for (const allergen of product.allergens) {
          if (filters.allergens.has(allergen)) return false;
        }
        // May Contain
        if (!filters.showMayContain) {
          for (const mayHave of product.mayContain) {
            if (filters.allergens.has(mayHave)) return false;
          }
        }
      }

      // 3. Consistency
      if (filters.consistencies.size > 0) {
        const hasMatch = product.consistency.some(c => filters.consistencies.has(c));
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [products, filters, searchQuery]);

  // --- Grouping Logic ---
  const groupedProducts = useMemo(() => {
    const groups = {};
    if (filteredProducts.length === 0) return {};

    filteredProducts.forEach(product => {
      const category = product.subCategory || "Uncategorized";
      if (!groups[category]) groups[category] = [];
      groups[category].push(product);
    });

    // Optional: Sort groups by predefined order in SUB_CATEGORIES if desired
    // For now, simple object keys
    return groups;
  }, [filteredProducts]);

  const getPageTitle = () => {
    switch (currentView) {
      case 'inventory': return 'Kitchen Inventory';
      case 'management': return 'Product Management';
      case 'lineworker': return 'Line Worker View';
      case 'meal-builder': return 'Meal Builder';
      case 'saved-meals': return 'Saved Meals';
      default: return 'Dietitian System';
    }
  };

  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh', width: '100%' }}>
      <NavMenu
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        currentView={currentView}
        setView={(view) => {
          setCurrentView(view);
          if (view === 'meal-builder') setEditingMeal(null); // Reset if navigating manually
        }}
      />

      <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <header className="header" style={{ gap: '1rem' }}>
          <button
            onClick={() => setIsNavOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a' }}
          >
            <Menu size={24} />
          </button>

          <h1 className="page-title">
            {getPageTitle()}
          </h1>

          {currentView === 'inventory' && (
            <div className="search-container" style={{ marginLeft: 'auto' }}>
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </header>

        {currentView === 'inventory' && (
          <div className="scroll-area" style={{ padding: '2rem', paddingBottom: '4rem' }}>
            {Object.keys(groupedProducts).length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b' }}>No products found.</div>
            ) : (
              Object.entries(groupedProducts).map(([category, items]) => (
                <div key={category} style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    {category}
                  </h2>
                  <div className="product-grid" style={{ paddingBottom: 0 }}>
                    {items.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {currentView === 'management' && (
          <ProductManagement
            products={products}
            onAdd={handleAddProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        )}

        {currentView === 'lineworker' && (
          <LineWorkerCatalog products={products} savedMeals={savedMeals} />
        )}

        {currentView === 'meal-builder' && (
          <MealBuilder
            products={products}
            onSave={handleSaveMeal}
            initialState={editingMeal} // Pass the editing state
          />
        )}

        {currentView === 'saved-meals' && (
          <SavedMeals
            meals={savedMeals}
            products={products}
            onEdit={startEditMeal}
            onDuplicate={startDuplicateMeal}
            onDelete={deleteMeal}
          />
        )}
      </main>

      {/* Show Filter Sidebar on the RIGHT in Inventory View */}
      {currentView === 'inventory' && (
        <Sidebar filters={filters} setFilters={setFilters} />
      )}
    </div>
  );
}

export default App;
