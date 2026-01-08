import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';

const AuthForm = ({ type, onSubmit, error, loading }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        phone: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (type === 'register' && formData.password.length < 6) {
            // We pass the error back to the parent to show it in the modal
            onSubmit({ error: "Password must be at least 6 characters long." });
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="glass-card animate-fade-in" style={{
            maxWidth: '450px',
            margin: '2rem auto',
            padding: '2.5rem',
            width: '100%'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    {type === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    {type === 'login' ? 'Enter your details to access your account' : 'Join dealhub99.com today'}
                </p>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    color: 'var(--error)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    border: '1px solid #fee2e2'
                }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {type === 'register' && (
                    <div className="input-group">
                        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                name="displayName"
                                className="input-field"
                                placeholder="Full Name (e.g. John Doe)"
                                style={{ paddingLeft: '2.75rem' }}
                                autoComplete="name"
                                value={formData.displayName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                )}

                <div className="input-group">
                    <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="email"
                            name="email"
                            className="input-field"
                            placeholder="Email Address"
                            style={{ paddingLeft: '2.75rem' }}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {type === 'register' && (
                    <div className="input-group">
                        <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="tel"
                                name="phone"
                                className="input-field"
                                placeholder="Phone Number (+91 ...)"
                                style={{ paddingLeft: '2.75rem' }}
                                autoComplete="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                )}

                <div className="input-group">
                    <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="password"
                            name="password"
                            className="input-field"
                            placeholder="Password"
                            style={{ paddingLeft: '2.75rem' }}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {type === 'login' && (
                    <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none' }}>
                            Forgot Password?
                        </Link>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (type === 'login' ? 'Login' : 'Create Account')}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {type === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <Link
                        to={type === 'login' ? '/register' : '/login'}
                        style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}
                    >
                        {type === 'login' ? 'Register' : 'Login'}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;
