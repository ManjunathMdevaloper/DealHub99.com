import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Briefcase, FileText, ArrowRight, AlertCircle } from 'lucide-react';

const SellerAuthForm = ({ type, onSubmit, error, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        gstNumber: '',
        aadharNumber: '',
        sellerType: 'Individual',
        hasGst: true
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="glass-card animate-fade-in" style={{
            maxWidth: '500px',
            margin: '2rem auto',
            padding: '2.5rem',
            width: '100%'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    border: '2px solid var(--primary)'
                }}>
                    <Briefcase size={30} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Seller {type === 'login' ? 'Partner Login' : 'Registration'}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    {type === 'login' ? 'Manage your products and leads' : 'Join our network of verified sellers'}
                </p>
            </div>

            {error && (
                <div style={{ color: 'var(--error)', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid #fee2e2', fontSize: '0.875rem' }}>
                    <AlertCircle size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {type === 'register' && (
                    <>
                        <div className="input-group">
                            <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="text" name="name" className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="Business / Individual Name" value={formData.name} onChange={handleChange} required autoComplete="organization" />
                            </div>
                        </div>

                        <div className="input-group">
                            <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                                <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="tel" name="mobile" className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="Mobile Number (e.g. +91 98765 43210)" value={formData.mobile} onChange={handleChange} required autoComplete="tel" />
                            </div>
                        </div>

                        <div className="input-group">
                            <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                                <Briefcase size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <select name="sellerType" className="input-field" style={{ paddingLeft: '2.75rem' }} value={formData.sellerType} onChange={handleChange}>
                                    <option value="" disabled>Select Seller Type</option>
                                    <option value="Individual">Individual</option>
                                    <option value="Dealer">Dealer</option>
                                    <option value="Business">Business</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, hasGst: !prev.hasGst, gstNumber: '', aadharNumber: '' }))}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary)',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        padding: '0'
                                    }}
                                >
                                    {formData.hasGst ? "I don't have GST" : "I have GST"}
                                </button>
                            </div>
                            <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                                <FileText size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                {formData.hasGst ? (
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        className="input-field"
                                        style={{ paddingLeft: '2.75rem' }}
                                        placeholder="Enter GSTIN"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        name="aadharNumber"
                                        className="input-field"
                                        style={{ paddingLeft: '2.75rem' }}
                                        placeholder="12 Digit Aadhar Number"
                                        value={formData.aadharNumber}
                                        onChange={handleChange}
                                        required
                                        pattern="[0-9]{12}"
                                        title="Aadhar number must be 12 digits"
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}

                <div className="input-group">
                    <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="email" name="email" className="input-field" placeholder="Email Address" style={{ paddingLeft: '2.75rem' }} value={formData.email} onChange={handleChange} required autoComplete="email" />
                    </div>
                </div>

                <div className="input-group">
                    <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="password" name="password" className="input-field" placeholder="Password" style={{ paddingLeft: '2.75rem' }} value={formData.password} onChange={handleChange} required autoComplete={type === 'login' ? "current-password" : "new-password"} />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Submitting...' : (type === 'login' ? 'Seller Login' : 'Register as Seller')}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            <div id="recaptcha-container"></div>
        </div>
    );
};

export default SellerAuthForm;
