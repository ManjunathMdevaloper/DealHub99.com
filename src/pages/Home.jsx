import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryGrid from '../components/common/CategoryGrid';
import ProductCard from '../components/product/ProductCard';
import { getFeaturedProducts, getTrendingNews } from '../utils/queries';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, TrendingUp, Newspaper, Tag } from 'lucide-react';

const Home = () => {
    const { selectedLocation } = useLocation();
    const { sellerData, currentUser } = useAuth();
    const [featured, setFeatured] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data for initial WOW effect since DB might be empty
    const mockProducts = [
        { id: '1', title: 'Mahindra Tractors 575 DI', price: 650000, condition: 'New', category: 'Agriproducts', location: { city: 'Mumbai' }, images: ['https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800'] },
        { id: '2', title: 'BMW M4 Competition 2023', price: 14500000, condition: 'Used', category: 'Cars', location: { city: 'Delhi' }, images: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800'] },
        { id: '3', title: 'Samsung Front Load Washer', price: 34900, condition: 'New', category: 'Home Appliances', location: { city: 'Bangalore' }, images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'] },
        { id: '4', title: 'Royal Enfield Classic 350', price: 215000, condition: 'Used', category: 'Bikes', location: { city: 'Hyderabad' }, images: ['https://images.unsplash.com/photo-1558981403-c5f91cbba527?w=800'] },
    ];

    useEffect(() => {
        // Attempt to fetch from Firebase, fallback to mock if empty
        const fetchData = async () => {
            try {
                const [productsData, newsData] = await Promise.all([
                    getFeaturedProducts(10),
                    getTrendingNews(3)
                ]);

                let filtered = productsData.length > 0 ? productsData : mockProducts;

                if (selectedLocation !== 'All India') {
                    filtered = filtered.filter(p => p.location?.city === selectedLocation);
                }

                setFeatured(filtered);
                setNews(newsData);
            } catch (err) {
                setFeatured(mockProducts.filter(p => selectedLocation === 'All India' || p.location?.city === selectedLocation));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedLocation]);

    return (
        <div className="container" style={{ paddingBottom: '5rem' }}>
            {/* Hero Section */}
            <section className="animate-fade-in" style={{
                padding: '6rem 0',
                textAlign: 'center',
                background: 'radial-gradient(circle at top right, rgba(var(--primary-rgb), 0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(var(--primary-rgb), 0.05), transparent 40%)',
                borderRadius: 'var(--radius-xl)',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '800', marginBottom: '2rem', animation: 'fadeIn 0.8s ease-out' }}>
                    <Sparkles size={14} />
                    <span>#1 PREMIUM LEAD MARKETPLACE IN INDIA</span>
                </div>
                <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: '950', color: 'var(--bg-dark)', letterSpacing: '-3px', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                    DealHub<span className="text-gradient">99</span>.com
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
                    India's premium lead-generation marketplace for verified products and trusted sellers.
                    <span style={{ display: 'block', fontStyle: 'italic', marginTop: '1rem', fontWeight: '500' }}>No middleman. No hidden fees. Direct 1-to-1 connections.</span>
                </p>

                <div className="hero-buttons" style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
                    <Link to="/browse" className="btn btn-primary animate-float" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: 'var(--radius-full)', width: 'fit-content', minWidth: '220px' }}>
                        Start Exploring
                    </Link>
                    {sellerData ? (
                        <Link to="/seller/dashboard" className="btn btn-outline" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: 'var(--radius-full)', width: 'fit-content', minWidth: '220px' }}>
                            Dashboard
                        </Link>
                    ) : (
                        <Link to="/seller/login" className="btn btn-outline" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: 'var(--radius-full)', width: 'fit-content', minWidth: '220px' }}>
                            Become a Seller
                        </Link>
                    )}
                </div>

                {/* Top News Carousel */}
                <div id="topNewsCarousel" className="carousel slide glass-card mx-auto" data-bs-ride="carousel" style={{ maxWidth: '900px', overflow: 'hidden', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.08), rgba(255,255,255,0.8))', border: '1px solid var(--primary-light)' }}>
                    <div className="carousel-inner">
                        {news.length > 0 ? news.map((item, idx) => (
                            <div key={item.id} className={`carousel-item ${idx === 0 ? 'active' : ''}`} style={{ padding: '2.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <span style={{ backgroundColor: item.status === 'NEW LAUNCH' ? '#10b981' : 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {item.status || 'UPDATE'}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--bg-dark)' }}>{item.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5', maxWidth: '600px', margin: '0 auto' }}>{item.content}</p>
                                    <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Tag size={14} /> {item.category}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="carousel-item active" style={{ padding: '2.5rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>Latest marketplace updates loading...</p>
                                </div>
                            </div>
                        )}
                    </div>
                    {news.length > 1 && (
                        <>
                            <button className="carousel-control-prev" type="button" data-bs-target="#topNewsCarousel" data-bs-slide="prev" style={{ width: '5%', filter: 'invert(1)' }}>
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#topNewsCarousel" data-bs-slide="next" style={{ width: '5%', filter: 'invert(1)' }}>
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            </button>
                        </>
                    )}
                </div>
            </section>

            {/* Category Section */}
            <section style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <Sparkles color="var(--accent)" />
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Browse Categories</h2>
                </div>
                <CategoryGrid />
            </section>

            {/* Featured Products */}
            <section style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <TrendingUp color="var(--primary)" />
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Featured Listings</h2>
                    </div>
                    <Link to="/browse" className="btn btn-outline" style={{ border: 'none', textDecoration: 'none' }}>View All</Link>
                </div>

                <div className="grid grid-cols-1 grid-cols-2 grid-cols-4">
                    {featured.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* News Preview */}
            <section className="glass-card" style={{ padding: '3rem', background: 'var(--bg-dark)', color: 'var(--text-white)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                    <Newspaper color="var(--primary)" />
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Marketplace News</h2>
                </div>

                <div id="homeNewsCarousel" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        <div className="carousel-item active">
                            <div className="animate-fade-in" style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '1px' }}>LATEST LAUNCH</div>
                                <h4 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.25rem', lineHeight: '1.3' }}>Tesla Model 2 expected to hit Indian markets by Q4 2026</h4>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>Read more about the upcoming electric revolution in India and how it impacts the used car market with direct comparisons.</p>
                                <Link to="/news" className="btn btn-primary" style={{ backgroundColor: 'var(--primary)', border: 'none', padding: '0.75rem 2rem' }}>Read Full Story</Link>
                            </div>
                        </div>
                        <div className="carousel-item">
                            <div className="animate-fade-in" style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '1px' }}>PRICE ALERT</div>
                                <h4 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.25rem', lineHeight: '1.3' }}>Smart Home Hubs seeing a 20% price drop this season</h4>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>Comparison of top 5 home automation hubs available now. Find the best deal for your modern home ecosystem.</p>
                                <Link to="/news" className="btn btn-primary" style={{ backgroundColor: 'var(--primary)', border: 'none', padding: '0.75rem 2rem' }}>View Deals</Link>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <button className="carousel-control-prev" type="button" data-bs-target="#homeNewsCarousel" data-bs-slide="prev" style={{ width: '5%' }}>
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#homeNewsCarousel" data-bs-slide="next" style={{ width: '5%' }}>
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>

                    {/* Indicators */}
                    <div className="carousel-indicators" style={{ marginBottom: '-1rem' }}>
                        <button type="button" data-bs-target="#homeNewsCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                        <button type="button" data-bs-target="#homeNewsCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
