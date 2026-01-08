import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, sellerOnly = false }) => {
    const { currentUser, userData, sellerData, loading, dataLoading } = useAuth();

    if (loading || dataLoading) return null;

    if (!currentUser) {
        return <Navigate to="/login" />
    }

    if (adminOnly && userData?.role !== 'ADMIN') {
        return <Navigate to="/" />;
    }

    if (sellerOnly && !sellerData) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
