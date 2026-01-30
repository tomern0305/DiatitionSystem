import React from 'react';
import { Plus, Check, Info } from 'lucide-react';

export default function MealBuilderCard({ product, isSelected, onToggle, isDimmed, isRisky, riskyAllergens = [] }) {
    const handleClick = () => {
        if (!isDimmed) {
            onToggle(product);
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                background: isSelected ? '#eff6ff' : (isRisky ? '#fef2f2' : 'white'),
                borderRadius: '1rem',
                boxShadow: isSelected ? '0 0 0 2px #3b82f6, 0 4px 6px -1px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
                padding: '1.5rem',
                cursor: isDimmed ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isDimmed ? 0.4 : 1,
                border: isSelected ? '1px solid #3b82f6' : (isRisky ? '1px solid #fecaca' : '1px solid #e2e8f0'),
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: isRisky ? '#991b1b' : (isSelected ? '#1e40af' : '#1e293b') }}>
                        {product.name}
                    </h3>
                    {isRisky && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                            May Contain {riskyAllergens.length > 0 ? riskyAllergens.join(', ') : ''}
                        </span>
                    )}
                </div>
                {isSelected ? (
                    <div style={{ background: '#3b82f6', color: 'white', borderRadius: '50%', p: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
                        <Check size={16} />
                    </div>
                ) : (
                    <div style={{ border: '2px solid #e2e8f0', borderRadius: '50%', width: '24px', height: '24px' }} />
                )}
            </div>

            {/* Nutrition Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <NutriItem label="Cal" value={product.calories} />
                <NutriItem label="Prot" value={product.protein} />
                <NutriItem label="Fat" value={product.fat} />
                <NutriItem label="Sat.F" value={product.saturatedFat} />
                <NutriItem label="Carb" value={product.carbohydrates} />
                <NutriItem label="Sugr" value={product.sugar} />
                <NutriItem label="Sod" value={product.sodium} />
                <NutriItem label="Fib" value={product.fiber} />
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                {product.iddsi && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: '#f1f5f9', color: '#64748b', borderRadius: '0.25rem' }}>
                        IDDSI {product.iddsi.split(' ')[0]}
                    </span>
                )}
                {product.allergens.map(a => (
                    <span key={a} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.25rem' }}>
                        {a}
                    </span>
                ))}
            </div>
        </div>
    );
}

function NutriItem({ label, value }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{value || '-'}</span>
        </div>
    );
}


