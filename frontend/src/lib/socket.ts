
import { io } from 'socket.io-client';
import { CONFIG } from './config';

export const socket = io(CONFIG.api, {
    reconnection: true, // Enable automatic reconnections
    reconnectionAttempts: Infinity, // Unlimited reconnection attempts
    reconnectionDelay: 5000, // Delay between reconnections
});
