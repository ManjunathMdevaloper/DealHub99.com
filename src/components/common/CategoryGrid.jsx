import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Car, Laptop, Home, Watch, Bike, Briefcase, Camera } from 'lucide-react';

const categories = [
    { name: 'Cars', icon: <Car size={24} />, color: '#ffedd5' },
    { name: 'Mobiles', icon: <Smartphone size={24} />, color: '#e0f2fe' },
    { name: 'Bikes', icon: <Bike size={24} />, color: '#fee2e2' },
    { name: 'Agriproducts', icon: <Briefcase size={24} />, color: '#f0fdf4' },
    { name: 'Home Appliances', icon: <Home size={24} />, color: '#dcfce7' },
    { name: 'Others', icon: <Laptop size={24} />, color: '#f3e8ff' },
];

const CategoryGrid = () => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-2 grid-cols-4" style={{ gap: '1.5rem', margin: '2rem 0' }}>
            {categories.map((cat) => (
                <div
                    key={cat.name}
                    className="glass-card animate-fade-in"
                    onClick={() => navigate(`/browse?category=${cat.name}`)}
                    style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{
                        backgroundColor: cat.color,
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {cat.icon}
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{cat.name}</span>
                </div>
            ))}
        </div>
    );
};

export default CategoryGrid;
