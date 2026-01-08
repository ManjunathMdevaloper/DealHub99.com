import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User, Heart, MessageSquare, History, Settings, ExternalLink, Save, X, Phone, Mail, ShieldAlert, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';

const UserProfile = () => {
    const { currentUser, userData, sellerData } = useAuth();
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [updateLoading, setUpdateLoading] = useState(false);
    const navigate = useNavigate();

    const isSeller = !!sellerData;
    const isAdmin = userData?.role === 'ADMIN';

    useEffect(() => {
        const fetchUserActivity = async () => {
            if (!currentUser || isAdmin || isSeller) {
                setLoading(false);
                return;
            }
            try {
                const q = query(
                    collection(db, "enquiries"),
                    where("customerId", "==", currentUser.uid),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                setEnquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserActivity();

        // Initialize edit data
        if (isSeller) {
            setEditData({ name: sellerData.name, mobile: sellerData.mobile });
        } else {
            setEditData({ name: userData?.name || '', phone: userData?.phone || '' });
        }
    }, [currentUser, isAdmin, isSeller, userData, sellerData]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const collectionName = isSeller ? 'sellers' : 'users';
            const userRef = doc(db, collectionName, currentUser.uid);
            await updateDoc(userRef, editData);
            setIsEditing(false);
            window.location.reload(); // Refresh to show new data from context
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update profile.");
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '5rem' }}>Loading Profile...</div>;

    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            <div className="grid grid-cols-1 grid-cols-3" style={{ gap: '2rem' }}>
                {/* Sidebar */}
                <div>
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: isSeller ? '#fef3c7' : isAdmin ? '#fee2e2' : 'var(--primary-light)', color: isSeller ? '#d97706' : isAdmin ? '#dc2626' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid currentColor' }}>
                            <User size={50} />
                        </div>

                        {!isEditing ? (
                            <>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{isSeller ? sellerData.name : (userData?.role === 'ADMIN' ? 'Administrator' : (userData?.name || 'User'))}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{currentUser.email}</p>
                                {((isSeller && sellerData.mobile) || (!isSeller && userData?.phone)) && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{isSeller ? sellerData.mobile : userData.phone}</p>
                                )}
                                <button onClick={() => setIsEditing(true)} className="btn btn-outline" style={{ width: '100%', gap: '0.5rem' }}>
                                    <Settings size={18} /> Edit Profile
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleUpdate} style={{ textAlign: 'left' }}>
                                <div className="input-group">
                                    <label className="input-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="input-field"
                                        value={isSeller ? editData.mobile : editData.phone}
                                        onChange={(e) => setEditData({ ...editData, [isSeller ? 'mobile' : 'phone']: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="submit" disabled={updateLoading} className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }}>
                                        <Save size={18} /> {updateLoading ? '...' : 'Save'}
                                    </button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ flex: 1, padding: '0.5rem' }}>
                                        <X size={18} /> Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {!isAdmin && !isSeller && (
                        <div className="glass-card" style={{ padding: '1rem' }}>
                            <Link to="/wishlist" className="btn btn-outline" style={{ width: '100%', border: 'none', justifyContent: 'flex-start', gap: '1rem' }}>
                                <Heart size={20} /> My Wishlist
                            </Link>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div style={{ gridColumn: 'span 2' }}>
                    {isAdmin ? (
                        <section className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                            <ShieldAlert size={64} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>Admin Access</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You are logged in as an administrator with full platform control.</p>
                            <Link to="/admin" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 2rem' }}>Go to Admin Console</Link>
                        </section>
                    ) : isSeller ? (
                        <section className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                            <ShoppingBag size={64} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>Seller Account</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage your products, leads, and sales from your dedicated dashboard.</p>
                            <Link to="/seller/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 2rem' }}>Go to Seller Dashboard</Link>
                        </section>
                    ) : (
                        <section className="glass-card" style={{ padding: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <MessageSquare size={24} color="var(--primary)" /> Enquiries Sent
                            </h3>

                            {enquiries.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {enquiries.map(enq => (
                                        <div key={enq.id} className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{enq.productName}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sent on {enq.createdAt?.toDate().toLocaleDateString()}</div>
                                                </div>
                                                <Link to={`/product/${enq.productId}`} style={{ color: 'var(--primary)' }}>
                                                    <ExternalLink size={20} />
                                                </Link>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)' }}>
                                                "{enq.message}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    You haven't sent any enquiries yet.
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
