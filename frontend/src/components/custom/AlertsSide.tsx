import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import useAlertStore from "@/store/alert";
import { AlertCard } from './AlertCard';


export default function AlertsSide() {
    const { alerts } = useAlertStore();
    const endOfAlertsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (endOfAlertsRef.current) {
            endOfAlertsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [alerts]);

    return (
        <div className="h-[calc(100vh-150px)] overflow-y-auto hide-scrollbar">
            <div>
                <AnimatePresence>
                    {alerts.map((alert) => (
                        <AlertCard key={alert.ID} alert={alert} />
                    ))}
                </AnimatePresence>
                <div ref={endOfAlertsRef} />
            </div>
        </div>
    )
}

