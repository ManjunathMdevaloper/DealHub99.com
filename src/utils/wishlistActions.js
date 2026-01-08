import { doc, setDoc, deleteDoc, getDocs, collection, query, where, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export const addToWishlist = async (userId, product) => {
    const wishRef = doc(db, "users", userId, "wishlist", product.id);
    await setDoc(wishRef, {
        ...product,
        addedAt: new Date()
    });
};

export const removeFromWishlist = async (userId, productId) => {
    const wishRef = doc(db, "users", userId, "wishlist", productId);
    await deleteDoc(wishRef);
};

export const getWishlist = async (userId) => {
    const wishRef = collection(db, "users", userId, "wishlist");
    const snapshot = await getDocs(wishRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const isInWishlist = async (userId, productId) => {
    const wishRef = doc(db, "users", userId, "wishlist", productId);
    const snapshot = await getDoc(wishRef);
    return snapshot.exists();
};
