import { collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

const CATEGORIES = ['Cars', 'Mobiles', 'Bikes', 'Agriproducts', 'Home Appliances', 'Others'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'];

const IMAGE_POOLS = {
    Mobiles: [
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
        "https://images.unsplash.com/photo-1573148195900-7845dcb9c127?w=800",
        "https://images.unsplash.com/photo-1556656793-062ff987b50d?w=800"
    ],
    Cars: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
        "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800"
    ],
    Bikes: [
        "https://images.unsplash.com/photo-1558981403-c5f91cbba527?w=800",
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800",
        "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800",
        "https://images.unsplash.com/photo-1558981420-c532902e58b4?w=800",
        "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=800"
    ],
    Agriproducts: [
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800",
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800",
        "https://images.unsplash.com/photo-1581578731548-c64695cc6958?w=800"
    ],
    HomeAppliances: [
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"
    ],
    Others: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        "https://images.unsplash.com/photo-1526733158135-1677d3f6795a?w=800",
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800"
    ]
};

const generateProducts = () => {
    const products = [];
    CATEGORIES.forEach(cat => {
        for (let i = 1; i <= 10; i++) {
            const city = CITIES[Math.floor(Math.random() * CITIES.length)];
            const condition = Math.random() > 0.5 ? 'New' : 'Used';
            const poolKey = cat.replace(/\s+/g, '');
            const pool = IMAGE_POOLS[poolKey] || IMAGE_POOLS['Others'];
            const images = [...pool].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 3);

            products.push({
                title: `${cat} Model ${i} - Premium Edition`,
                price: Math.floor(Math.random() * 100000) + 5000,
                category: cat,
                condition: condition,
                description: `This is a high-quality ${cat} item located in ${city}. It comes with all original accessories and 6 months of extended support. Ideal for students and professionals looking for value.`,
                location: { city: city, state: city === 'Mumbai' ? 'Maharashtra' : 'State' },
                sellerId: `dummy-seller-${Math.floor(Math.random() * 2) + 1}`,
                sellerName: i % 2 === 0 ? "TechHub Solutions" : "Elite Marketplace",
                images: images,
                status: "APPROVED",
                views: Math.floor(Math.random() * 1000),
                isFeatured: i <= 2,
                // Used fields
                ...(condition === 'Used' && {
                    yearOfPurchase: 2020 + Math.floor(Math.random() * 4),
                    usage: i % 2 === 0 ? "Very Lightly Used" : "Standard Usage",
                    ownersCount: "1"
                })
            });
        }
    });
    return products;
};

export const seedDatabase = async () => {
    console.log("Bulk Seeding started...");

    const products = generateProducts();

    // 1. Seed Sellers
    const sellers = [
        { id: "dummy-seller-1", name: "TechHub Solutions", email: "contact@techhub.com", mobile: "9876543210", sellerType: "Business", status: "VERIFIED", role: "SELLER" },
        { id: "dummy-seller-2", name: "Elite Marketplace", email: "info@elitemarket.in", mobile: "9999988888", sellerType: "Dealer", status: "VERIFIED", role: "SELLER" }
    ];

    for (const seller of sellers) {
        const { id, ...data } = seller;
        await setDoc(doc(db, "sellers", id), { ...data, createdAt: serverTimestamp() });
    }

    // 2. Seed Products
    for (const product of products) {
        await addDoc(collection(db, "products"), { ...product, createdAt: serverTimestamp() });
    }

    // 3. Seed News
    const news = [
        { title: "Marketplace hits 1 Million Active Users", category: "Technology", status: "TRENDING", content: "Our discovery platform has reached a significant milestone in India's digital economy.", createdAt: serverTimestamp() },
        { title: "Upcoming EV Policy to slash prices", category: "Electric Vehicles", status: "NEW LAUNCH", content: "New government subsidies are expected to make EVs more affordable by 20% by year-end.", createdAt: serverTimestamp() }
    ];

    for (const item of news) {
        await addDoc(collection(db, "product_news"), { ...item, createdAt: serverTimestamp() });
    }

    console.log("Bulk Seeding completed!");
    return true;
};
