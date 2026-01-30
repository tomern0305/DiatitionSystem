import React from 'react';
import { X, LayoutGrid, Settings } from 'lucide-react';

export default function NavMenu({ isOpen, onClose, currentView, setView }) {
    if (!isOpen) return null;

    const handleNav = (view) => {
        setView(view);
        onClose();
    };

    return (
        <div className="nav-overlay" style={{
            position: 'fixed', inset: 0, zIndex: 1000, display: 'flex'
        }}>
            <div className="nav-backdrop" onClick={onClose} style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)'
            }} />

            <div className="nav-drawer" style={{
                position: 'relative', width: '280px', height: '100%', background: 'white',
                padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem',
                boxShadow: '0 0 20px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Menu</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={() => handleNav('inventory')}
                        className={`nav-item ${currentView === 'inventory' ? 'active' : ''}`}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                            borderRadius: '0.75rem', border: 'none', background: currentView === 'inventory' ? '#eff6ff' : 'transparent',
                            color: currentView === 'inventory' ? '#2563eb' : '#0f172a', fontWeight: 600, cursor: 'pointer',
                            fontSize: '1rem', textAlign: 'left'
                        }}
                    >
                        <LayoutGrid size={20} />
                        Kitchen Inventory
                    </button>

                    <button
                        onClick={() => handleNav('management')}
                        className={`nav-item ${currentView === 'management' ? 'active' : ''}`}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                            borderRadius: '0.75rem', border: 'none', background: currentView === 'management' ? '#eff6ff' : 'transparent',
                            color: currentView === 'management' ? '#2563eb' : '#0f172a', fontWeight: 600, cursor: 'pointer',
                            fontSize: '1rem', textAlign: 'left'
                        }}
                    >
                        <Settings size={20} />
                        Product Management
                    </button>

                    <button
                        onClick={() => handleNav('lineworker')}
                        className={`nav-item ${currentView === 'lineworker' ? 'active' : ''}`}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                            borderRadius: '0.75rem', border: 'none', background: currentView === 'lineworker' ? '#eff6ff' : 'transparent',
                            color: currentView === 'lineworker' ? '#2563eb' : '#0f172a', fontWeight: 600, cursor: 'pointer',
                            fontSize: '1rem', textAlign: 'left'
                        }}
                    >
                        <LayoutGrid size={20} />
                        <div>
                            <div>Line Worker View</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}>Simplified Catalog</div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNav('meal-builder')}
                        className={`nav-item ${currentView === 'meal-builder' ? 'active' : ''}`}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                            borderRadius: '0.75rem', border: 'none', background: currentView === 'meal-builder' ? '#eff6ff' : 'transparent',
                            color: currentView === 'meal-builder' ? '#2563eb' : '#0f172a', fontWeight: 600, cursor: 'pointer',
                            fontSize: '1rem', textAlign: 'left'
                        }}
                    >
                        <LayoutGrid size={20} />
                        <div>
                            <div>Meal Builder</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}>Create & Track</div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNav('saved-meals')}
                        className={`nav-item ${currentView === 'saved-meals' ? 'active' : ''}`}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                            borderRadius: '0.75rem', border: 'none', background: currentView === 'saved-meals' ? '#eff6ff' : 'transparent',
                            color: currentView === 'saved-meals' ? '#2563eb' : '#0f172a', fontWeight: 600, cursor: 'pointer',
                            fontSize: '1rem', textAlign: 'left'
                        }}
                    >
                        <LayoutGrid size={20} />
                        <div>
                            <div>Saved Meals</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}>View History</div>
                        </div>
                    </button>
                </nav>
            </div>
        </div>
    );
}
