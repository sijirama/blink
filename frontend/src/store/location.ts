import create from 'zustand';

// Zustand store
interface LocationStore {
    coords: GeolocationCoordinates | null;
    isGeolocationAvailable: boolean;
    isGeolocationEnabled: boolean;
    positionError: GeolocationPositionError | null;
    setLocation: (location: GeolocationCoordinates) => void;
    setGeolocationStatus: (available: boolean, enabled: boolean) => void;
    setPositionError: (error: GeolocationPositionError | null) => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
    coords: null,
    isGeolocationAvailable: false,
    isGeolocationEnabled: false,
    positionError: null,
    setLocation: (location) => set({ coords: location }),
    setGeolocationStatus: (available, enabled) => set({ isGeolocationAvailable: available, isGeolocationEnabled: enabled }),
    setPositionError: (error) => set({ positionError: error }),
}));
