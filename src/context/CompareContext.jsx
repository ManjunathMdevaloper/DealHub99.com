import React, { createContext, useContext, useState } from 'react';

const CompareContext = createContext();

export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
    const [compareItems, setCompareItems] = useState([]);
    const [error, setError] = useState(null);

    const addToCompare = (product) => {
        if (error) setError(null);

        if (compareItems.length >= 3) {
            showError("You can only compare up to 3 products at a time.");
            return false;
        }

        if (compareItems.length > 0 && compareItems[0].category !== product.category) {
            showError(`Cannot compare ${product.category} with ${compareItems[0].category}. Please select products from the same category.`);
            return false;
        }

        if (compareItems.find(item => item.id === product.id)) {
            setCompareItems(compareItems.filter(item => item.id !== product.id));
            return false;
        }

        setCompareItems([...compareItems, product]);
        return true;
    };

    const showError = (msg) => {
        setError(msg);
        setTimeout(() => setError(null), 4000);
    };

    const removeFromCompare = (productId) => {
        setCompareItems(compareItems.filter(item => item.id !== productId));
    };

    const clearCompare = () => setCompareItems([]);

    return (
        <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare, error, setError }}>
            {children}
            {error && (
                <div className="glass-panel animate-slide-in" style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    padding: '1rem 2rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #fecaca',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 20px 40px rgba(239, 68, 68, 0.15)',
                    maxWidth: '90vw'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#fef2f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        flexShrink: 0
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: '800', color: '#991b1b', fontSize: '0.9rem' }}>Comparison Warning</div>
                        <div style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: '500' }}>{error}</div>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
            )}
        </CompareContext.Provider>
    );
};
