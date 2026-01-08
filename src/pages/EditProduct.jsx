import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProduct, uploadProductImage } from '../utils/productActions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Package, Upload, IndianRupee, Tag, Info, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EditProduct = () => {
    const { id } = useParams();
    const { currentUser, sellerData } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [files, setFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: 'Mobiles',
        condition: 'New',
        description: '',
        location: { city: '', state: '' },
        // Used product fields
        yearOfPurchase: '',
        usage: '',
        ownersCount: '1',
    });

    const categories = ['Mobiles', 'Cars', 'Electronics', 'Real Estate', 'Fashion', 'Bikes', 'Jobs', 'Services'];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // Security check: only the owner can edit
                    if (data.sellerId !== currentUser?.uid) {
                        setError('Unauthorized access.');
                        setLoading(false);
                        return;
                    }

                    setFormData({
                        title: data.title || '',
                        price: data.price || '',
                        category: data.category || 'Mobiles',
                        condition: data.condition || 'New',
                        description: data.description || '',
                        location: data.location || { city: '', state: '' },
                        yearOfPurchase: data.yearOfPurchase || '',
                        usage: data.usage || '',
                        ownersCount: data.ownersCount || '1',
                    });
                    setExistingImages(data.images || []);
                } else {
                    setError('Product not found.');
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                setError('Failed to load product data.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchProduct();
        }
    }, [id, currentUser]);

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

        setSubmitting(true);
        setError('');

        try {
            // 1. Upload New Images (if any)
            const newImageUrls = [];
            for (const file of files) {
                const url = await uploadProductImage(file, currentUser.uid);
                newImageUrls.push(url);
            }

            // 2. Prepare Product Data
            const productPayload = {
                ...formData,
                price: Number(formData.price),
                images: [...existingImages, ...newImageUrls],
            };

            // Remove used-only fields if new
            if (formData.condition === 'New') {
                delete productPayload.yearOfPurchase;
                delete productPayload.usage;
                delete productPayload.ownersCount;
            }

            // 3. Update in Firestore
            await updateProduct(id, productPayload);
            setSuccess(true);
            setTimeout(() => navigate(`/product/${id}`), 2000);
        } catch (err) {
            console.error(err);
            if (err.message?.includes('Cloudinary')) {
                setError('Image upload failed. Please check your Cloudinary configuration.');
            } else {
                setError('Failed to update product. Please check your connection and try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '8rem', textAlign: 'center' }}>Loading listing data...</div>;

    if (success) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
                <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: 'clamp(1.5rem, 5vw, 3rem)' }}>
                    <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ marginBottom: '1rem' }}>Listing Updated!</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Your changes have been saved. Redirecting to product page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '3rem 1rem' }}>
            <Link to={`/product/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem', fontWeight: '600' }}>
                <ArrowLeft size={18} /> Back to Product
            </Link>

            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(1.5rem, 5vw, 3rem)' }}>
                <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                    <Package size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '800' }}>Edit Your Product</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Update your listing details to keep buyers informed</p>
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
                                <input type="text" name="title" className="input-field" placeholder="Product Title" value={formData.title} onChange={handleChange} required />
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
                                <h4 className="input-label">Product Images</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    {existingImages.map((img, idx) => (
                                        <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                            <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                                            <button
                                                type="button"
                                                onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                                                style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'pointer' }}
                                            >x</button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{
                                    border: '2px dashed var(--border-color)',
                                    padding: '1.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center',
                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                    cursor: 'pointer'
                                }} onClick={() => document.getElementById('file-upload').click()}>
                                    <Upload size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {files.length > 0 ? `${files.length} new images` : 'Add more images'}
                                    </p>
                                    <input id="file-upload" type="file" multiple hidden accept="image/*" onChange={handleFileChange} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                                <div className="input-group">
                                    <input type="text" name="location.city" className="input-field" placeholder="City" value={formData.location.city} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <input type="text" name="location.state" className="input-field" placeholder="State" value={formData.location.state} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: '1rem' }}>
                        <textarea name="description" className="input-field" rows="4" placeholder="Detailed Description" value={formData.description} onChange={handleChange} required></textarea>
                    </div>

                    {/* Conditional Used Fields */}
                    {formData.condition === 'Used' && (
                        <div className="glass-card" style={{ padding: '1.5rem', marginTop: '2rem', border: '1px solid var(--primary-light)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <Info size={18} color="var(--primary)" /> Used Product Specifications
                            </h3>
                            <div className="grid grid-cols-1 grid-cols-2 grid-cols-3" style={{ gap: '1rem' }}>
                                <div className="input-group">
                                    <input type="number" name="yearOfPurchase" className="input-field" placeholder="Year of Purchase" value={formData.yearOfPurchase} onChange={handleChange} required />
                                </div>

                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="usage"
                                        className="input-field"
                                        placeholder={(formData.category === 'Cars' || formData.category === 'Bikes') ? 'Kilometers Driven' : 'Months Used'}
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
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }} disabled={submitting}>
                            {submitting ? 'Updating Listing...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;
