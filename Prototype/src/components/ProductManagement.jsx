import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Search } from 'lucide-react';
import { ALLERGENS, CONSISTENCIES, MAY_CONTAIN_LABEL, IDDSI_LEVELS, SUB_CATEGORIES } from '../constants';

export default function ProductManagement({ products, onAdd, onEdit, onDelete }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Form State
    const [formData, setFormData] = useState(createEmptyProduct());

    function createEmptyProduct() {
        return {
            name: '',
            chameleonName: '',
            subCategory: '',
            iddsi: '',
            notes: '',
            allergens: [],
            mayContain: [],
            consistency: [],
            calories: 0,
            protein: '0g',
            fat: '0g',
            saturatedFat: '0g',
            carbohydrates: '0g',
            sugar: '0g',
            sodium: '0mg',
            fiber: '0g'
        };
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.chameleonName && p.chameleonName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleOpenAdd = () => {
        setEditingProduct(null);
        setFormData(createEmptyProduct());
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product) => {
        setEditingProduct(product);
        setFormData({ ...product });
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingProduct) {
            onEdit({ ...editingProduct, ...formData });
        } else {
            onAdd({ ...formData, id: Date.now() }); // Simple ID gen
        }
        setIsModalOpen(false);
    };

    const toggleArrayItem = (field, value) => {
        const current = new Set(formData[field]);
        if (current.has(value)) current.delete(value);
        else current.add(value);
        setFormData({ ...formData, [field]: Array.from(current) });
    };

    return (
        <div className="product-management" style={{ padding: '2rem', width: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Product Management</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="search-container" style={{ position: 'relative' }}>
                        <Search className="search-icon" size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0',
                                width: '250px'
                            }}
                        />
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        style={{
                            background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
                        }}
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Name / ID</th>
                            <th style={{ padding: '1rem' }}>Category</th>
                            <th style={{ padding: '1rem' }}>IDDSI</th>
                            <th style={{ padding: '1rem' }}>Allergens</th>
                            <th style={{ padding: '1rem' }}>Last Modified</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div
                                        onClick={() => setViewingProduct(product)}
                                        style={{ fontWeight: 500, cursor: 'pointer', color: '#2563eb', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                                    >
                                        {product.name}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{product.chameleonName}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>{product.subCategory || '-'}</td>
                                <td style={{ padding: '1rem' }}>{product.iddsi || '-'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                        {product.allergens.map(a => (
                                            <span key={a} style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{a}</span>
                                        ))}
                                        {product.allergens.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                                    {product.lastUpdated ? new Date(product.lastUpdated).toLocaleDateString() : '-'}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button onClick={() => handleOpenEdit(product)} style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem' }} title="Edit">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => onDelete(product.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            {viewingProduct && (
                <div
                    onClick={() => setViewingProduct(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '500px', maxWidth: '90vw', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative' }}
                    >
                        <button
                            onClick={() => setViewingProduct(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                        >
                            <X size={24} />
                        </button>

                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', paddingRight: '2rem' }}>{viewingProduct.name}</h3>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>ID: {viewingProduct.chameleonName || 'N/A'}</div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>Nutritional Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Calories:</span>
                                    <span style={{ fontWeight: 600 }}>{viewingProduct.calories}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Protein:</span>
                                    <span style={{ fontWeight: 600 }}>{viewingProduct.protein}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Fat:</span>
                                    <span style={{ fontWeight: 600 }}>{viewingProduct.fat || '-'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Saturated Fat:</span>
                                    <span style={{ fontWeight: 600 }}>{viewingProduct.saturatedFat || '-'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Carbs:</span>
                                    <span style={{ fontWeight: 600 }}>{viewingProduct.carbohydrates || '-'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Sugar:</span>
                                    <span style={{ fontWeight: 600 }}>{viewingProduct.sugar || '-'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Sodium:</span>
                                    <span style={{ fontWeight: 600 }}>{viewingProduct.sodium || '-'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Fiber:</span>
                                    <span style={{ fontWeight: 600 }}>{viewingProduct.fiber || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {viewingProduct.notes && (
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Notes</h4>
                                <p style={{ color: '#475569', fontSize: '0.9rem', fontStyle: 'italic', background: '#fffbeb', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    {viewingProduct.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit/Add Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <form onSubmit={handleSave} style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <label style={{ gridColumn: 'span 2' }}>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Name</span>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                />
                            </label>

                            <label>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Chameleon Name (ID)</span>
                                <input
                                    type="text"
                                    value={formData.chameleonName}
                                    onChange={e => setFormData({ ...formData, chameleonName: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                />
                            </label>

                            <label>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Sub Category</span>
                                <select
                                    value={formData.subCategory}
                                    onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                >
                                    <option value="">Select...</option>
                                    {SUB_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </label>

                            <label>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>IDDSI Level</span>
                                <select
                                    value={formData.iddsi}
                                    onChange={e => setFormData({ ...formData, iddsi: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                >
                                    <option value="">Select...</option>
                                    {Object.values(IDDSI_LEVELS).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                </select>
                            </label>

                            <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Allergens (Contains)</span>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {Object.values(ALLERGENS).map(option => (
                                        <button
                                            key={option} type="button"
                                            onClick={() => toggleArrayItem('allergens', option)}
                                            style={{
                                                padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid', cursor: 'pointer', fontSize: '0.8rem',
                                                background: formData.allergens.includes(option) ? '#fee2e2' : 'white',
                                                borderColor: formData.allergens.includes(option) ? '#ef4444' : '#e2e8f0',
                                                color: formData.allergens.includes(option) ? '#991b1b' : '#64748b'
                                            }}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>May Contain</span>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {Object.values(ALLERGENS).map(option => (
                                        <button
                                            key={option} type="button"
                                            onClick={() => toggleArrayItem('mayContain', option)}
                                            style={{
                                                padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid', cursor: 'pointer', fontSize: '0.8rem',
                                                background: formData.mayContain.includes(option) ? '#fff3cd' : 'white',
                                                borderColor: formData.mayContain.includes(option) ? '#f59e0b' : '#e2e8f0',
                                                color: formData.mayContain.includes(option) ? '#856404' : '#64748b'
                                            }}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Consistency</span>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {Object.values(CONSISTENCIES).map(option => (
                                        <button
                                            key={option} type="button"
                                            onClick={() => toggleArrayItem('consistency', option)}
                                            style={{
                                                padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid', cursor: 'pointer', fontSize: '0.8rem',
                                                background: formData.consistency.includes(option) ? '#dcfce7' : 'white',
                                                borderColor: formData.consistency.includes(option) ? '#22c55e' : '#e2e8f0',
                                                color: formData.consistency.includes(option) ? '#166534' : '#64748b'
                                            }}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <label>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Calories</span>
                                <input
                                    type="number"
                                    value={formData.calories}
                                    onChange={e => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                />
                            </label>
                            <label>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Protein</span>
                                <input
                                    type="text"
                                    value={formData.protein}
                                    onChange={e => setFormData({ ...formData, protein: e.target.value })}
                                    placeholder="e.g. 10g"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                />
                            </label>

                            <label>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Fat</span>
                                <input
                                    type="text"
                                    value={formData.fat || ''}
                                    onChange={e => setFormData({ ...formData, fat: e.target.value })}
                                    placeholder="e.g. 5g"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                />
                            </label>

                            <label>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Saturated Fat</span>
                                <input
                                    type="text"
                                    value={formData.saturatedFat || ''}
                                    onChange={e => setFormData({ ...formData, saturatedFat: e.target.value })}
                                    placeholder="e.g. 1g"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                />
                            </label>

                            <label>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Carbohydrates</span>
                                <input
                                    type="text"
                                    value={formData.carbohydrates || ''}
                                    onChange={e => setFormData({ ...formData, carbohydrates: e.target.value })}
                                    placeholder="e.g. 20g"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                />
                            </label>

                            <label>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Sugar</span>
                                <input
                                    type="text"
                                    value={formData.sugar || ''}
                                    onChange={e => setFormData({ ...formData, sugar: e.target.value })}
                                    placeholder="e.g. 5g"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                />
                            </label>

                            <label>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Sodium</span>
                                <input
                                    type="text"
                                    value={formData.sodium || ''}
                                    onChange={e => setFormData({ ...formData, sodium: e.target.value })}
                                    placeholder="e.g. 100mg"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                />
                            </label>

                            <label>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Fiber</span>
                                <input
                                    type="text"
                                    value={formData.fiber || ''}
                                    onChange={e => setFormData({ ...formData, fiber: e.target.value })}
                                    placeholder="e.g. 3g"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                />
                            </label>

                            <label style={{ gridColumn: 'span 2' }}>
                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Notes</span>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', minHeight: '80px' }}
                                />
                            </label>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '0.375rem', cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Save Product</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
