import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function LineWorkerProductCard({ product }) {
    return (
        <div className="product-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{product.name}</h3>
                {product.iddsi && (
                    <span style={{
                        background: '#0f172a', color: 'white', padding: '0.25rem 0.75rem',
                        borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap'
                    }}>
                        IDDSI {product.iddsi.split(' ')[0]}
                    </span>
                )}
            </div>

            <div className="badges" style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {product.allergens.map(allergen => (
                    <span key={allergen} className="badge badge-danger" style={{
                        background: '#fee2e2', color: '#991b1b', padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.9rem', fontWeight: 600, border: '1px solid #fecaca'
                    }}>
                        <AlertTriangle size={16} />
                        {allergen}
                    </span>
                ))}
            </div>

            <div className="badges" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {product.consistency.map(cons => (
                    <span key={cons} className="badge badge-success" style={{
                        background: '#dcfce7', color: '#166534', padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.9rem', fontWeight: 600, border: '1px solid #bbf7d0'
                    }}>
                        <CheckCircle size={16} />
                        {cons}
                    </span>
                ))}
            </div>

            {product.notes && (
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem', fontStyle: 'italic', color: '#64748b' }}>
                    "{product.notes}"
                </div>
            )}
        </div>
    );
}
