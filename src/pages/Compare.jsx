import React from 'react';
import { useCompare } from '../context/CompareContext';
import { Link } from 'react-router-dom';
import { X, ArrowLeft, Scaling, Info } from 'lucide-react';

const Compare = () => {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();

    if (compareItems.length === 0) {
        return (
            <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>
                <Scaling size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                <h2 style={{ marginBottom: '1rem' }}>Comparison list is empty</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Add up to 3 products from the same category to compare them.</p>
                <Link to="/wishlist" className="btn btn-primary">Go to Wishlist</Link>
            </div>
        );
    }

    const attributes = [
        { label: 'Price', key: 'price', format: (v) => `₹${v.toLocaleString()}` },
        { label: 'Condition', key: 'condition' },
        { label: 'Category', key: 'category' },
        { label: 'Location', key: 'location', format: (v) => v.city },
        { label: 'Description', key: 'description' },
    ];

    // Specific attributes for used products
    const usedAttributes = [
        { label: 'Year', key: 'yearOfPurchase' },
        { label: 'Usage', key: 'usage' },
        { label: 'Owners', key: 'ownersCount' },
    ];

    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Product Comparison</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Side-by-side analysis of {compareItems.length} products</p>
                </div>
                <button className="btn btn-outline" onClick={clearCompare} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                    Clear All
                </button>
            </header>

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '200px', padding: '2rem', textAlign: 'left', borderBottom: '2px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                Features
                            </th>
                            {compareItems.map(item => (
                                <th key={item.id} style={{ padding: '2rem', borderBottom: '2px solid var(--border-color)', position: 'relative' }}>
                                    <button
                                        onClick={() => removeFromCompare(item.id)}
                                        style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--error)' }}
                                    >
                                        <X size={20} />
                                    </button>
                                    <img src={item.images?.[0] || 'https://placehold.co/150x150?text=Listing'} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} alt="" />
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>{item.title}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {attributes.map(attr => (
                            <tr key={attr.key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: 'var(--text-muted)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                                    {attr.label}
                                </td>
                                {compareItems.map(item => (
                                    <td key={item.id} style={{ padding: '1.5rem 2rem', verticalAlign: 'top' }}>
                                        {attr.format ? attr.format(item[attr.key]) : item[attr.key] || 'N/A'}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {compareItems[0].condition === 'Used' && usedAttributes.map(attr => (
                            <tr key={attr.key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: 'var(--text-muted)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                                    {attr.label}
                                </td>
                                {compareItems.map(item => (
                                    <td key={item.id} style={{ padding: '1.5rem 2rem' }}>
                                        {item[attr.key] || 'N/A'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                    <ArrowLeft size={18} /> Add more products
                </Link>
            </div>
        </div>
    );
};

export default Compare;
