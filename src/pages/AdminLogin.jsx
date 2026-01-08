import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import AuthModal from '../components/common/AuthModal';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { login, currentUser, userData, sellerData, loading: authLoading, dataLoading: authDataLoading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!authLoading && !authDataLoading && currentUser) {
            if (userData?.role === 'ADMIN') {
                navigate('/admin');
            } else if (sellerData) {
                navigate('/seller/dashboard');
            } else if (userData?.role === 'USER') {
                navigate('/');
            }
        }
    }, [currentUser, userData, sellerData, authLoading, authDataLoading, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoginLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/admin');
        } catch (err) {
            let message = 'Invalid admin credentials.';
            if (err.code === 'auth/invalid-credential') {
                message = 'Incorrect administrator email or password.';
            } else if (err.code === 'auth/network-request-failed') {
                message = 'Network error. Please check your connection.';
            }
            setError(message);
            setIsModalOpen(true);
            console.error(err);
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-card animate-fade-in" style={{ maxWidth: '450px', width: '100%', padding: '3rem', border: '2px solid var(--primary-light)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ backgroundColor: 'var(--primary-light)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <ShieldAlert size={32} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--bg-dark)', marginBottom: '0.5rem' }}>Admin Console</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Authorized Personnel Only</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="input-group">
                        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                name="email"
                                className="input-field"
                                style={{ paddingLeft: '2.75rem' }}
                                placeholder="Administrator Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '2rem' }}>
                        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                name="password"
                                className="input-field"
                                style={{ paddingLeft: '2.75rem' }}
                                placeholder="Secure Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loginLoading}>
                        {loginLoading ? 'Authenticating...' : 'Access Terminal'}
                        {!loginLoading && <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>Return to Public Site</Link>
                </div>
            </div>

            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message={error}
                title="Admin Access Refused"
                type="error"
            />
        </div>
    );
};

export default AdminLogin;
