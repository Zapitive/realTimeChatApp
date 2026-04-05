import { io } from 'socket.io-client';

// Create socket instance without auto-connecting
export const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});