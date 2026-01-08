import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWishlist, removeFromWishlist } from '../utils/wishlistActions';
import ProductCard from '../components/product/ProductCard';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
    const { currentUser } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        if (!currentUser) return;
        try {
            const data = await getWishlist(currentUser.uid);
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [currentUser]);

    const handleRemove = async (id) => {
        await removeFromWishlist(currentUser.uid, id);
        setItems(items.filter(item => item.id !== id));
    };

    if (loading) return <div className="container" style={{ padding: '5rem' }}>Loading Wishlist...</div>;

    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <Heart size={48} color="var(--error)" fill="var(--error)" style={{ marginBottom: '1rem' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Your Wishlist</h1>
                <p style={{ color: 'var(--text-muted)' }}>Items you've saved for later</p>
            </header>

            {items.length > 0 ? (
                <div className="grid grid-cols-1 grid-cols-2 grid-cols-4">
                    {items.map(item => (
                        <div key={item.id} style={{ position: 'relative' }}>
                            <ProductCard product={item} />
                            <button
                                onClick={() => handleRemove(item.id)}
                                className="btn btn-outline"
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    backgroundColor: 'white',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '0.5rem',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--error)'
                                }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card" style={{ textAlign: 'center', padding: '5rem', maxWidth: '600px', margin: '0 auto' }}>
                    <ShoppingBag size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                    <h2 style={{ marginBottom: '1rem' }}>Your wishlist is empty</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Browse our marketplace and save the products you love!</p>
                    <Link to="/" className="btn btn-primary">Start Exploring</Link>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
