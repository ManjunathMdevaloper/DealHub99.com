import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SellerAuthForm from '../components/auth/SellerAuthForm';
import AuthModal from '../components/common/AuthModal';

const SellerRegister = () => {
    const [error, setError] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { signupSeller, currentUser, userData, sellerData, loading: authLoading, dataLoading: authDataLoading } = useAuth();
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

    const handleRegister = async (formData) => {
        try {
            setError('');
            setRegisterLoading(true);
            await signupSeller(formData.email, formData.password, formData);
            navigate('/seller/login');
        } catch (err) {
            let message = 'Failed to register as seller.';
            if (err.code === 'auth/email-already-in-use') {
                message = 'This email is already registered as a seller.';
            } else if (err.code === 'auth/network-request-failed') {
                message = 'Network error or firewall blocked the request. Please try again.';
            } else if (err.message) {
                message += ' ' + err.message;
            }
            setError(message);
            setIsModalOpen(true);
            console.error(err);
        } finally {
            setRegisterLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
            <SellerAuthForm type="register" onSubmit={handleRegister} error={error} loading={registerLoading} />
            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message={error}
                title="Registration Error"
                type="error"
            />
        </div>
    );
};

export default SellerRegister;
