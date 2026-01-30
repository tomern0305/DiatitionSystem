import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Label, LabelList } from 'recharts';
import { X, Search, RotateCcw, Save } from 'lucide-react';
import MealBuilderCard from './MealBuilderCard';
import { ALLERGENS, CONSISTENCIES, SUB_CATEGORIES } from '../constants';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

export default function MealBuilder({ products, onSave, initialState }) {
    const [selectedProductIds, setSelectedProductIds] = useState(new Set());
    const [constraints, setConstraints] = useState({
        allergens: new Set(),
        consistency: new Set(),
        blockMayContain: false
    });
    const [hoveredProduct, setHoveredProduct] = useState(null);

    // --- Save Modal State ---
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [notes, setNotes] = useState("");

    // --- EFFECT: Initialize from Edit/Dup State ---
    React.useEffect(() => {
        if (initialState) {
            setSelectedProductIds(new Set(initialState.products));
            setConstraints({
                allergens: new Set(initialState.constraints.allergens),
                consistency: new Set(initialState.constraints.consistency),
                blockMayContain: initialState.constraints.blockMayContain
            });
            setNotes(initialState.notes || "");
        } else {
            // Reset if no initialState (e.g. creating new from scratch manually)
            setSelectedProductIds(new Set());
            setConstraints({ allergens: new Set(), consistency: new Set(), blockMayContain: false });
            setNotes("");
        }
    }, [initialState]);

    const handleSave = () => {
        if (selectedProductIds.size === 0) {
            alert("Please select at least one product.");
            return;
        }

        const mealData = {
            id: initialState?.id || Date.now(), // Keep ID if editing, else new
            date: new Date().toISOString(),
            notes: notes,
            products: Array.from(selectedProductIds),
            constraints: {
                allergens: Array.from(constraints.allergens),
                consistency: Array.from(constraints.consistency),
                blockMayContain: constraints.blockMayContain
            }
        };

        if (onSave) onSave(mealData);
        setIsSaveModalOpen(false);
        setNotes("");
    };

    // --- Helpers ---
    const parseNutrient = (val) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        return parseFloat(val.replace(/[^\d.]/g, '')) || 0;
    };

    // --- Logic ---
    const getProductStatus = (product) => {
        // 1. Consistency (Requirement: Must match one of selected if any selected)
        if (constraints.consistency.size > 0) {
            const hasMatch = product.consistency.some(c => constraints.consistency.has(c));
            if (!hasMatch) return { compatible: false, risky: false, riskyAllergens: [] };
        }

        // 2. Allergens
        if (constraints.allergens.size > 0) {
            // A. Check Direct Allergens (Always Incompatible)
            for (const allergen of product.allergens) {
                if (constraints.allergens.has(allergen)) return { compatible: false, risky: false, riskyAllergens: [] };
            }

            // B. Check "May Contain"
            if (product.mayContain && product.mayContain.length > 0) {
                // Determine WHICH items are risky
                const riskyAllergens = product.mayContain.filter(a => constraints.allergens.has(a));

                if (riskyAllergens.length > 0) {
                    if (constraints.blockMayContain) {
                        return { compatible: false, risky: false, riskyAllergens: [] }; // Strict Mode: Block it
                    } else {
                        return { compatible: true, risky: true, riskyAllergens }; // Permissive Mode: Allow but Warn with specific allergens
                    }
                }
            }
        }
        return { compatible: true, risky: false, riskyAllergens: [] };
    };

    const toggleProduct = (product) => {
        const status = getProductStatus(product);
        if (!status.compatible) return; // Prevent selection of incompatible items

        const next = new Set(selectedProductIds);
        if (next.has(product.id)) next.delete(product.id);
        else next.add(product.id);
        setSelectedProductIds(next);
    };

    const removeProduct = (id) => {
        const next = new Set(selectedProductIds);
        next.delete(id);
        setSelectedProductIds(next);
    };

    // --- Derived Data ---
    const selectedProducts = useMemo(() => {
        return products.filter(p => selectedProductIds.has(p.id));
    }, [products, selectedProductIds]);

    const pieData = useMemo(() => {
        return selectedProducts.map((p, index) => {
            const profile = [
                { name: 'Cal', value: parseNutrient(p.calories), fill: '#3b82f6' },
                { name: 'Prot', value: parseNutrient(p.protein), fill: '#8b5cf6' },
                { name: 'Fat', value: parseNutrient(p.fat), fill: '#f59e0b' },
                { name: 'Carb', value: parseNutrient(p.carbohydrates), fill: '#10b981' },
                { name: 'Sod', value: parseNutrient(p.sodium), fill: '#ef4444' },
                { name: 'Sugr', value: parseNutrient(p.sugar), fill: '#ec4899' },
            ];
            return {
                name: p.name,
                value: parseNutrient(p.calories), // Slices based on Calories
                fill: COLORS[index % COLORS.length],
                nutritionProfile: profile
            };
        });
    }, [selectedProducts]);

    const groupedProducts = useMemo(() => {
        const groups = {};
        products.forEach(p => {
            const cat = p.subCategory || 'Other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });
        return groups;
    }, [products]);

    // --- Render ---
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f8fafc', overflow: 'hidden', position: 'relative' }}>

            {/* Modal Overlay */}
            {isSaveModalOpen && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)'
                }}>
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Save Meal</h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="E.g., Low sodium breakfast for Patient A..."
                                style={{
                                    width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1', fontSize: '0.95rem', resize: 'vertical'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsSaveModalOpen(false)}
                                style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Save size={18} />
                                Confirm Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STICKY TOP BAR */}
            <div style={{
                height: '240px', background: 'white', borderBottom: '1px solid #e2e8f0',
                flexShrink: 0, display: 'flex', padding: '1rem', gap: '2rem',
                boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)', zIndex: 50
            }}>
                {/* Left: Selected Items */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Your Meal ({selectedProducts.length})
                        </h3>
                        <button
                            onClick={() => setIsSaveModalOpen(true)}
                            disabled={selectedProducts.length === 0}
                            style={{
                                padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                background: selectedProducts.length > 0 ? '#eff6ff' : '#f1f5f9', color: selectedProducts.length > 0 ? '#3b82f6' : '#cbd5e1',
                                border: '1px solid', borderColor: selectedProducts.length > 0 ? '#bfdbfe' : '#e2e8f0', cursor: selectedProducts.length > 0 ? 'pointer' : 'not-allowed',
                                fontWeight: 700, transition: 'all 0.2s'
                            }}
                        >
                            <Save size={14} />
                            Save Meal
                        </button>
                    </div>
                    <div style={{
                        flex: 1, background: '#f1f5f9', borderRadius: '1rem', padding: '1rem',
                        display: 'flex', gap: '1rem', overflowX: 'auto', alignItems: 'center'
                    }}>
                        {selectedProducts.length === 0 && (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Select items below to build your meal...</span>
                        )}
                        {selectedProducts.map((p, index) => {
                            const color = COLORS[index % COLORS.length];
                            return (
                                <div key={p.id} onClick={() => removeProduct(p.id)} style={{
                                    background: 'white', padding: '0.5rem 1rem', borderRadius: '2rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    border: `2px solid ${color}`, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                                    fontSize: '0.9rem', fontWeight: 600, color: '#334155'
                                }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                                    {p.name}
                                    <div style={{ background: '#fee2e2', borderRadius: '50%', padding: '2px', display: 'flex', marginLeft: '0.25rem' }}>
                                        <X size={12} color="#ef4444" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Chart */}
                <div style={{ width: '380px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                            Calorie Breakdown
                        </h3>
                    </div>

                    <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                        {/* Wrapper for Pie and Detail */}
                        {pieData.length === 0 ? (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontStyle: 'italic', fontSize: '0.75rem' }}>
                                Add items to see breakdown
                            </div>
                        ) : (
                            <>
                                {/* Pie Section */}
                                <div style={{ flex: '0 0 140px', height: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart onMouseLeave={() => setHoveredProduct(null)}>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={60}
                                                paddingAngle={5}
                                                dataKey="value"
                                                onMouseEnter={(_, index) => setHoveredProduct(pieData[index])}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" style={{ outline: 'none', cursor: 'pointer' }} />
                                                ))}
                                                <Label
                                                    value={`${pieData.reduce((sum, item) => sum + item.value, 0)} cal`}
                                                    position="center"
                                                    fill="#64748b"
                                                    style={{ fontSize: '12px', fontWeight: 'bold' }}
                                                />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Detail Section (Fixed Position) */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    {hoveredProduct ? (
                                        <div style={{ background: 'white', borderRadius: '1rem', padding: '0.5rem 1rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>
                                                <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{hoveredProduct.name}</h4>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white', background: hoveredProduct.fill, padding: '0.1rem 0.5rem', borderRadius: '0.5rem' }}>{hoveredProduct.value} cal</span>
                                            </div>
                                            <div style={{ width: '100%', height: '80px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={hoveredProduct.nutritionProfile} margin={{ top: 15, right: 0, left: 0, bottom: 0 }} barSize={16}>
                                                        <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} dy={2} />
                                                        <YAxis hide />
                                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} contentStyle={{ display: 'none' }} />
                                                        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                                                            <LabelList dataKey="value" position="top" style={{ fontSize: '9px', fontWeight: 'bold', fill: '#64748b' }} />
                                                            {hoveredProduct.nutritionProfile.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic', padding: '1rem' }}>
                                            Hover over chart to see details
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* CONTROL PANEL & GRID */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Side: Constraints */}
                <div style={{ width: '280px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '1.5rem', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Constraints
                    </h3>
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Allowed Consistencies</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {Object.values(CONSISTENCIES).map(cons => (
                                <label key={cons} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={constraints.consistency.has(cons)}
                                        onChange={() => {
                                            const next = new Set(constraints.consistency);
                                            if (next.has(cons)) next.delete(cons);
                                            else next.add(cons);
                                            setConstraints({ ...constraints, consistency: next });
                                        }}
                                        style={{ width: '1.2rem', height: '1.2rem', accentColor: '#22c55e' }}
                                    />
                                    {cons}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Safety (Exclude)</h4>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1rem', padding: '0.5rem', background: '#fff1f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                            <input
                                type="checkbox"
                                checked={constraints.blockMayContain}
                                onChange={(e) => setConstraints({ ...constraints, blockMayContain: e.target.checked })}
                                style={{ width: '1rem', height: '1rem', accentColor: '#ef4444' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 700, color: '#ef4444' }}>Block "May Contain"</span>
                                <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>Strict Safety Mode</span>
                            </div>
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {Object.values(ALLERGENS).map(allergen => (
                                <label key={allergen} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={constraints.allergens.has(allergen)}
                                        onChange={() => {
                                            const next = new Set(constraints.allergens);
                                            if (next.has(allergen)) next.delete(allergen);
                                            else next.add(allergen);
                                            setConstraints({ ...constraints, allergens: next });
                                        }}
                                        style={{ width: '1.2rem', height: '1.2rem', accentColor: '#ef4444' }}
                                    />
                                    No {allergen}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main: Product Grid */}
                <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    {Object.entries(groupedProducts).length === 0 ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '4rem' }}>No products available.</div>
                    ) : (
                        Object.entries(groupedProducts).map(([category, items]) => (
                            <div key={category} style={{ marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#334155', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' }}>
                                    {category}
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    {items.map(product => {
                                        const { compatible, risky, riskyAllergens } = getProductStatus(product);
                                        return (
                                            <MealBuilderCard
                                                key={product.id}
                                                product={product}
                                                isSelected={selectedProductIds.has(product.id)}
                                                onToggle={toggleProduct}
                                                isDimmed={!compatible}
                                                isRisky={risky}
                                                riskyAllergens={riskyAllergens}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
