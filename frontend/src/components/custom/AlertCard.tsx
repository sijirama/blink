import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Alert } from '@/types/alert';
import { useGeolocated } from "react-geolocated";
import { FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useInterface } from '@/store/interface';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
    const [expanded, setExpanded] = useState(false);
    const { coords } = useGeolocated();
    const [distance, setDistance] = useState<number | null>(null)
    const { onOpen } = useInterface()

    useEffect(() => {
        if (coords) {
            const distance = coords && alert.Location
                ? calculateDistance(coords.latitude, coords.longitude, alert.Location.Latitude, alert.Location.Longitude)
                : null;
            setDistance(distance);
        }
    }, [coords, alert])


    return (
        <motion.div
            onClick={() => onOpen("reportCard", { alertId: alert.ID })}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200 font-poppins"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-0">{alert.Title}</h3>
                <div className="flex items-center">
                    <span className=" text-xs text-gray-500 mr-2">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${alert.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {alert.Status}
                    </span>
                </div>
            </div>

            <div className="mb-4">
                <p className={`text-sm text-gray-600 ${expanded ? '' : 'line-clamp-2'}`}>
                    {alert.Description}
                </p>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-500 hover:text-blue-700 text-xs font-medium mt-1 flex items-center"
                >
                    {expanded ? (
                        <>
                            <FaChevronUp className="mr-1" />
                            Show less
                        </>
                    ) : (
                        <>
                            <FaChevronDown className="mr-1" />
                            See more
                        </>
                    )}
                </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center">
                    <FaMapMarkerAlt className="text-gray-400 mr-2" />
                    <span className=" text-xs lg:text-sm text-gray-600">
                        {distance != null ? `${distance.toFixed(1)} km from you` : 'Distance unavailable'}
                    </span>
                </div>

                <div className="flex items-center">
                    <FaClock className="text-gray-400 mr-2" />
                    <span className=" text-xs lg:text-sm text-gray-500">
                        Created: {new Date(alert.CreatedAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center  text-xs lg:text-sm text-gray-500">
                <div className="flex items-center">
                    <FaExclamationTriangle className="text-gray-400 mr-2" />
                    <span>Urgency:</span>
                    <div className="relative ml-2">
                        <div className={`w-3 h-3 rounded-full ${alert.Urgency > 7 ? 'bg-red-500' :
                            alert.Urgency > 4 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}>
                            {alert.Status === 'Active' && (
                                <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-green-400"></span>
                            )}
                        </div>
                    </div>
                    <span className="ml-1">{alert.Urgency}/10</span>
                </div>
            </div>
        </motion.div>
    );
};

export default AlertCard;
