import React from 'react';
import { ALLERGENS, CONSISTENCIES, MAY_CONTAIN_LABEL } from '../constants';
import { Filter, AlertOctagon, Utensils } from 'lucide-react';

export default function Sidebar({ filters, setFilters }) {

    const handleAllergenChange = (allergen) => {
        const newAllergens = new Set(filters.allergens);
        if (newAllergens.has(allergen)) {
            newAllergens.delete(allergen);
        } else {
            newAllergens.add(allergen);
        }
        setFilters({ ...filters, allergens: newAllergens });
    };

    const handleConsistencyChange = (consistency) => {
        const newConsistencies = new Set(filters.consistencies);
        if (newConsistencies.has(consistency)) {
            newConsistencies.delete(consistency);
        } else {
            newConsistencies.add(consistency);
        }
        setFilters({ ...filters, consistencies: newConsistencies });
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-title">
                Product Filters
            </div>

            {/* Allergens Group */}
            <div className="filter-group">
                <div className="filter-header">
                    <AlertOctagon size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
                    Allergens (Exclude)
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    Check allergens to exclude them from the list.
                </p>

                {Object.values(ALLERGENS).map(allergen => (
                    <label key={allergen} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.allergens.has(allergen)}
                            onChange={() => handleAllergenChange(allergen)}
                        />
                        No {allergen}
                    </label>
                ))}

                <div style={{ marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', background: '#fee2e2', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ef4444' }}>
                    <label className="checkbox-label" style={{ fontWeight: 700, color: '#991b1b' }}>
                        <input
                            type="checkbox"
                            checked={filters.showMayContain}
                            onChange={() => setFilters({ ...filters, showMayContain: !filters.showMayContain })}
                            style={{ accentColor: '#ef4444' }}
                        />
                        Show "May Contain" items
                    </label>
                    <p style={{ fontSize: '0.75rem', color: '#7f1d1d', marginTop: '0.25rem' }}>
                        Warning: Enabling this shows items with trace allergens.
                    </p>
                </div>
            </div>

            {/* Consistency Group */}
            <div className="filter-group">
                <div className="filter-header">
                    <Utensils size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
                    Consistency (Include)
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    Show products matching these textures.
                </p>

                {Object.values(CONSISTENCIES).map(cons => (
                    <label key={cons} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.consistencies.has(cons)}
                            onChange={() => handleConsistencyChange(cons)}
                        />
                        {cons}
                    </label>
                ))}
            </div>
        </aside>
    );
}
