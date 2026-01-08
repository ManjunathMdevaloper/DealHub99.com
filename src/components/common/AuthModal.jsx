import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, X, ShieldAlert } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, message, title, type = 'info' }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const config = {
        info: {
            icon: <ShieldAlert size={32} />,
            color: 'var(--primary)',
            bgColor: 'rgba(var(--primary-rgb), 0.1)',
            btnText: 'Login Now',
            btnAction: () => { navigate('/login'); onClose(); }
        },
        error: {
            icon: <X size={32} />,
            color: 'var(--error)',
            bgColor: '#fef2f2',
            btnText: 'Try Again',
            btnAction: onClose
        },
        success: {
            icon: <ShieldAlert size={32} />, // Could use Check but ShieldAlert is fine for consistency
            color: 'var(--success)',
            bgColor: '#f0fdf4',
            btnText: 'Continue',
            btnAction: onClose
        }
    }[type] || config.info;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    transition: '0.3s'
                }}
            ></div>

            {/* Modal Content */}
            <div className="glass-card animate-fade-in" style={{
                position: 'relative',
                width: '100%',
                maxWidth: '450px',
                padding: '2.5rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 1) 100%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 40px rgba(37, 99, 235, 0.05)',
                border: '1px solid white',
                borderRadius: 'var(--radius-lg)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.25rem',
                        right: '1.25rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '0.5rem',
                        transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--error)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: config.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: config.color,
                        border: '4px solid #fff'
                    }}>
                        {config.icon}
                    </div>

                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '900',
                        marginBottom: '0.75rem',
                        color: 'var(--bg-dark)'
                    }}>
                        {title || (type === 'error' ? 'Something went wrong' : 'Authentication Required')}
                    </h2>

                    <p style={{
                        color: 'var(--text-muted)',
                        marginBottom: '2rem',
                        lineHeight: '1.6',
                        fontSize: '1rem'
                    }}>
                        {message}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {type !== 'success' && (
                            <button
                                onClick={onClose}
                                className="btn btn-outline"
                                style={{ flex: 1, padding: '0.875rem' }}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={config.btnAction}
                            className="btn btn-primary"
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                gap: '0.75rem',
                                boxShadow: `0 4px 12px ${config.color}33`,
                                backgroundColor: config.color
                            }}
                        >
                            {type === 'info' && <LogIn size={20} />}
                            {config.btnText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
