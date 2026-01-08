import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SellerAuthForm from '../components/auth/SellerAuthForm';
import AuthModal from '../components/common/AuthModal';

const SellerLogin = () => {
    const [error, setError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { login, currentUser, userData, sellerData, loading: authLoading, dataLoading: authDataLoading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/seller/dashboard';

    React.useEffect(() => {
        if (!authLoading && !authDataLoading && currentUser) {
            if (sellerData) {
                navigate(redirect);
            } else if (userData?.role === 'ADMIN') {
                navigate('/admin');
            } else if (userData?.role === 'USER') {
                navigate('/');
            }
        }
    }, [currentUser, sellerData, userData, authLoading, authDataLoading, navigate, redirect]);

    const handleLogin = async (formData) => {
        try {
            setError('');
            setLoginLoading(true);
            await login(formData.email, formData.password);
            // After login, the AuthContext will update sellerData
            navigate(redirect);
        } catch (err) {
            let message = 'Failed to log in as seller. Please check your credentials.';
            if (err.code === 'auth/invalid-credential') {
                message = 'Invalid seller email or password. Please try again.';
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
        <div className="container" style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '80vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <SellerAuthForm type="login" onSubmit={handleLogin} error={error} loading={loginLoading} />
            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message={error}
                title="Seller Login Error"
                type="error"
            />

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    New seller? <Link to="/seller/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Register here</Link>
                </p>
                <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginTop: '0.5rem' }}>
                    Forgot Password?
                </Link>
            </div>
        </div>
    );
};

export default SellerLogin;
