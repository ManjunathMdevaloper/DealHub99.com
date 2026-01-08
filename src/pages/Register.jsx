import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/auth/AuthForm';
import AuthModal from '../components/common/AuthModal';

const Register = () => {
    const [error, setError] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { signup, currentUser, userData, sellerData, loading: authLoading, dataLoading: authDataLoading } = useAuth();
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
            await signup(formData.email, formData.password, formData);
            navigate('/login?verify=true');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already in use.');
            } else {
                setError('Failed to create an account.');
            }
            console.error(err);
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleSubmit = async (formData) => {
        if (formData.error) {
            setError(formData.error);
            setIsModalOpen(true);
            return;
        }
        await handleRegister(formData);
    };

    return (
        <div className="container" style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
            <AuthForm type="register" onSubmit={handleSubmit} error={error} loading={registerLoading} />
            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message={error}
                title="Registration Issue"
                type="error"
            />
        </div>
    );
};

export default Register;
