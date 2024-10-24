
import { useState } from 'react';

const LocationComponent = () => {
    const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
    const [error, setError] = useState<string | null>(null);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    setError(error.message);
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    return (
        <div className='text-xs'>
            <button onClick={getLocation}>Get Location</button>
            {location.latitude && location.longitude ? (
                <div>
                    <p>Latitude: {location.latitude}</p>
                    <p>Longitude: {location.longitude}</p>
                </div>
            ) : (
                error && <p>Error: {error}</p>
            )}
        </div>
    );
};

export default LocationComponent;
