import { collection, query, where, orderBy, limit, getDocs, startAfter } from "firebase/firestore";
import { db } from "../firebase/config";

export const getFeaturedProducts = async (count = 8) => {
    const q = query(
        collection(db, "products"),
        where("status", "==", "APPROVED"),
        where("isFeatured", "==", true),
        limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.isAdminProduct || p.sellerStatus !== 'BLOCKED');
};

export const getProductsByCategory = async (category, count = 10) => {
    const q = query(
        collection(db, "products"),
        where("category", "==", category),
        where("status", "==", "APPROVED"),
        limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.isAdminProduct || p.sellerStatus !== 'BLOCKED');
};

export const getTrendingNews = async (count = 3) => {
    const q = query(
        collection(db, "product_news"),
        orderBy("createdAt", "desc"),
        limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
