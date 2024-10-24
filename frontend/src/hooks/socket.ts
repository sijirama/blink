// src/hooks/useSocket.ts
import { useEffect } from 'react';
import useSocketStore from '@/store/socket';

const useSocket = () => {
    const { socket, isConnected, connect, disconnect } = useSocketStore(state => ({
        socket: state.socket,
        isConnected: state.isConnected,
        connect: state.connect,
        disconnect: state.disconnect,
    }));

    useEffect(() => {
        // You can put logic here to automatically connect when the component mounts, if desired.
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        socket,
        isConnected,
        connect,
        disconnect,
    };
};

export default useSocket;

