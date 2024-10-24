import { create } from 'zustand';
import { Alert } from '@/types/alert';

interface AlertState {
    alerts: Alert[];
    addAlert: (alert: Alert) => void;
    removeAlert: (id: number) => void;
}

const useAlertStore = create<AlertState>((set) => ({
    alerts: [],
    addAlert: (alert) => {
        set((state) => {
            const alertExists = state.alerts.some((existingAlert) => existingAlert.ID === alert.ID);
            if (!alertExists) {
                return { alerts: [...state.alerts, alert] };
            }
            return state;
        });
    },
    removeAlert: (id) => {
        set((state) => ({
            alerts: state.alerts.filter((alert) => alert.ID !== id),
        }));
    },
}));

export default useAlertStore;
