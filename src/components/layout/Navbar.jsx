import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import { useLocation as useCityLocation } from '../../context/LocationContext';
import { Search, User, Heart, LogOut, Scale, MapPin, Bell, Navigation, Menu, X as CloseIcon, ArrowLeft } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useRef } from 'react';

const Navbar = () => {
    const { currentUser, userData, logout, sellerData } = useAuth();
    const { compareItems } = useCompare();
    const { selectedLocation, setLocation, detectLocation } = useCityLocation();
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const [notificationList, setNotificationList] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLocationMenu, setShowLocationMenu] = useState(false);
    const [showMobileLocation, setShowMobileLocation] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const locationRef = useRef(null);

    const isAdminPath = routerLocation.pathname.startsWith('/admin');
    const isSellerPath = routerLocation.pathname.startsWith('/seller');
    const isPortal = isAdminPath || isSellerPath;

    // Visibility check for auth pages
    const authPages = ['/login', '/register', '/admin/login', '/seller/login', '/seller/register', '/forgot-password'];
    const isAuthPage = authPages.includes(routerLocation.pathname);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (locationRef.current && !locationRef.current.contains(event.target)) {
                setShowLocationMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!currentUser) {
            setNotificationList([]);
            return;
        }

        let unsubscribes = [];

        if (userData?.role === 'ADMIN') {
            let sellerNotifs = [];
            let productNotifs = [];
            let enquiryNotifs = [];

            const updateAdmin = () => {
                const combined = [...sellerNotifs, ...productNotifs, ...enquiryNotifs].sort((a, b) => (b.time || 0) - (a.time || 0));
                setNotificationList(combined);
            };

            unsubscribes.push(onSnapshot(query(collection(db, "sellers"), where("status", "==", "PENDING")), s => {
                sellerNotifs = s.docs.map(d => ({ id: d.id, title: 'New Seller', subtitle: d.data().name, link: `/admin?tab=sellers&highlight=${d.id}`, time: d.data().createdAt?.toDate() }));
                updateAdmin();
            }));

            unsubscribes.push(onSnapshot(query(collection(db, "products"), where("status", "==", "PENDING")), s => {
                productNotifs = s.docs.map(d => ({ id: d.id, title: 'Product Approval', subtitle: d.data().title, link: `/admin?tab=products&highlight=${d.id}`, time: d.data().createdAt?.toDate() }));
                updateAdmin();
            }));

            unsubscribes.push(onSnapshot(query(collection(db, "enquiries"), where("adminRead", "==", false)), s => {
                enquiryNotifs = s.docs.map(d => ({ id: d.id, title: 'New Enquiry', subtitle: d.data().productName, link: `/admin?tab=enquiries&highlight=${d.id}`, time: d.data().createdAt?.toDate() }));
                updateAdmin();
            }));
        } else if (sellerData) {
            const q = query(collection(db, "enquiries"), where("sellerId", "==", currentUser.uid));
            unsubscribes.push(onSnapshot(q, s => {
                const list = s.docs.map(d => ({ id: d.id, title: 'New Enquiry', subtitle: d.data().customerName, link: `/seller/dashboard?tab=enquiries&highlight=${d.id}`, time: d.data().createdAt?.toDate() }));
                setNotificationList(list.sort((a, b) => b.time - a.time));
            }));
        }

        return () => unsubscribes.forEach(u => u());
    }, [currentUser, sellerData, userData]);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
            setMobileMenuOpen(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const logoContent = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
                width: '38px',
                height: '38px',
                backgroundColor: 'var(--primary-light)',
                borderRadius: '12px',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.15)'
            }}>
                <img
                    src="/favicon.png"
                    alt="dealhub99.com"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </div>
            <span className="text-gradient" style={{ fontSize: '1.5rem', letterSpacing: '-0.5px' }}>dealhub99.com</span>
        </div>
    );

    if (isAuthPage) return null;

    return (
        <nav className="glass-panel" style={{
            position: 'sticky',
            top: '0',
            left: '0',
            right: '0',
            zIndex: 1500,
            margin: '0',
            height: '50px',
            padding: '1rem 2rem',
            borderRadius: '0',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-color)',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div className="navbar-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '1rem', marginTop: '-0.75rem' }}>

                {/* Back Button & Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {location.pathname !== '/' && (
                        <button
                            onClick={() => navigate(-1)}
                            className="btn btn-outline"
                            style={{
                                padding: '0.4rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '32px',
                                height: '32px',
                                border: '1px solid var(--border-color)',
                                background: 'white',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isPortal ? (
                            <div
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: '950', cursor: 'pointer' }}
                            >
                                {logoContent}
                            </div>
                        ) : (
                            <Link
                                to="/"
                                onClick={(e) => {
                                    if (window.location.pathname === '/') {
                                        e.preventDefault();
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    } else {
                                        window.scrollTo(0, 0);
                                    }
                                }}
                                style={{ fontSize: '1.25rem', fontWeight: '950', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {logoContent}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Desktop Search & Controls - Hidden on Mobile and Admin Portal */}
                {!isAdminPath && (
                    <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'center', maxWidth: '800px' }}>
                        <div className="location-picker-container" style={{ position: 'relative' }} ref={locationRef}>
                            <div
                                className="glass-card"
                                onClick={() => setShowLocationMenu(!showLocationMenu)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'white',
                                    border: '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    minWidth: '150px'
                                }}
                            >
                                <MapPin size={16} color="var(--primary)" />
                                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)', flex: 1 }}>
                                    {selectedLocation}
                                </span>
                                <Navigation
                                    size={14}
                                    style={{ transform: showLocationMenu ? 'rotate(180deg)' : 'none', transition: '0.3s' }}
                                    color="var(--text-muted)"
                                />
                            </div>

                            {showLocationMenu && (
                                <div className="glass-card animate-scale" style={{
                                    position: 'absolute',
                                    top: '120%',
                                    left: 0,
                                    width: '220px',
                                    padding: '0.75rem',
                                    zIndex: 1100,
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem 0.5rem 0.5rem' }}>Location Settings</div>
                                    <button
                                        onClick={() => {
                                            detectLocation();
                                            setShowLocationMenu(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                            backgroundColor: 'var(--primary)',
                                            borderRadius: '12px',
                                            color: '#ffffff',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            fontSize: '0.85rem',
                                            marginBottom: '0.75rem',
                                            boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.2)'
                                        }}
                                    >
                                        <Navigation size={14} /> Detect Live Location
                                    </button>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        {['All India', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'].map(city => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    setLocation(city);
                                                    setShowLocationMenu(false);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '0.6rem 0.75rem',
                                                    border: 'none',
                                                    background: selectedLocation === city ? 'rgba(var(--primary-rgb), 0.08)' : 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem',
                                                    color: selectedLocation === city ? 'var(--primary)' : 'var(--text-main)',
                                                    cursor: 'pointer',
                                                    fontWeight: selectedLocation === city ? '700' : '500',
                                                    transition: '0.2s'
                                                }}
                                                className="location-btn"
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', flex: '0 1 400px', height: '38px', borderRadius: 'var(--radius-full)', background: 'white', border: '1px solid var(--border-color)' }}>
                            <Search size={16} color="var(--text-muted)" />
                            <input
                                type="text"
                                placeholder="Search high-end products..."
                                style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>
                )}

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {!isPortal && (
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Link to="/compare" style={{ position: 'relative' }}>
                                    <Scale size={20} color="var(--text-main)" />
                                    {compareItems.length > 0 && <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--primary)', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{compareItems.length}</span>}
                                </Link>
                                <Link to="/wishlist"><Heart size={20} color="var(--text-main)" /></Link>
                            </div>
                        )}

                        {/* Links removed */}
                    </div>

                    {/* Navbar Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {currentUser && (
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => {
                                        setShowNotifications(!showNotifications);
                                        setShowUserMenu(false);
                                    }}
                                    style={{ padding: '0.5rem', border: 'none', background: 'rgba(0,0,0,0.03)', borderRadius: '50%', cursor: 'pointer', position: 'relative' }}
                                >
                                    <Bell size={20} />
                                    {notificationList.length > 0 && <span style={{ position: 'absolute', top: '2px', right: '2px', background: 'red', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid white' }}></span>}
                                </button>
                                {showNotifications && (
                                    <div className="glass-card animate-scale" style={{ position: 'absolute', top: '130%', right: 0, width: '280px', padding: '1rem', zIndex: 1100 }}>
                                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Update Feed</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {notificationList.length === 0 ? <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Everything captured!</p> : notificationList.map(n => (
                                                <div key={n.id} onClick={() => { navigate(n.link); setShowNotifications(false); }} style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(var(--primary-rgb), 0.05)', cursor: 'pointer' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{n.title}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.subtitle}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Profile / Login Dropdown for Desktop */}
                        <div style={{ position: 'relative' }} className="hide-mobile">
                            <button
                                style={{
                                    border: 'none',
                                    background: currentUser ? 'rgba(var(--primary-rgb), 0.1)' : 'none',
                                    padding: currentUser ? '0.4rem' : 'none',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onClick={() => {
                                    if (currentUser) {
                                        setShowUserMenu(!showUserMenu);
                                        setShowNotifications(false);
                                    } else {
                                        navigate('/login');
                                    }
                                }}
                            >
                                <User size={currentUser ? 20 : 22} color={currentUser ? "var(--primary)" : "var(--text-main)"} />
                            </button>

                            {showUserMenu && currentUser && (
                                <div className="glass-card animate-scale" style={{
                                    position: 'absolute',
                                    top: '130%',
                                    right: 0,
                                    width: '220px',
                                    padding: '1rem',
                                    zIndex: 1100,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem',
                                    boxShadow: 'var(--shadow-lg)'
                                }}>
                                    <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{userData?.name || 'User'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
                                    </div>

                                    <Link
                                        to="/profile"
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', justifyContent: 'flex-start' }}
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        {userData?.role === 'ADMIN' ? <ShieldAlert size={16} /> : (sellerData ? <ShoppingBag size={16} /> : <User size={16} />)}
                                        {userData?.role === 'ADMIN' ? 'Admin Profile' : (sellerData ? 'Seller Profile' : 'My Profile')}
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="btn"
                                        style={{
                                            background: '#fee2e2',
                                            color: '#dc2626',
                                            fontSize: '0.85rem',
                                            padding: '0.5rem 1rem',
                                            justifyContent: 'flex-start'
                                        }}
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            style={{ border: 'none', background: 'rgba(var(--primary-rgb), 0.1)', padding: '0.5rem', borderRadius: '10px', display: 'none' }}
                            className="show-mobile-flex"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <CloseIcon size={20} color="var(--primary)" /> : <Menu size={20} color="var(--primary)" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="glass-card animate-fade-in" style={{ marginTop: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {!isPortal && (
                        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'white' }}>
                            <Search size={16} color="var(--text-muted)" />
                            <input
                                type="text"
                                placeholder="Quick search..."
                                style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    )}

                    {!isPortal && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Link to="/browse" className="btn btn-outline" style={{ fontSize: '0.85rem' }} onClick={() => setMobileMenuOpen(false)}>Browse All</Link>
                            <Link to="/wishlist" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
                        </div>
                    )}

                    {/* Mobile Location Picker */}
                    {!isPortal && (
                        <div style={{ position: 'relative' }}>
                            <div
                                className="glass-panel"
                                onClick={() => setShowMobileLocation(!showMobileLocation)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'white',
                                    border: '1px solid var(--border-color)',
                                    cursor: 'pointer'
                                }}
                            >
                                <MapPin size={18} color="var(--primary)" />
                                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', flex: 1 }}>
                                    {selectedLocation}
                                </span>
                                <Navigation
                                    size={14}
                                    style={{ transform: showMobileLocation ? 'rotate(180deg)' : 'none', transition: '0.3s' }}
                                    color="var(--text-muted)"
                                />
                            </div>

                            {showMobileLocation && (
                                <div className="glass-card animate-scale" style={{
                                    marginTop: '0.5rem',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-color)',
                                    background: 'white'
                                }}>
                                    <button
                                        onClick={() => {
                                            detectLocation();
                                            setShowMobileLocation(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                            backgroundColor: 'var(--primary)',
                                            borderRadius: '12px',
                                            color: '#ffffff',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            fontSize: '0.85rem',
                                            marginBottom: '0.75rem'
                                        }}
                                    >
                                        <Navigation size={14} /> Detect Live Location
                                    </button>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        {['All India', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'].map(city => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    setLocation(city);
                                                    setShowMobileLocation(false);
                                                }}
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '0.6rem 0.75rem',
                                                    border: 'none',
                                                    background: selectedLocation === city ? 'rgba(var(--primary-rgb), 0.08)' : 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    color: selectedLocation === city ? 'var(--primary)' : 'var(--text-main)',
                                                    cursor: 'pointer',
                                                    fontWeight: selectedLocation === city ? '700' : '500'
                                                }}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentUser ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Link
                                to="/profile"
                                className="btn btn-primary"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {userData?.role === 'ADMIN' ? 'Admin Profile' : (sellerData ? 'Seller Profile' : 'My Profile')}
                            </Link>
                            <button onClick={handleLogout} className="btn" style={{ background: '#fee2e2', color: '#dc2626' }}>Logout</button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Login / Register</Link>
                    )}
                </div>
            )}

            {/* Responsive Helper Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 1024px) {
                    .hide-mobile { display: none !important; }
                    .show-mobile-flex { display: flex !important; }
                }
                .location-btn:hover {
                    background: var(--primary-light) !important;
                    color: var(--primary) !important;
                    transform: translateX(4px);
                }
                .location-picker-container:hover .glass-card {
                    border-color: var(--primary) !important;
                    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.1);
                }
            `}} />
        </nav>
    );
};

export default Navbar;

