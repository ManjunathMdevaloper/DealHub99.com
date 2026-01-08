import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
    const [selectedLocation, setSelectedLocation] = useState(
        localStorage.getItem('userLocation') || 'All India'
    );

    const detectLocation = async () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const response = await fetch(
                            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                        );
                        const data = await response.json();

                        // Try to get city, falling back to principalSubdivision (State) if city is not found
                        const city = data.city || data.locality || data.principalSubdivision;

                        if (city) {
                            setLocation(city);
                        }
                    } catch (error) {
                        console.error("Error fetching location details:", error);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                }
            );
        }
    };

    useEffect(() => {
        // Automatically request live location on every reload/mount
        detectLocation();
    }, []);

    const setLocation = (loc) => {
        setSelectedLocation(loc);
        localStorage.setItem('userLocation', loc);
    };

    return (
        <LocationContext.Provider value={{ selectedLocation, setLocation, detectLocation }}>
            {children}
        </LocationContext.Provider>
    );
};
