import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, writeBatch } from 'firebase/firestore';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { LayoutDashboard, CheckCircle, XCircle, Users, Package, MessageSquare, ShieldAlert, Edit, Eye } from 'lucide-react';

const AdminPanel = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'products');
    const highlightId = searchParams.get('highlight');
    const highlightProduct = searchParams.get('highlightProduct');
    const [data, setData] = useState({ products: [], sellers: [], enquiries: [] });
    const [loading, setLoading] = useState(true);
    const [sellerSearch, setSellerSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [selectedSeller, setSelectedSeller] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const prodSnap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
            const products = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const sellSnap = await getDocs(query(collection(db, "sellers"), orderBy("createdAt", "desc")));
            const sellers = sellSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const enqSnap = await getDocs(query(collection(db, "enquiries"), orderBy("createdAt", "desc")));
            const enquiries = enqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setData({ products, sellers, enquiries });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tabId, productId = null) => {
        if (activeTab === tabId && !productId) {
            setActiveTab(null);
            setSearchParams({});
        } else {
            setActiveTab(tabId);
            const params = { tab: tabId };
            if (productId) params.highlightProduct = productId;
            setSearchParams(params);
        }
        setSelectedSeller(null);
    };

    useEffect(() => {
        if (highlightId && !loading) {
            setTimeout(() => {
                const element = document.getElementById(`row-${highlightId}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [highlightId, loading, activeTab]);

    useEffect(() => {
        const markAsRead = async () => {
            if (activeTab === 'enquiries' && data.enquiries.length > 0) {
                const unreadEnquiries = data.enquiries.filter(enq => enq.adminRead === false);
                if (unreadEnquiries.length > 0) {
                    const batch = writeBatch(db);
                    unreadEnquiries.forEach(enq => {
                        const enqRef = doc(db, 'enquiries', enq.id);
                        batch.update(enqRef, { adminRead: true });
                    });
                    try {
                        await batch.commit();
                        setData(prev => ({
                            ...prev,
                            enquiries: prev.enquiries.map(enq => ({ ...enq, adminRead: true }))
                        }));
                    } catch (err) {
                        console.error("Error marking enquiries as read:", err);
                    }
                }
            }
        };
        markAsRead();
    }, [activeTab, data.enquiries.length]);

    const handleStatusUpdate = async (type, id, newStatus) => {
        let blockReason = "";
        if (newStatus === 'BLOCKED') {
            blockReason = prompt("Please provide a reason for blocking this seller:");
            if (blockReason === null) return;
        }

        try {
            const docRef = doc(db, type, id);
            const updatePayload = { status: newStatus };
            if (blockReason) updatePayload.blockReason = blockReason;
            await updateDoc(docRef, updatePayload);

            if (type === 'sellers') {
                const prodQuery = query(collection(db, "products"), where("sellerId", "==", id));
                const prodSnap = await getDocs(prodQuery);
                for (const d of prodSnap.docs) {
                    await updateDoc(d.ref, { sellerStatus: newStatus === 'BLOCKED' ? 'BLOCKED' : 'VERIFIED' });
                }
            }
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Error updating status");
        }
    };

    const renderContent = (tabId) => {
        switch (tabId) {
            case 'products':
                return (
                    <div className="glass-card animate-fade-in">
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ fontWeight: '800' }}>Product Approval Queue</div>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="input-field"
                                style={{ maxWidth: '300px', padding: '0.5rem' }}
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                        </div>
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '1.25rem' }}>Product & Seller</th>
                                        <th style={{ textAlign: 'left', padding: '1.25rem' }}>Details</th>
                                        <th style={{ textAlign: 'left', padding: '1.25rem' }}>Views</th>
                                        <th style={{ textAlign: 'left', padding: '1.25rem' }}>Status</th>
                                        <th style={{ textAlign: 'left', padding: '1.25rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.products.filter(p => p.title?.toLowerCase().includes(productSearch.toLowerCase()) || p.sellerName?.toLowerCase().includes(productSearch.toLowerCase())).map(prod => (
                                        <tr key={prod.id} id={`row-${prod.id}`} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: highlightId === prod.id ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent' }}>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontWeight: '700' }}>{prod.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By: {prod.sellerName}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--primary)' }}>₹{prod.price?.toLocaleString()}</div>
                                                <div style={{ fontSize: '0.8rem' }}>{prod.category}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><LayoutDashboard size={14} />{prod.views || 0}</div></td>
                                            <td style={{ padding: '1.25rem' }}><span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: prod.status === 'APPROVED' ? '#dcfce7' : '#fef3c7', color: prod.status === 'APPROVED' ? '#166534' : '#92400e', fontWeight: '800' }}>{prod.status}</span></td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {!prod.isAdminProduct && (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate('products', prod.id, 'APPROVED')} className="btn" style={{ padding: '0.5rem', backgroundColor: '#dcfce7', color: '#166534' }} title="Approve"><CheckCircle size={18} /></button>
                                                            <button onClick={() => handleStatusUpdate('products', prod.id, 'REJECTED')} className="btn" style={{ padding: '0.5rem', backgroundColor: '#fef2f2', color: '#991b1b' }} title="Reject"><XCircle size={18} /></button>
                                                        </>
                                                    )}
                                                    <Link to={`/product/${prod.id}`} className="btn" style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }} title="View"><Eye size={18} /></Link>
                                                    {prod.isAdminProduct && <Link to={`/seller/edit-product/${prod.id}`} className="btn" style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', color: 'var(--text-main)' }} title="Edit"><Edit size={18} /></Link>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'my_products':
                return (
                    <div className="glass-card animate-fade-in">
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ fontWeight: '800' }}>Admin Listings</div>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="input-field"
                                style={{ maxWidth: '300px', padding: '0.5rem' }}
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                        </div>
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '1.25rem' }}>Product</th>
                                        <th style={{ textAlign: 'left', padding: '1.25rem' }}>Category & Price</th>
                                        <th style={{ textAlign: 'left', padding: '1.25rem' }}>Enquiries</th>
                                        <th style={{ textAlign: 'left', padding: '1.25rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.products.filter(p => p.isAdminProduct && p.title?.toLowerCase().includes(productSearch.toLowerCase())).map(prod => {
                                        const enqs = data.enquiries.filter(e => e.productId === prod.id);
                                        return (
                                            <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1.25rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><img src={prod.images?.[0]} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} alt="" /><div style={{ fontWeight: '700' }}>{prod.title}</div></div></td>
                                                <td style={{ padding: '1.25rem' }}><div style={{ fontWeight: '600' }}>₹{prod.price?.toLocaleString()}</div><div style={{ fontSize: '0.8rem' }}>{prod.category}</div></td>
                                                <td style={{ padding: '1.25rem' }}><div onClick={() => enqs.length > 0 && handleTabChange('enquiries', prod.id)} style={{ cursor: 'pointer', color: enqs.length > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{enqs.length} Leads</div></td>
                                                <td style={{ padding: '1.25rem' }}><div style={{ display: 'flex', gap: '0.5rem' }}><Link to={`/product/${prod.id}`} className="btn" style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }} title="View"><Eye size={18} /></Link><Link to={`/seller/edit-product/${prod.id}`} className="btn" style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', color: 'var(--text-main)' }} title="Edit"><Edit size={18} /></Link></div></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'sellers':
                return (
                    <div className="animate-fade-in">
                        {selectedSeller ? (
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <button onClick={() => setSelectedSeller(null)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>← Back</button>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{selectedSeller.name}'s Products</h2>
                                    </div>
                                    <span style={{ fontWeight: '800', color: selectedSeller.status === 'VERIFIED' ? 'var(--success)' : 'var(--accent)' }}>{selectedSeller.status}</span>
                                </div>
                                <div className="table-responsive">
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead><tr><th style={{ textAlign: 'left', padding: '1rem' }}>Title</th><th style={{ textAlign: 'left', padding: '1rem' }}>Status</th><th style={{ textAlign: 'left', padding: '1rem' }}>Action</th></tr></thead>
                                        <tbody>
                                            {data.products.filter(p => p.sellerId === selectedSeller.id).map(prod => (
                                                <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '1rem' }}>{prod.title}</td>
                                                    <td style={{ padding: '1rem' }}>{prod.status}</td>
                                                    <td style={{ padding: '1rem' }}><button onClick={() => handleStatusUpdate('products', prod.id, 'APPROVED')} className="btn" style={{ padding: '0.4rem' }}><CheckCircle size={16} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card">
                                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ fontWeight: '800' }}>Seller Management</div>
                                    <input type="text" placeholder="Search sellers..." className="input-field" style={{ maxWidth: '300px', padding: '0.5rem' }} value={sellerSearch} onChange={(e) => setSellerSearch(e.target.value)} />
                                </div>
                                <div className="table-responsive">
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead><tr><th style={{ textAlign: 'left', padding: '1.25rem' }}>Seller</th><th style={{ textAlign: 'left', padding: '1.25rem' }}>Status</th><th style={{ textAlign: 'left', padding: '1.25rem' }}>Actions</th></tr></thead>
                                        <tbody>
                                            {data.sellers.filter(s => s.name?.toLowerCase().includes(sellerSearch.toLowerCase())).map(sell => (
                                                <tr key={sell.id} onClick={() => setSelectedSeller(sell)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-fast)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.01)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <td style={{ padding: '1.25rem' }}>
                                                        <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{sell.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sell.email}</div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem' }}>
                                                        <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '4px', backgroundColor: sell.status === 'VERIFIED' ? '#dcfce7' : sell.status === 'BLOCKED' ? '#fef2f2' : '#fef3c7', color: sell.status === 'VERIFIED' ? '#166534' : sell.status === 'BLOCKED' ? '#991b1b' : '#92400e', fontWeight: '800' }}>{sell.status}</span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem' }} onClick={e => e.stopPropagation()}>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={() => handleStatusUpdate('sellers', sell.id, 'VERIFIED')} className="btn" style={{ padding: '0.5rem', backgroundColor: '#dcfce7', color: '#166534' }} title="Verify Seller"><CheckCircle size={18} /></button>
                                                            <button onClick={() => handleStatusUpdate('sellers', sell.id, 'BLOCKED')} className="btn" style={{ padding: '0.5rem', backgroundColor: '#fef2f2', color: '#991b1b' }} title="Block Seller"><XCircle size={18} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'enquiries':
                return (
                    <div className="grid grid-cols-1 grid-cols-2" style={{ gap: '1.25rem' }}>
                        {(highlightProduct ? data.enquiries.filter(e => e.productId === highlightProduct) : data.enquiries).map(enq => (
                            <div key={enq.id} id={`row-${enq.id}`} className="glass-card" style={{ padding: '1.5rem', border: highlightId === enq.id ? '2px solid var(--primary)' : '1px solid var(--border-color)' }}>
                                <div style={{ fontWeight: '900', color: 'var(--primary)', marginBottom: '0.5rem' }}>{enq.productName}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
                                    <div><strong>{enq.customerName}</strong><br />{enq.customerPhone}</div>
                                    <div style={{ fontStyle: 'italic' }}>"{enq.message}"</div>
                                </div>
                            </div>
                        ))}
                        {data.enquiries.length === 0 && <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>No enquiries found.</div>}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container" style={{ padding: '3rem 1rem' }}>
            <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ flex: '1', minWidth: '280px' }}>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: '950', color: 'var(--bg-dark)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <ShieldAlert size={40} color="var(--primary)" /> Admin Console
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>dealhub99.com oversight and administration hub.</p>
                </div>
                <Link to="/admin/add-product" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', gap: '0.5rem', whiteSpace: 'nowrap', width: 'fit-content' }}>
                    <Package size={20} /> List Admin Product
                </Link>
            </header>

            <div className="grid grid-cols-1 grid-cols-2 grid-cols-4" style={{ gap: '1.25rem', marginBottom: '3rem' }}>
                {[
                    { id: 'products', label: 'Approvals', count: `${data.products.length} Items`, icon: <Package size={22} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
                    { id: 'my_products', label: 'My Listings', count: `${data.products.filter(p => p.isAdminProduct).length} Items`, icon: <ShieldAlert size={22} />, color: '#6366f1', bg: '#eef2ff' },
                    { id: 'sellers', label: 'Sellers', count: `${data.sellers.length} Profiles`, icon: <Users size={22} />, color: '#059669', bg: '#ecfdf5' },
                    { id: 'enquiries', label: 'Leads', count: `${data.enquiries.length} Messages`, icon: <MessageSquare size={22} />, color: '#d97706', bg: '#fffbeb' },
                ].map(tab => (
                    <React.Fragment key={tab.id}>
                        <div
                            onClick={() => handleTabChange(tab.id)}
                            className="glass-card"
                            style={{
                                padding: '1.25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                border: activeTab === tab.id ? `2px solid ${tab.color}` : '1px solid var(--border-color)',
                                backgroundColor: activeTab === tab.id ? tab.bg : 'white',
                                transition: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                textAlign: 'center',
                                transform: activeTab === tab.id ? 'scale(1.02)' : 'scale(1)',
                                zIndex: activeTab === tab.id ? '10' : '1'
                            }}
                        >
                            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: activeTab === tab.id ? 'white' : tab.bg, color: tab.color }}>{tab.icon}</div>
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: activeTab === tab.id ? tab.color : 'var(--text-main)' }}>{tab.label}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{tab.count}</div>
                            </div>
                        </div>
                        {/* Mobile Accordion Content */}
                        <div className="show-on-mobile" style={{ gridColumn: '1 / -1' }}>
                            {activeTab === tab.id && (
                                <div style={{
                                    marginTop: '1rem',
                                    marginBottom: '2rem',
                                    animation: 'fadeIn 0.3s ease-out'
                                }}>
                                    {renderContent(tab.id)}
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                ))}
            </div>

            {/* Desktop Only Content */}
            <div className="hide-on-mobile">
                {activeTab && renderContent(activeTab)}
            </div>

        </div>
    );
};

export default AdminPanel;
