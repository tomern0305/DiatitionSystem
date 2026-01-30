import React, { useState, useMemo } from 'react';
import LineWorkerProductCard from './LineWorkerProductCard';
import { ALLERGENS, CONSISTENCIES } from '../constants';
import { ChefHat, X, Utensils, AlertOctagon } from 'lucide-react';

export default function LineWorkerCatalog({ products, savedMeals = [] }) {
    const [selectedAllergens, setSelectedAllergens] = useState(new Set());
    const [selectedConsistencies, setSelectedConsistencies] = useState(new Set());
    const [previewMeal, setPreviewMeal] = useState(null);

    const toggleAllergen = (allergen) => {
        const next = new Set(selectedAllergens);
        if (next.has(allergen)) next.delete(allergen);
        else next.add(allergen);
        setSelectedAllergens(next);
    };

    const toggleConsistency = (consistency) => {
        const next = new Set(selectedConsistencies);
        if (next.has(consistency)) next.delete(consistency);
        else next.add(consistency);
        setSelectedConsistencies(next);
    };

    // Filter Products for the Catalog View
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // 1. Safety Filter (Allergens) - HIDE if contains selected allergen
            if (selectedAllergens.size > 0) {
                for (const allergen of product.allergens) {
                    if (selectedAllergens.has(allergen)) return false;
                }
            }

            // 2. Consistency Filter - SHOW if matches selected consistency (if any selected)
            if (selectedConsistencies.size > 0) {
                const hasMatch = product.consistency.some(c => selectedConsistencies.has(c));
                if (!hasMatch) return false;
            }

            return true;
        });
    }, [products, selectedAllergens, selectedConsistencies]);

    const groupedProducts = useMemo(() => {
        const groups = {};
        if (filteredProducts.length === 0) return {};

        filteredProducts.forEach(product => {
            const category = product.subCategory || "Uncategorized";
            if (!groups[category]) groups[category] = [];
            groups[category].push(product);
        });
        return groups;
    }, [filteredProducts]);

    // --- Matching Logic for Saved Meals ---
    const matchingMeals = useMemo(() => {
        if (!savedMeals) return [];

        return savedMeals.filter(meal => {
            // Check Allergens: Meal must effectively HAVE the same "No X" constraints
            const mealAllergens = new Set(meal.constraints?.allergens || []);
            // Exact Set Equality Check
            if (mealAllergens.size !== selectedAllergens.size) return false;
            for (let a of selectedAllergens) if (!mealAllergens.has(a)) return false;

            // Check Consistency
            const mealConsistencies = new Set(meal.constraints?.consistency || []);
            // Exact Set Equality Check
            if (mealConsistencies.size !== selectedConsistencies.size) return false;
            for (let c of selectedConsistencies) if (!mealConsistencies.has(c)) return false;

            return true;
        });
    }, [savedMeals, selectedAllergens, selectedConsistencies]);

    const getProduct = (id) => products.find(p => p.id === id);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f8fafc', position: 'relative' }}>
            {/* Horizontal Filter Belt */}
            <div style={{
                background: 'white', padding: '1.5rem', borderBottom: '1px solid #e2e8f0',
                overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', gap: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flexShrink: 0
            }}>
                {/* Consistencies Group */}
                <div style={{ display: 'flex', gap: '1rem', paddingRight: '1rem', borderRight: '1px solid #cbd5e1' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#64748b', alignSelf: 'center', marginRight: '0.5rem' }}>CONSISTENCY:</span>
                    {Object.values(CONSISTENCIES).map(cons => (
                        <button
                            key={cons}
                            onClick={() => toggleConsistency(cons)}
                            style={{
                                padding: '1rem 2rem',
                                borderRadius: '1rem',
                                border: '2px solid',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: selectedConsistencies.has(cons) ? '#dcfce7' : 'white',
                                borderColor: selectedConsistencies.has(cons) ? '#166534' : '#e2e8f0',
                                color: selectedConsistencies.has(cons) ? '#166534' : '#64748b',
                                boxShadow: selectedConsistencies.has(cons) ? '0 4px 6px -1px rgba(22, 101, 52, 0.2)' : 'none'
                            }}
                        >
                            {cons}
                        </button>
                    ))}
                </div>

                {/* Allergens Group */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#64748b', alignSelf: 'center', marginRight: '0.5rem' }}>HIDE ALLERGENS:</span>
                    {Object.values(ALLERGENS).map(allergen => (
                        <button
                            key={allergen}
                            onClick={() => toggleAllergen(allergen)}
                            style={{
                                padding: '1rem 2rem',
                                borderRadius: '1rem',
                                border: '2px solid',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: selectedAllergens.has(allergen) ? '#fee2e2' : 'white',
                                borderColor: selectedAllergens.has(allergen) ? '#dc2626' : '#e2e8f0',
                                color: selectedAllergens.has(allergen) ? '#991b1b' : '#64748b',
                                textDecoration: selectedAllergens.has(allergen) ? 'line-through' : 'none',
                                opacity: selectedAllergens.has(allergen) ? 0.8 : 1,
                                boxShadow: selectedAllergens.has(allergen) ? '0 4px 6px -1px rgba(220, 38, 38, 0.2)' : 'none'
                            }}
                        >
                            {allergen}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                {Object.keys(groupedProducts).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontSize: '1.25rem' }}>
                        No products match the selected criteria.
                    </div>
                ) : (
                    Object.entries(groupedProducts).map(([category, items]) => (
                        <div key={category} style={{ marginBottom: '3rem' }}>
                            <h2 style={{
                                fontSize: '1.5rem', fontWeight: 800, color: '#334155',
                                marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0',
                                paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}>
                                {category}
                                <span style={{ fontSize: '1rem', fontWeight: 500, color: '#94a3b8', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                                    {items.length}
                                </span>
                            </h2>
                            <div className="product-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {items.map(product => (
                                    <LineWorkerProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Bubbles for Matching Meals */}
            {matchingMeals.length > 0 && (
                <div style={{
                    position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', flexDirection: 'column', gap: '0.75rem',
                    alignItems: 'center', zIndex: 50, pointerEvents: 'none' // container ignores clicks, children capture them
                }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', background: 'rgba(255,255,255,0.9)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', backdropFilter: 'blur(4px)' }}>
                        SUGGESTED MEALS
                    </div>
                    {matchingMeals.map(meal => (
                        <div
                            key={meal.id}
                            onClick={() => setPreviewMeal(meal)}
                            style={{
                                pointerEvents: 'auto', // Re-enable clicks
                                background: 'white',
                                padding: '1rem 1.25rem',
                                borderRadius: '2rem',
                                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.25), 0 0 0 1px #bfdbfe',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                transform: 'translateY(0)',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: '2px solid #3b82f6',
                                maxWidth: '350px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
                        >
                            <div style={{ background: '#3b82f6', borderRadius: '50%', padding: '0.4rem', display: 'flex', alignSelf: 'flex-start', marginTop: '0.2rem' }}>
                                <ChefHat size={18} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                                    {meal.notes ? (meal.notes.length > 25 ? meal.notes.substring(0, 25) + '...' : meal.notes) : 'Unnamed Meal'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                    {new Date(meal.date).toLocaleDateString()}
                                </div>

                                {/* Constraints in Bubble */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                    {meal.constraints?.consistency.map(c => (
                                        <span key={c} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: '#dcfce7', color: '#166534', borderRadius: '0.4rem', fontWeight: 700, border: '1px solid #bbf7d0' }}>
                                            {c}
                                        </span>
                                    ))}
                                    {meal.constraints?.allergens.map(a => (
                                        <span key={a} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.4rem', fontWeight: 700, border: '1px solid #fecaca' }}>
                                            No {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Meal Preview Modal */}
            {previewMeal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
                }}>
                    <div style={{
                        background: 'white', borderRadius: '1.5rem', width: '90%', maxWidth: '500px',
                        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        {/* Modal Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>
                                    Meal Ticket
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    {new Date(previewMeal.date).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setPreviewMeal(null)}
                                style={{ padding: '0.5rem', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', color: '#64748b' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            {previewMeal.notes && (
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Note</span>
                                    <p style={{ margin: '0.25rem 0 0 0', fontStyle: 'italic', color: '#334155' }}>"{previewMeal.notes}"</p>
                                </div>
                            )}

                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                                Items to Plate
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {previewMeal.products.map((id, idx) => {
                                    const product = getProduct(id);
                                    if (!product) return null;
                                    return (
                                        <div key={`${id}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
                                            {/* Removed Image */}
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>{product.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{product.subCategory}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 1.5rem 1.5rem' }}>
                            <button
                                onClick={() => setPreviewMeal(null)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)' }}
                            >
                                Close & Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
