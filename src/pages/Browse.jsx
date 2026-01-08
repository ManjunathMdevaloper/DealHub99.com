import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLocation } from '../context/LocationContext';
import ProductCard from '../components/product/ProductCard';
import { Filter, Search, X } from 'lucide-react';

const Browse = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { selectedLocation } = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    const categoryFilter = searchParams.get('category') || 'All';
    const categories = ['All', 'Cars', 'Mobiles', 'Bikes', 'Agriproducts', 'Home Appliances', 'Others'];

    useEffect(() => {
        const querySearch = searchParams.get('search') || '';
        if (querySearch !== searchTerm) {
            setSearchTerm(querySearch);
        }
    }, [searchParams]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Simplified query to avoid index requirements
            const q = query(collection(db, "products"), where("status", "==", "APPROVED"));

            const snapshot = await getDocs(q);
            let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Filter out products from blocked sellers, but always keep Admin products
            data = data.filter(p => p.isAdminProduct || p.sellerStatus !== 'BLOCKED');

            // Client-side category filtering to further avoid index needs
            if (categoryFilter !== 'All') {
                data = data.filter(p => p.category === categoryFilter);
            }

            // Client-side sorting
            data = data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

            // Client-side filtering for Location and Search Term (Firestore handles complex equality/inequality better with indexes, but for simplicity we do it here)
            if (selectedLocation !== 'All India') {
                data = data.filter(p => p.location?.city === selectedLocation);
            }

            if (searchTerm) {
                data = data.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
            }

            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [categoryFilter, selectedLocation, searchTerm]);

    const handleCategoryChange = (cat) => {
        if (cat === 'All') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', cat);
        }
        setSearchParams(searchParams);
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div className="grid grid-cols-1 grid-cols-4" style={{ gap: '2rem', alignItems: 'start' }}>
                {/* Sidebar Filters - 1 Col on Desktop */}
                <div style={{ width: '100%', position: 'sticky', top: '5rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={20} /> Filters
                        </h3>

                        <div style={{ marginBottom: '2rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>Category</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryChange(cat)}
                                        style={{
                                            textAlign: 'left',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: 'none',
                                            backgroundColor: categoryFilter === cat ? 'var(--primary-light)' : 'transparent',
                                            color: categoryFilter === cat ? 'var(--primary)' : 'var(--text-main)',
                                            fontWeight: categoryFilter === cat ? '700' : '500',
                                            cursor: 'pointer',
                                            transition: 'var(--transition-fast)'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ gridColumn: 'span 3 / span 3' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem',
                        backgroundColor: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius-full)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}>
                        <Search size={20} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search by product name..."
                            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && <X size={18} style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />}
                    </div>

                    {/* Main Content Area */}
                    <div className="grid-mobile-reset">
                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                                {categoryFilter} Products
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: '500' }}>
                                    ({products.length} found)
                                </span>
                            </h2>
                        </div>

                        {loading ? (
                            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Searching marketplace...</div>
                        ) : products.length === 0 ? (
                            <div className="glass-card" style={{ padding: '5rem', textAlign: 'center' }}>
                                <Search size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                                <h3>No products found</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search terms.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 grid-cols-2 grid-cols-3" style={{ gap: '1.5rem' }}>
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Browse;
