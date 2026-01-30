import React, { useState, useMemo } from 'react';
import { Clock, AlertOctagon, Utensils, Calendar, Edit, Copy, Trash2, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ALLERGENS, CONSISTENCIES } from '../constants';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function SavedMeals({ meals, products, onEdit, onDuplicate, onDelete }) {
    const [selectedMealId, setSelectedMealId] = useState(null);

    // Helper to get product details by ID
    const getProduct = (id) => products.find(p => p.id === id);

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
    };

    const parseValue = (valStr) => {
        if (!valStr) return 0;
        if (typeof valStr === 'number') return valStr;
        const num = parseFloat(valStr.replace(/[a-zA-Z]/g, ''));
        return isNaN(num) ? 0 : num;
    };

    const selectedMeal = useMemo(() => {
        return meals.find(m => m.id === selectedMealId);
    }, [meals, selectedMealId]);

    const nutritionData = useMemo(() => {
        if (!selectedMeal) return null;

        const totals = {
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            sugar: 0,
            fiber: 0,
            saturatedFat: 0,
            sodium: 0
        };

        selectedMeal.products.forEach(prodId => {
            const p = getProduct(prodId);
            if (p) {
                totals.calories += parseValue(p.calories);
                totals.protein += parseValue(p.protein);
                totals.fat += parseValue(p.fat);
                totals.carbs += parseValue(p.carbohydrates);
                totals.sugar += parseValue(p.sugar);
                totals.fiber += parseValue(p.fiber);
                totals.saturatedFat += parseValue(p.saturatedFat);
                totals.sodium += parseValue(p.sodium);
            }
        });

        // Round values
        Object.keys(totals).forEach(key => {
            totals[key] = Math.round(totals[key] * 10) / 10;
        });

        return totals;
    }, [selectedMeal, products]);

    const macroData = useMemo(() => {
        if (!nutritionData) return [];
        return [
            { name: 'Protein (g)', value: nutritionData.protein },
            { name: 'Fat (g)', value: nutritionData.fat },
            { name: 'Carbs (g)', value: nutritionData.carbs },
        ];
    }, [nutritionData]);

    const nutrientData = useMemo(() => {
        if (!nutritionData) return [];
        return [
            { name: 'Sugar (g)', amount: nutritionData.sugar },
            { name: 'Fiber (g)', amount: nutritionData.fiber },
            { name: 'Sat. Fat (g)', amount: nutritionData.saturatedFat },
        ];
    }, [nutritionData]);

    if (!meals || meals.length === 0) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                    <Calendar size={32} color="#cbd5e1" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>No Saved Meals</h3>
                <p>Build a meal in the Meal Builder and verify it to save it here.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
            {/* Left Side: List */}
            <div style={{ width: '50%', padding: '2rem', overflowY: 'auto', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Meal History</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {meals.map((meal) => (
                        <div
                            key={meal.id}
                            onClick={() => setSelectedMealId(meal.id)}
                            style={{
                                background: 'white',
                                borderRadius: '1rem',
                                border: selectedMealId === meal.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                boxShadow: selectedMealId === meal.id ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: selectedMealId === meal.id ? 'scale(1.02)' : 'scale(1)',
                            }}
                        >
                            <div style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                                        <Clock size={16} />
                                        {formatDate(meal.date)}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEdit(meal); }}
                                            title="Edit"
                                            style={{ padding: '0.3rem', borderRadius: '0.3rem', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }}
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm("Delete this saved meal?")) {
                                                    if (selectedMealId === meal.id) setSelectedMealId(null);
                                                    onDelete(meal.id);
                                                }
                                            }}
                                            title="Delete"
                                            style={{ padding: '0.3rem', borderRadius: '0.3rem', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {meal.notes && (
                                    <p style={{ fontSize: '1rem', fontWeight: 500, color: '#334155', fontStyle: 'italic', margin: '0 0 0.5rem 0' }}>
                                        "{meal.notes}"
                                    </p>
                                )}

                                {/* Constraints Tags */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                                    {meal.constraints?.consistency.map(c => (
                                        <span key={c} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: '#dcfce7', color: '#166534', borderRadius: '0.4rem', fontWeight: 700, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                            <Utensils size={10} /> {c}
                                        </span>
                                    ))}
                                    {meal.constraints?.allergens.map(a => (
                                        <span key={a} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.4rem', fontWeight: 700, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                            <AlertOctagon size={10} /> No {a}
                                        </span>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    {meal.products.slice(0, 3).map(id => {
                                        const product = getProduct(id);
                                        return product ? (
                                            <span key={id} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: '#f1f5f9', borderRadius: '1rem', color: '#475569', fontWeight: 600 }}>
                                                {product.name}
                                            </span>
                                        ) : null;
                                    })}
                                    {meal.products.length > 3 && (
                                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: '#f1f5f9', borderRadius: '1rem', color: '#64748b' }}>
                                            +{meal.products.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Details & Graphs */}
            <div style={{ width: '50%', padding: '2rem', overflowY: 'auto' }}>
                {selectedMeal ? (
                    <div>
                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Meal Insights</h2>
                                <p style={{ color: '#64748b' }}>Results for meal on {formatDate(selectedMeal.date)}</p>
                            </div>
                            <button
                                onClick={() => onDuplicate(selectedMeal)}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Copy size={16} /> Duplicate
                            </button>
                        </div>

                        {/* Top Stats Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #dbeafe', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calories</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e40af' }}>{nutritionData.calories}</div>
                                <div style={{ fontSize: '0.8rem', color: '#60a5fa' }}>kcal</div>
                            </div>
                            <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #dcfce7', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sodium</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#166534' }}>{nutritionData.sodium}</div>
                                <div style={{ fontSize: '0.8rem', color: '#4ade80' }}>mg</div>
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

                            {/* Macros Pie */}
                            <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>
                                    <PieChartIcon size={20} /> Macronutrients
                                </h3>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={macroData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, value }) => `${name}: ${value}`}
                                            >
                                                {macroData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Nutrients Bar */}
                            <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>
                                    <BarChart2 size={20} /> Detailed Nutrients
                                </h3>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={nutrientData}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="amount" fill="#82ca9d" name="Amount (g)" radius={[4, 4, 0, 0]}>
                                                {nutrientData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Products List Details */}
                            <div style={{ marginTop: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                                    Meal Composition
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {selectedMeal.products.map((id, idx) => {
                                        const product = getProduct(id);
                                        return product ? (
                                            <div key={`${id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                                <span style={{ fontWeight: 600, color: '#475569' }}>{product.name}</span>
                                                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{product.calories} kcal</span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <div style={{ background: '#f1f5f9', width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                            <PieChartIcon size={48} color="#cbd5e1" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Meal Analytics</h3>
                        <p style={{ maxWidth: '300px', textAlign: 'center', lineHeight: 1.6 }}>Select a meal from the history sidebar to view detailed nutrition analysis and composition graphs.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
