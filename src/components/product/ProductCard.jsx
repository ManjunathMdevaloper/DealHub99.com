import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../../utils/wishlistActions';
import { MapPin, Tag, ArrowRight, Heart, Scaling, ShieldCheck, ShieldAlert } from 'lucide-react';
import AuthModal from '../common/AuthModal';

const ProductCard = ({ product }) => {
    const { currentUser, sellerData } = useAuth();
    const { compareItems, addToCompare } = useCompare();
    const [isWished, setIsWished] = useState(false);
    const [sellerStatus, setSellerStatus] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMessage, setAuthModalMessage] = useState("");
    const isCompared = compareItems.some(item => item.id === product.id);

    useEffect(() => {
        const fetchSellerStatus = async () => {
            if (product.sellerId) {
                const sellerRef = doc(db, 'sellers', product.sellerId);
                const sellerSnap = await getDoc(sellerRef);
                if (sellerSnap.exists()) {
                    setSellerStatus(sellerSnap.data().status);
                }
            }
        };
        fetchSellerStatus();
    }, [product.sellerId]);

    useEffect(() => {
        const checkWish = async () => {
            if (currentUser) {
                const wished = await isInWishlist(currentUser.uid, product.id);
                setIsWished(wished);
            }
        };
        checkWish();
    }, [currentUser, product.id]);

    const handleWish = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setAuthModalMessage("Please login to save products to your wishlist.");
            setIsAuthModalOpen(true);
            return;
        }
        if (isWished) {
            await removeFromWishlist(currentUser.uid, product.id);
            setIsWished(false);
        } else {
            await addToWishlist(currentUser.uid, product);
            setIsWished(true);
        }
    };

    const handleCompare = (e) => {
        e.preventDefault();
        if (!currentUser) {
            setAuthModalMessage("Please login to compare products.");
            setIsAuthModalOpen(true);
            return;
        }
        addToCompare(product);
    };

    return (
        <div className="glass-card animate-fade-in" style={{
            overflow: 'hidden',
            transition: 'var(--transition-fast)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Action Buttons Over Image - Hidden for Sellers */}
            {!sellerData && (
                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 10 }}>
                    <button
                        onClick={handleWish}
                        className="btn"
                        style={{ width: '35px', height: '35px', padding: 0, borderRadius: 'var(--radius-full)', backgroundColor: 'white', border: '1px solid var(--border-color)', color: isWished ? 'var(--error)' : 'var(--text-muted)' }}
                    >
                        <Heart size={18} fill={isWished ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        onClick={handleCompare}
                        className="btn"
                        style={{ width: '35px', height: '35px', padding: 0, borderRadius: 'var(--radius-full)', backgroundColor: isCompared ? 'var(--primary)' : 'white', border: '1px solid var(--border-color)', color: isCompared ? 'white' : 'var(--text-muted)' }}
                    >
                        <Scaling size={18} />
                    </button>
                </div>
            )}

            <div style={{ position: 'relative', height: '200px', backgroundColor: '#eee' }}>
                <img
                    src={product.images?.[0] || 'https://placehold.co/400x300?text=Listing'}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    backgroundColor: product.condition === 'New' ? 'var(--success)' : 'var(--accent)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                }}>
                    {product.condition}
                </div>
            </div>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--text-main)', lineHeight: '1.4' }}>
                        {product.title}
                    </h3>
                    {(product.isAdminProduct || sellerStatus === 'VERIFIED') ? (
                        <ShieldCheck size={18} color="var(--primary)" title="Highly Verified" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                        <ShieldAlert size={18} color="var(--error)" title="Unverified Seller" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                </div>

                <div style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem' }}>
                    ₹{product.price?.toLocaleString()}
                </div>

                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} />
                        {product.location?.city || 'India'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Tag size={14} />
                        {product.category}
                    </div>
                </div>

                <Link
                    to={`/product/${product.id}`}
                    className="btn btn-outline"
                    style={{ width: '100%', marginTop: 'auto', justifyContent: 'space-between' }}
                >
                    View Details
                    <ArrowRight size={16} />
                </Link>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                message={authModalMessage}
            />
        </div>
    );
};

export default ProductCard;
