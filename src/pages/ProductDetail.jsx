import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../utils/wishlistActions';
import { MapPin, Tag, Calendar, User, Share2, Heart, ShieldCheck, ShieldAlert, Mail, MessageSquare, Edit, Trash2 } from 'lucide-react';
import AuthModal from '../components/common/AuthModal';

const ProductDetail = () => {
    const { id } = useParams();
    const { currentUser, userData, sellerData } = useAuth();
    const navigate = useNavigate();

    // State declarations
    const [product, setProduct] = useState(null);
    const [sellerInfo, setSellerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isWished, setIsWished] = useState(false);
    const [enquirySent, setEnquirySent] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMessage, setAuthModalMessage] = useState("");
    const [myProductEnquiries, setMyProductEnquiries] = useState([]);

    useEffect(() => {
        if (currentUser && product && product.sellerId === currentUser.uid) {
            const q = query(collection(db, "enquiries"), where("productId", "==", id));
            getDocs(q).then(snap => {
                setMyProductEnquiries(snap.docs.map(doc => doc.id));
            });
        }
    }, [currentUser, product, id]);

    useEffect(() => {
        const checkWish = async () => {
            if (currentUser && product) {
                const wished = await isInWishlist(currentUser.uid, product.id);
                setIsWished(wished);
            }
        };
        checkWish();
    }, [currentUser, product]);

    const handleWish = async () => {
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
    const [enquiryData, setEnquiryData] = useState({
        name: userData?.name || currentUser?.displayName || "",
        phone: userData?.phone || "",
        message: "I am interested in this product. Please share more details."
    });

    // Update enquiry fields when userData loads
    useEffect(() => {
        if (userData) {
            setEnquiryData(prev => ({
                ...prev,
                name: prev.name || userData.name || "",
                phone: prev.phone || userData.phone || ""
            }));
        }
    }, [userData]);

    const hasIncremented = useRef(new Set());

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() };
                    setProduct(data);

                    // Fetch Seller Status
                    if (data.sellerId) {
                        const sellerRef = doc(db, 'sellers', data.sellerId);
                        const sellerSnap = await getDoc(sellerRef);
                        if (sellerSnap.exists()) {
                            setSellerInfo(sellerSnap.data());
                        }
                    }

                    // Increment View Count accurately (Avoid owner views and double-counting on mount)
                    const isOwner = currentUser && data.sellerId === currentUser.uid;
                    if (!isOwner && !hasIncremented.current.has(id)) {
                        hasIncremented.current.add(id);
                        await updateDoc(docRef, { views: increment(1) });
                    }
                } else {
                    // Fallback for demo products if DB is empty
                    const mockProducts = {
                        '1': { title: 'iPhone 15 Pro - Titanium Blue', price: 124900, condition: 'New', category: 'Mobiles', location: { city: 'Mumbai' }, description: 'Brand new iPhone 15 Pro with valid warranty. Never used.', sellerId: 'demo-seller', sellerName: 'Prashant Kumar', images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800'] },
                        '2': { title: 'BMW M4 Competition 2023', price: 14500000, condition: 'Used', category: 'Cars', location: { city: 'Delhi' }, description: 'Single owner, 5000km driven, pristine condition.', sellerId: 'demo-seller', sellerName: 'Elite Motors', images: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800'] },
                    };
                    if (mockProducts[id]) setProduct(mockProducts[id]);
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, currentUser]);

    const handleEnquiry = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setAuthModalMessage("Please login to send an enquiry to the seller.");
            setIsAuthModalOpen(true);
            return;
        }

        try {
            await addDoc(collection(db, 'enquiries'), {
                productId: id,
                productName: product.title,
                sellerId: product.sellerId,
                customerId: currentUser.uid,
                customerName: enquiryData.name || userData?.name || currentUser.displayName,
                customerEmail: currentUser.email,
                customerPhone: enquiryData.phone || userData?.phone || '',
                message: enquiryData.message,
                createdAt: serverTimestamp(),
                adminRead: false,
                isAdminProduct: product.isAdminProduct || false,
            });
            setEnquirySent(true);
        } catch (err) {
            console.error(err);
            alert("Failed to send enquiry.");
        }
    };

    if (loading) return <div className="container" style={{ padding: '8rem', textAlign: 'center' }}>Loading Product Details...</div>;
    if (!product) return <div className="container" style={{ padding: '8rem', textAlign: 'center' }}>Product not found.</div>;

    const isOwner = currentUser && product.sellerId === currentUser.uid;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.title,
                    text: `Check out this ${product.title} on our marketplace!`,
                    url: window.location.href,
                });
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const displayImages = product.images && product.images.length > 0
        ? product.images
        : ['https://placehold.co/800x600?text=No+Image+Available'];

    return (
        <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
            <div className="grid grid-cols-1 grid-cols-2" style={{ gap: '3rem' }}>
                {/* Gallery */}
                <div className="animate-fade-in" style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                    <div id="productCarousel" className="carousel slide glass-card" data-bs-ride="carousel" style={{ height: '500px', overflow: 'hidden', marginBottom: '1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
                        <div className="carousel-inner" style={{ height: '100%' }}>
                            {displayImages.map((img, idx) => (
                                <div key={idx} className={`carousel-item ${idx === 0 ? 'active' : ''}`} style={{ height: '500px' }}>
                                    <img
                                        src={img}
                                        className="d-block w-100"
                                        alt={`${product.title} - image ${idx + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#f8fafc' }}
                                    />
                                </div>
                            ))}
                        </div>
                        {displayImages.length > 1 && (
                            <>
                                <button className="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev" style={{ filter: 'invert(1)' }}>
                                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Previous</span>
                                </button>
                                <button className="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next" style={{ filter: 'invert(1)' }}>
                                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Next</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 1rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '700' }}>
                            {product.category}
                        </span>
                        <span className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 1rem', backgroundColor: '#f3f4f6', fontWeight: '700' }}>
                            {product.condition}
                        </span>
                        {isOwner && (
                            <span className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 1rem', backgroundColor: '#000', color: '#fff', fontWeight: '700' }}>
                                YOUR LISTING
                            </span>
                        )}
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: '950', marginBottom: '0.5rem', color: 'var(--bg-dark)' }}>{product.title}</h1>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '2rem' }}>
                        ₹{product.price?.toLocaleString()}
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', padding: '1.5rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <MapPin size={20} color="var(--primary)" />
                            <span style={{ fontWeight: '600' }}>{product.location?.city || 'India'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <Calendar size={20} color="var(--primary)" />
                            <span style={{ fontWeight: '600' }}>
                                {product.condition === 'Used' ? (product.yearOfPurchase ? `Purchased: ${product.yearOfPurchase}` : 'Used Item') : 'Brand New'}
                            </span>
                        </div>
                    </div>

                    <p style={{ lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
                        {product.description || "No description available for this product yet. Please contact the seller for more details."}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {isOwner ? (
                            <>
                                <Link
                                    to={`/seller/edit-product/${product.id}`}
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '1.25rem', gap: '0.75rem', fontSize: '1.1rem', textDecoration: 'none' }}
                                >
                                    <Edit size={22} />
                                    Edit Listing
                                </Link>
                                <button
                                    onClick={() => {
                                        if (myProductEnquiries.length > 0) {
                                            navigate(product.isAdminProduct ? `/admin?tab=enquiries&highlightProduct=${id}` : `/seller/dashboard?tab=enquiries`);
                                        } else {
                                            alert("No enquiries are there for this product.");
                                        }
                                    }}
                                    className="btn btn-outline"
                                    style={{ padding: '1.25rem', gap: '0.75rem', textDecoration: 'none', color: 'var(--primary)', cursor: 'pointer', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}
                                >
                                    <MessageSquare size={22} />
                                    Enquiries
                                </button>
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '1.25rem', color: 'var(--error)', borderColor: 'var(--error)' }}
                                    onClick={() => alert("Delete feature coming soon!")}
                                >
                                    <Trash2 size={22} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '1.25rem', gap: '0.75rem', fontSize: '1.1rem' }}
                                    onClick={() => document.getElementById('enquiry-form').scrollIntoView({ behavior: 'smooth' })}
                                >
                                    <Mail size={22} />
                                    Get Seller Details
                                </button>
                                {/* Wishlist hidden for sellers/owners */}
                                {!sellerData && (
                                    <button
                                        className="btn btn-outline"
                                        style={{
                                            padding: '1.25rem',
                                            color: isWished ? 'var(--error)' : 'var(--text-main)',
                                            borderColor: isWished ? 'var(--error)' : 'var(--border-color)'
                                        }}
                                        onClick={handleWish}
                                    >
                                        <Heart size={22} fill={isWished ? 'currentColor' : 'none'} />
                                    </button>
                                )}
                            </>
                        )}
                        <button className="btn btn-outline" style={{ padding: '1.25rem' }} onClick={handleShare}>
                            <Share2 size={22} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Enquiry for Buyer, Stats/Quick Tips for Owner */}
            <div className="grid grid-cols-1 grid-cols-3" style={{ gap: '3rem', marginTop: '6rem' }}>
                {isOwner ? (
                    <div className="glass-card" style={{ gridColumn: 'span 3', padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-main)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)' }}>
                                <ShieldCheck size={40} color="var(--primary)" />
                            </div>
                            <h2 style={{ fontWeight: '900' }}>You are the owner of this listing</h2>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Seller Info or Admin Badge */}
                        <div className="glass-card" style={{ padding: '2.5rem', height: 'fit-content' }}>
                            {product.isAdminProduct ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                        <ShieldCheck size={45} color="var(--primary)" />
                                    </div>
                                    <h3 style={{ fontWeight: '900', color: 'var(--primary)', marginBottom: '0.5rem' }}>Admin Product</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700' }}>(highly verified)</p>
                                    <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-sm)', color: '#166534', fontSize: '0.85rem', fontWeight: '800' }}>
                                        This item is listed directly by the platform administration after rigorous quality checks.
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 style={{ marginBottom: '1.75rem', fontWeight: '900', fontSize: '1.25rem' }}>Seller Information</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
                                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={35} color="var(--primary)" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '1.15rem' }}>{product.sellerName || 'Market Seller'}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {sellerInfo?.status === 'VERIFIED' ? 'Pro Seller' : 'New Seller'}
                                            </div>
                                        </div>
                                    </div>

                                    {sellerInfo?.status === 'VERIFIED' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--success)', fontSize: '0.9rem', fontWeight: '800', backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                                            <ShieldCheck size={20} /> Identity Verified
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--error)', fontSize: '0.9rem', fontWeight: '800', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                                            <ShieldAlert size={20} /> Un-Verified Account
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Enquiry Form */}
                        <div id="enquiry-form" className="glass-card grid-cols-2" style={{ padding: '2.5rem', gridColumn: 'span 2' }}>
                            <h3 style={{ marginBottom: '1.75rem', fontWeight: '900', fontSize: '1.25rem' }}>Safety-First Enquiry</h3>

                            {enquirySent ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }} className="animate-fade-in">
                                    <div style={{ color: 'var(--success)', fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem' }}>Enquiry Confirmed!</div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>The seller has been notified. We have also logged this request for your safety. Expect a call/email shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleEnquiry}>
                                    {product.isAdminProduct && (
                                        <div className="grid grid-cols-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <input
                                                    type="text"
                                                    className="input-field"
                                                    value={enquiryData.name}
                                                    onChange={(e) => setEnquiryData({ ...enquiryData, name: e.target.value })}
                                                    placeholder="Your Name (e.g. John Doe)"
                                                    required
                                                />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <input
                                                    type="text"
                                                    className="input-field"
                                                    value={enquiryData.phone}
                                                    onChange={(e) => setEnquiryData({ ...enquiryData, phone: e.target.value })}
                                                    placeholder="Phone Number (+91 ...)"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="input-group">
                                        <textarea
                                            className="input-field"
                                            rows="4"
                                            style={{ resize: 'none', height: 'auto', padding: '1rem' }}
                                            value={enquiryData.message}
                                            onChange={(e) => setEnquiryData({ ...enquiryData, message: e.target.value })}
                                            placeholder="Your Message (Ask about availability, price negotiation, or inspection time...)"
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ width: '100%', marginTop: '1rem' }}
                                    >
                                        <MessageSquare size={22} />
                                        Interested? Send Message
                                    </button>
                                    {!currentUser && (
                                        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fff7ed', borderRadius: 'var(--radius-sm)', border: '1px solid #ffedd5', color: '#9a3412', fontSize: '0.875rem', textAlign: 'center', fontWeight: '600' }}>
                                            Authentication Required: <Link to="/login" style={{ textDecoration: 'underline', color: 'var(--primary)' }}>Login</Link> to contact sellers.
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>
                    </>
                )}
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                message={authModalMessage}
            />
        </div>
    );
};

export default ProductDetail;
