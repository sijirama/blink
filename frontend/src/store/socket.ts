
// src/store/socketStore.ts
import create from 'zustand';
import { io, Socket, ManagerOptions, SocketOptions } from 'socket.io-client';

interface SocketState {
    socket: Socket | null;
    isConnected: boolean;
    connect: (options?: Partial<ManagerOptions & SocketOptions>) => void;
    disconnect: () => void;
}

const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    isConnected: false,
    connect: (options?: Partial<ManagerOptions & SocketOptions>) => {
        if (!get().socket) {
            console.log('Connecting to the socket...');
            const socket = io('http://localhost:3000', options); // Replace with your server URL
            set({ socket });

            socket.on('connect', () => {
                console.log('Socket connected:', socket.id);
                set({ isConnected: true });
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
                set({ isConnected: false });
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            socket.on('reconnect_attempt', () => {
                console.log('Attempting to reconnect...');
            });
        }
    },
    disconnect: () => {
        const { socket } = get();
        if (socket) {
            console.log('Disconnecting from the socket...');
            socket.disconnect();
            set({ socket: null, isConnected: false });
            console.log('Socket disconnected');
        }
    },
}));

export default useSocketStore;

