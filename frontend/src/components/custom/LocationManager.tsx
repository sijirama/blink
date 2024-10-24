import { useGeolocated } from 'react-geolocated';
import React, { useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useLocationStore } from '@/store/location';
import LocationModal from '../modals/Location';
import { toast } from 'sonner';

export const LocationManager: React.FC = () => {
    const { setLocation, setGeolocationStatus, setPositionError } = useLocationStore();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition, positionError } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: true,
            maximumAge: 0,
        },
        watchPosition: true,
        onSuccess: (position) => {
            setLocation(position.coords);
            setPositionError(null);
        },
        onError: (error: any) => {
            console.error('Geolocation Error:', error);
            setPositionError(error);
        },
    });

    useEffect(() => {
        setGeolocationStatus(isGeolocationAvailable, isGeolocationEnabled);
    }, [isGeolocationAvailable, isGeolocationEnabled, setGeolocationStatus]);

    useEffect(() => {
        if (!isGeolocationAvailable || !isGeolocationEnabled || positionError) {
            setIsModalOpen(true);
        }
    }, [isGeolocationAvailable, isGeolocationEnabled, positionError]);

    const handleClick = () => {
        if (coords) {
            toast.info(`Current location: Lat ${coords.latitude}, Lon ${coords.longitude}`);
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div className="">
                <button
                    onClick={handleClick}
                    className={`p-2 rounded-full shadow-lg transition-colors duration-200 ${coords
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                        }`}
                >
                    <FaMapMarkerAlt className="text-white" size={22} />
                </button>
            </div>
            <LocationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} getPosition={getPosition} />
        </>
    );
};
