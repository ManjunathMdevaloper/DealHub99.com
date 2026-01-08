import React, { useState } from 'react';
import { seedDatabase } from '../utils/seedData';
import { Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SeedData = () => {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSeed = async () => {
        setLoading(true);
        setError('');
        try {
            await seedDatabase();
            setDone(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            console.error(err);
            setError('Seeding failed. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
            <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem' }}>
                <Database size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Database Seeder</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                    This will populate your Firestore with dummy products, sellers, and news items for testing.
                </p>

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {done ? (
                    <div style={{ color: 'var(--success)', fontWeight: '700', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <CheckCircle size={40} />
                        Data Seeded Successfully! Redirecting...
                    </div>
                ) : (
                    <button
                        onClick={handleSeed}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', gap: '0.75rem' }}
                        disabled={loading}
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <Database size={18} />}
                        {loading ? 'Seeding Data...' : 'Seed Test Data'}
                    </button>
                )}
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default SeedData;
