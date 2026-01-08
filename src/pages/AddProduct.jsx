import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createProduct, uploadProductImage } from '../utils/productActions';
import { Package, Upload, IndianRupee, Tag, Info, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

const AddProduct = () => {
    const { currentUser, sellerData, userData } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const isAdminListing = (userData?.role === 'ADMIN') || searchParams.get('adminListing') === 'true' || location.pathname.startsWith('/admin');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: 'Cars',
        condition: 'New',
        description: '',
        location: { city: '', state: '' },
        // Used product fields
        yearOfPurchase: '',
        usage: '',
        ownersCount: '1',
    });

    const categories = ['Cars', 'Mobiles', 'Bikes', 'Agriproducts', 'Home Appliances', 'Others'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return setError('Please login first');

        setLoading(true);
        setError('');

        try {
            // 1. Upload Images
            const imageUrls = [];
            for (const file of files) {
                const url = await uploadProductImage(file, currentUser.uid);
                imageUrls.push(url);
            }

            // 2. Prepare Product Data
            const productPayload = {
                ...formData,
                price: Number(formData.price),
                sellerId: currentUser.uid,
                sellerName: isAdminListing ? 'Admin product(highly verified)' : (sellerData?.name || currentUser.displayName || 'Seller'),
                images: imageUrls,
                updatedAt: new Date(),
                status: isAdminListing ? 'APPROVED' : 'PENDING',
                isAdminProduct: isAdminListing,
                sellerStatus: isAdminListing ? 'VERIFIED' : 'PENDING',
                isFeatured: isAdminListing ? true : false,
            };

            // Remove used-only fields if new
            if (formData.condition === 'New') {
                delete productPayload.yearOfPurchase;
                delete productPayload.usage;
                delete productPayload.ownersCount;
            }

            // 3. Save to Firestore
            await createProduct(productPayload);
            setSuccess(true);
            setTimeout(() => navigate(isAdminListing ? '/admin' : '/seller/dashboard'), 2000);
        } catch (err) {
            console.error(err);
            if (err.message?.includes('Cloudinary')) {
                setError('Image upload failed. Please check your Cloudinary configuration (.env file).');
            } else {
                setError('Failed to list product. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
                <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: 'clamp(1.5rem, 5vw, 3rem)' }}>
                    <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ marginBottom: '1rem' }}>{isAdminListing ? 'Listing Live!' : 'Listing Submitted!'}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isAdminListing
                            ? 'Your administrative listing is now visible to all users.'
                            : 'Your product has been sent for admin approval. You will be redirected to your dashboard.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '3rem 1rem' }}>
            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(1.5rem, 5vw, 3rem)' }}>
                <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                    {isAdminListing ? (
                        <ShieldAlert size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    ) : (
                        <Package size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    )}
                    <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
                        {isAdminListing ? 'List Admin Verified Product' : 'List a New Product'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isAdminListing
                            ? 'Adding a highly verified item directly to the platform'
                            : 'Fill in the details to reach thousands of potential buyers'}
                    </p>
                </header>

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 grid-cols-2" style={{ gap: '2rem' }}>
                        {/* Left Column */}
                        <div>
                            <div className="input-group">
                                <input type="text" name="title" className="input-field" placeholder="Product Title (e.g. iPhone 15 Pro Max 256GB)" value={formData.title} onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <div style={{ position: 'relative' }}>
                                    <Tag size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <select name="category" className="input-field" style={{ paddingLeft: '2.75rem' }} value={formData.category} onChange={handleChange}>
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="input-group">
                                <div style={{ position: 'relative' }}>
                                    <IndianRupee size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="number" name="price" className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="Price (₹)" value={formData.price} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="input-group">
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        className={`btn ${formData.condition === 'New' ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ flex: 1 }}
                                        onClick={() => setFormData({ ...formData, condition: 'New' })}
                                    >Brand New</button>
                                    <button
                                        type="button"
                                        className={`btn ${formData.condition === 'Used' ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ flex: 1 }}
                                        onClick={() => setFormData({ ...formData, condition: 'Used' })}
                                    >Pre-Owned</button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            <div className="input-group">
                                <h4 className="input-label">Upload Images</h4>
                                <div style={{
                                    border: '2px dashed var(--border-color)',
                                    padding: '2rem',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center',
                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                    cursor: 'pointer'
                                }} onClick={() => document.getElementById('file-upload').click()}>
                                    <Upload size={32} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        {files.length > 0 ? `${files.length} images selected` : 'Click to select images (Max 5)'}
                                    </p>
                                    <input id="file-upload" type="file" multiple hidden accept="image/*" onChange={handleFileChange} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                                <div className="input-group">
                                    <input type="text" name="location.city" className="input-field" placeholder="City (e.g. Mumbai)" value={formData.location.city} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <input type="text" name="location.state" className="input-field" placeholder="State (e.g. Maharashtra)" value={formData.location.state} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: '1rem' }}>
                        <textarea name="description" className="input-field" rows="4" placeholder="Detailed Description (Mention features, warranty details, and condition...)" value={formData.description} onChange={handleChange} required></textarea>
                    </div>

                    {/* Conditional Used Fields */}
                    {formData.condition === 'Used' && (
                        <div className="glass-card" style={{ padding: '1.5rem', marginTop: '2rem', border: '1px solid var(--primary-light)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <Info size={18} color="var(--primary)" /> Used Product Specifications
                            </h3>
                            <div className="grid grid-cols-1 grid-cols-2 grid-cols-3" style={{ gap: '1rem' }}>
                                <div className="input-group">
                                    <input type="number" name="yearOfPurchase" className="input-field" placeholder="Year of Purchase (e.g. 2021)" value={formData.yearOfPurchase} onChange={handleChange} required />
                                </div>

                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="usage"
                                        className="input-field"
                                        placeholder={(formData.category === 'Cars' || formData.category === 'Bikes') ? 'Usage (e.g. 15,000 km)' : 'Usage (e.g. 18 months)'}
                                        value={formData.usage}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <select name="ownersCount" className="input-field" value={formData.ownersCount} onChange={handleChange}>
                                        <option value="" disabled>Number of Owners</option>
                                        <option value="1">1st Owner</option>
                                        <option value="2">2nd Owner</option>
                                        <option value="3">3rd Owner</option>
                                        <option value="4+">4th+ Owner</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '3rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }} disabled={loading}>
                            {loading ? 'Processing Listing...' : (isAdminListing ? 'Publish Admin Listing' : 'Submit Listing for Approval')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
