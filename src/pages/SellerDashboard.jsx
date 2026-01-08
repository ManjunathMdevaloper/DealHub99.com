import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSellerProducts } from '../utils/productActions';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { LayoutDashboard, Package, MessageSquare, Eye, Plus, ShoppingBag, Clock, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';

const SellerDashboard = () => {
    const { currentUser, sellerData } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'products');
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab) => {
        if (activeTab === tab) {
            setActiveTab(null);
            setSearchParams({});
        } else {
            setActiveTab(tab);
            setSearchParams({ tab });
        }
    };

    const highlightId = searchParams.get('highlight');

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                const myProducts = await getSellerProducts(currentUser.uid);
                setProducts(myProducts);

                const q = query(
                    collection(db, "enquiries"),
                    where("sellerId", "==", currentUser.uid)
                );
                const snapshot = await getDocs(q);
                const localEnquiries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                localEnquiries.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setEnquiries(localEnquiries);

            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Failed to fetch dashboard data. Please refresh.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    useEffect(() => {
        if (highlightId && activeTab === 'enquiries' && enquiries.length > 0) {
            const element = document.getElementById(`enquiry-${highlightId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [highlightId, activeTab, enquiries]);

    const StatusBadge = ({ status }) => {
        const styles = {
            APPROVED: { color: 'var(--success)', bg: '#ecfdf5', icon: <CheckCircle size={14} /> },
            PENDING: { color: 'var(--accent)', bg: '#fffbeb', icon: <Clock size={14} /> },
            REJECTED: { color: 'var(--error)', bg: '#fef2f2', icon: <XCircle size={14} /> }
        };
        const s = styles[status] || styles.PENDING;
        return (
            <span style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '2px 10px',
                borderRadius: 'var(--radius-full)', backgroundColor: s.bg, color: s.color,
                fontSize: '0.75rem', fontWeight: '700'
            }}>
                {s.icon} {status}
            </span>
        );
    };

    const renderContent = (tabId) => {
        if (tabId === 'products') {
            return (
                <div className="animate-fade-in">
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem',
                        backgroundColor: 'white', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)', maxWidth: '400px'
                    }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search your products..."
                            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.9rem' }}
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                        />
                    </div>
                    <div className="glass-card" style={{ overflow: 'hidden' }}>
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '1rem 2rem' }}>Product</th>
                                        <th style={{ textAlign: 'left', padding: '1rem 2rem' }}>Price</th>
                                        <th style={{ textAlign: 'left', padding: '1rem 2rem' }}>Status</th>
                                        <th style={{ textAlign: 'left', padding: '1rem 2rem' }}>Views</th>
                                        <th style={{ textAlign: 'left', padding: '1rem 2rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products
                                        .filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()))
                                        .map(product => (
                                            <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1rem 2rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <img src={product.images?.[0] || 'https://placehold.co/50x50?text=Listing'} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} alt="" />
                                                        <span style={{ fontWeight: '600' }}>{product.title}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 2rem' }}>₹{product.price?.toLocaleString()}</td>
                                                <td style={{ padding: '1rem 2rem' }}><StatusBadge status={product.status} /></td>
                                                <td style={{ padding: '1rem 2rem' }}>{product.views || 0}</td>
                                                <td style={{ padding: '1rem 2rem' }}>
                                                    <Link to={`/product/${product.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600' }}>View Details</Link>
                                                </td>
                                            </tr>
                                        ))}
                                    {products.length === 0 && (
                                        <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products listed yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        } else if (tabId === 'enquiries') {
            return (
                <div className="grid grid-cols-1 grid-cols-2" style={{ gap: '1.5rem' }}>
                    {enquiries.map(enq => (
                        <div
                            key={enq.id}
                            id={`enquiry-${enq.id}`}
                            className="glass-card"
                            style={{
                                padding: '1.5rem',
                                border: highlightId === enq.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                transform: highlightId === enq.id ? 'scale(1.02)' : 'scale(1)',
                                transition: '0.5s ease',
                                boxShadow: highlightId === enq.id ? '0 0 20px rgba(var(--primary-rgb), 0.2)' : 'var(--shadow-md)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{enq.productName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{enq.createdAt?.toDate().toLocaleDateString()}</div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontWeight: '600' }}>{enq.customerName}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{enq.customerEmail} | {enq.customerPhone}</div>
                                <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-main)', backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                                    "{enq.message}"
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <a href={`mailto:${enq.customerEmail}`} className="btn btn-primary" style={{ flex: 1, fontSize: '0.75rem' }}>Email Customer</a>
                                {enq.customerPhone && <a href={`tel:${enq.customerPhone}`} className="btn btn-outline" style={{ flex: 1, fontSize: '0.75rem' }}>Call Now</a>}
                            </div>
                        </div>
                    ))}
                    {enquiries.length === 0 && (
                        <div style={{ gridColumn: 'span 2', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }} className="glass-card">
                            No enquiries received for your products yet.
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };


    if (loading) return <div className="container" style={{ padding: '5rem' }}>Loading Dashboard...</div>;

    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Seller Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {sellerData?.name || 'Partner'}</p>
                </div>
                <Link to="/seller/add-product" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', gap: '0.5rem', width: 'fit-content' }}>
                    <Plus size={20} /> List New Product
                </Link>
            </header>

            {sellerData?.status === 'BLOCKED' && (
                <div style={{
                    backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b',
                    padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '3rem',
                    display: 'flex', flexDirection: 'column', gap: '1rem',
                    boxShadow: '0 4px 15px rgba(153, 27, 27, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '900', fontSize: '1.25rem' }}>
                        <XCircle size={28} /> Account Restricted
                    </div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6', opacity: 0.9 }}>
                        Your seller account has been blocked by the administrator.
                        <strong> Reason: {sellerData.blockReason || 'Violation of marketplace policies.'}</strong>
                    </p>
                </div>
            )}

            {error && (
                <div style={{
                    backgroundColor: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e',
                    padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem'
                }}>
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 grid-cols-3" style={{ gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { id: 'products', label: 'Total Products', val: products.length, icon: <ShoppingBag size={24} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
                    { id: 'enquiries', label: 'New Enquiries', val: enquiries.length, icon: <MessageSquare size={24} />, color: 'var(--accent)', bg: '#fef3c7' },
                    { id: 'views', label: 'Total Views', val: products.reduce((acc, p) => acc + (p.views || 0), 0), icon: <Eye size={24} />, color: 'var(--success)', bg: '#dcfce7' },
                ].map(stat => (
                    <React.Fragment key={stat.id}>
                        <div
                            className="glass-card"
                            onClick={() => handleTabChange(stat.id === 'views' ? 'products' : stat.id)}
                            style={{
                                padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
                                cursor: 'pointer', transition: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: (activeTab === stat.id || (stat.id === 'views' && activeTab === 'products')) ? `2px solid ${stat.color}` : '1px solid var(--border-color)',
                                transform: (activeTab === stat.id || (stat.id === 'views' && activeTab === 'products')) ? 'translateY(-4px)' : 'translateY(0)',
                                backgroundColor: (activeTab === stat.id || (stat.id === 'views' && activeTab === 'products')) ? 'white' : 'transparent'
                            }}
                        >
                            <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: stat.bg, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stat.val}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                            </div>
                        </div>

                        {/* Mobile Accordion */}
                        <div className="show-on-mobile" style={{ gridColumn: '1 / -1' }}>
                            {(activeTab === stat.id || (stat.id === 'views' && activeTab === 'products')) && (
                                <div style={{ marginTop: '1rem', marginBottom: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
                                    {renderContent(activeTab)}
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                ))}
            </div>

            {/* Desktop View Content */}
            <div className="hide-on-mobile">
                {activeTab && renderContent(activeTab)}
            </div>
        </div>
    );
};

export default SellerDashboard;
