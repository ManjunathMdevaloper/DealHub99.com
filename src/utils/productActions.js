import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    where,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { uploadImageToCloudinary } from "./cloudinaryUpload";

/* ================================
   IMAGE UPLOAD (CLOUDINARY)
================================ */
export const uploadProductImage = async (file) => {
    try {
        return await uploadImageToCloudinary(file);
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};

/* ================================
   CREATE PRODUCT
================================ */
export const createProduct = async (productData) => {
    try {
        const docRef = await addDoc(collection(db, "products"), {
            status: "PENDING", // Default status
            ...productData,
            views: 0,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Create product error:", error);
        throw error;
    }
};

/* ================================
   UPDATE PRODUCT
================================ */
export const updateProduct = async (productId, productData) => {
    try {
        const docRef = doc(db, "products", productId);
        await updateDoc(docRef, {
            ...productData,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Update product error:", error);
        throw error;
    }
};

/* ================================
   GET SELLER PRODUCTS
================================ */
export const getSellerProducts = async (sellerId) => {
    const q = query(
        collection(db, "products"),
        where("sellerId", "==", sellerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
};

/* ================================
   UPDATE PRODUCT STATUS (ADMIN)
================================ */
export const updateProductStatus = async (productId, status) => {
    const docRef = doc(db, "products", productId);
    await updateDoc(docRef, { status });
};
