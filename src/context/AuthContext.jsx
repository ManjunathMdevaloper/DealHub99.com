import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    setPersistence,
    browserSessionPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [sellerData, setSellerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);

    // Signup Logic
    async function signup(email, password, additionalData) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name: additionalData.displayName,
            email: email,
            phone: additionalData.phone,
            role: 'USER',
            createdAt: serverTimestamp(),
        });

        await sendEmailVerification(user);
        return user;
    }

    // Seller Signup Logic
    async function signupSeller(email, password, additionalData) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'sellers', user.uid), {
            name: additionalData.name,
            email: email,
            mobile: additionalData.mobile,
            gstNumber: additionalData.gstNumber || '',
            aadharNumber: additionalData.aadharNumber || '',
            sellerType: additionalData.sellerType, // Individual / Dealer / Business
            status: 'PENDING',
            role: 'SELLER',
            createdAt: serverTimestamp(),
        });

        await sendEmailVerification(user);
        return user;
    }

    // Recaptcha for Phone Auth
    function setupRecaptcha(containerId) {
        const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
            'size': 'invisible',
        });
        return recaptchaVerifier;
    }

    // Phone Auth
    function loginWithPhone(phoneNumber, recaptchaVerifier) {
        return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    }

    // Login Logic
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Logout Logic
    function logout() {
        return signOut(auth);
    }

    // Reset Password
    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        // Set persistence to SESSION (current tab only)
        setPersistence(auth, browserSessionPersistence)
            .catch((error) => console.error("Persistence error:", error));

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    setCurrentUser(user);
                    setDataLoading(true);
                    // Try fetching search from users first
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                        setSellerData(null);
                    } else {
                        // Check if it's a seller
                        const sellerDoc = await getDoc(doc(db, 'sellers', user.uid));
                        if (sellerDoc.exists()) {
                            setSellerData(sellerDoc.data());
                            setUserData(null);
                        }
                    }
                } else {
                    setCurrentUser(null);
                    setUserData(null);
                    setSellerData(null);
                }
            } catch (err) {
                console.error("Auth state change error:", err);
            } finally {
                setDataLoading(false);
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        sellerData,
        loading,
        dataLoading,
        signup,
        signupSeller,
        login,
        loginWithPhone,
        setupRecaptcha,
        logout,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
