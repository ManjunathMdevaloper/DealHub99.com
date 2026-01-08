import React, { useState, useEffect } from 'react';
import { getTrendingNews } from '../utils/queries';
import { Newspaper, Bell, Rocket, Tag, Clock } from 'lucide-react';

const ProductNews = () => {
    const [news, setNews] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'Mobiles', 'Cars', 'Electronics', 'Electric Vehicles', 'Technology'];

    // Mock news data for initial effect
    const mockNews = [
        { id: '1', title: 'iPhone 16 Pro Leaks: Under-Display Face ID Confirmed?', category: 'Mobiles', status: 'TRENDING', createdAt: { toDate: () => new Date() }, content: 'Internal sources suggest Apple is testing new sensor layouts for the upcoming flagship...' },
        { id: '2', title: 'Tata Curvv EV Range Revealed: Over 500km on single charge', category: 'Electric Vehicles', status: 'NEW LAUNCH', createdAt: { toDate: () => new Date() }, content: 'Tata Motors continues its EV dominance with the newly unveiled mid-size SUV coupe...' },
        { id: '3', title: 'NVIDIA RTX 50-Series: Everything we know so far', category: 'Electronics', status: 'UPCOMING', createdAt: { toDate: () => new Date() }, content: 'Blackwell architecture promises massive jumps in ray-tracing performance...' },
        { id: '4', title: 'The Rise of AI in Everyday Gadgets: A 2024 Retrospective', category: 'Technology', status: 'INSIGHT', createdAt: { toDate: () => new Date() }, content: 'How generative AI is moving from cloud servers to local on-device processing...' }
    ];

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const data = await getTrendingNews(10);
                setNews(data.length > 0 ? data : mockNews);
            } catch (err) {
                setNews(mockNews);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const filteredNews = filter === 'All' ? news : news.filter(n => n.category === filter);

    const StatusBadge = ({ status }) => {
        const colors = {
            'TRENDING': '#ef4444',
            'NEW LAUNCH': '#10b981',
            'UPCOMING': '#2563eb',
            'INSIGHT': '#f59e0b'
        };
        return (
            <span style={{
                backgroundColor: colors[status] || 'var(--primary)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: '900',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                {status}
            </span>
        );
    };

    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <Newspaper size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Product News & Insights</h1>
                <p style={{ color: 'var(--text-muted)' }}>Stay updated with the latest launches and technological trends</p>
            </header>

            {/* Featured Hero Carousel */}
            <div id="newsCarousel" className="carousel slide glass-card mb-5" data-bs-ride="carousel" style={{ overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
                <div className="carousel-inner">
                    <div className="carousel-item active" style={{ height: '400px' }}>
                        <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200" className="d-block w-100" alt="Tech News" style={{ height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                        <div className="carousel-caption d-none d-md-block" style={{ textAlign: 'left', left: '10%', bottom: '20%', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                            <span className="btn btn-primary mb-3" style={{ fontSize: '0.7rem' }}>TRENDING</span>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '900' }}>The Future of AI Hardware</h2>
                            <p style={{ fontSize: '1.1rem' }}>How next-gen processors are changing everything.</p>
                        </div>
                    </div>
                    <div className="carousel-item" style={{ height: '400px' }}>
                        <img src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200" className="d-block w-100" alt="EV News" style={{ height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                        <div className="carousel-caption d-none d-md-block" style={{ textAlign: 'left', left: '10%', bottom: '20%', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                            <span className="btn btn-primary mb-3" style={{ fontSize: '0.7rem', backgroundColor: '#10b981', border: 'none' }}>NEW LAUNCH</span>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Sustainable Mobility 2024</h2>
                            <p style={{ fontSize: '1.1rem' }}>Tesla and competitors race for the affordable range.</p>
                        </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#newsCarousel" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#newsCarousel" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`btn ${filter === cat ? 'btn-primary' : 'btn-outline'}`}
                        style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>Fetching latest updates...</div>
            ) : (
                <div className="grid grid-cols-1 grid-cols-2" style={{ gap: '2rem' }}>
                    {filteredNews.map((item, idx) => (
                        <div key={item.id} className="glass-card animate-fade-in" style={{ padding: '2rem', animationDelay: `${idx * 0.1}s` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <StatusBadge status={item.status} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    <Clock size={14} />
                                    {item.createdAt?.toDate().toLocaleDateString()}
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
                                {item.title}
                            </h3>

                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '2rem' }}>
                                {item.content}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>
                                    <Tag size={16} /> {item.category}
                                </div>
                                <button className="btn btn-outline" style={{ border: 'none', marginLeft: 'auto', padding: '0.5rem' }}>Read Full Story</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Newsletter CTA */}
            <section className="glass-card" style={{ marginTop: '5rem', padding: '4rem', textAlign: 'center', background: 'var(--primary)', color: 'white' }}>
                <Bell size={40} style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Never Miss an Update</h2>
                <p style={{ opacity: 0.9, marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                    Join 50,000+ dealhub99.com enthusiasts. Get the latest tech news delivered straight to your inbox every week.
                </p>
                <div style={{ display: 'flex', maxWidth: '500px', margin: '0 auto', gap: '1rem' }}>
                    <input type="email" className="input-field" placeholder="your@email.com" style={{ flex: 1, color: 'var(--text-main)' }} />
                    <button className="btn btn-primary" style={{ backgroundColor: 'var(--bg-dark)', border: 'none' }}>Subscribe</button>
                </div>
            </section>
        </div>
    );
};

export default ProductNews;
