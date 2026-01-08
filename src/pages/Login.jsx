import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/auth/AuthForm';
import AuthModal from '../components/common/AuthModal';

const Login = () => {
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

    const handleLogin = async (formData) => {
        if (formData.error) {
            setError(formData.error);
            setIsModalOpen(true);
            return;
        }
        try {
            setError('');
            setLoginLoading(true);
            await login(formData.email, formData.password);
            // Redirection will be handled by useEffect or the navigate('/') below
            // Actually, if we are at /login, we might want to go to / initially, but the useEffect will handle it too.
            navigate('/');
        } catch (err) {
            let message = 'Failed to log in. Please check your credentials.';
            if (err.code === 'auth/invalid-credential') {
                message = 'Invalid email or password. Please try again.';
            } else if (err.code === 'auth/user-not-found') {
                message = 'No account found with this email.';
            } else if (err.code === 'auth/wrong-password') {
                message = 'Incorrect password. Please try again.';
            } else if (err.code === 'auth/network-request-failed') {
                message = 'Network error. Please check your internet connection.';
            }
            setError(message);
            setIsModalOpen(true);
            console.error(err);
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
            <AuthForm type="login" onSubmit={handleLogin} error={error} loading={loginLoading} />
            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message={error}
                title="Login Error"
                type="error"
            />
        </div>
    );
};

export default Login;
