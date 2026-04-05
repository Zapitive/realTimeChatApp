import { useEffect } from 'react';
import { socket } from './SocketClient';
import { useAuth } from '../context/authContext';

export const useSocketWithAuth = () => {
    const { accessToken } = useAuth();

    useEffect(() => {
        if (!accessToken) {
            socket.disconnect();
            return;
        }

        socket.auth = {
            token: accessToken,
        };

        if (socket.connected) {
            socket.disconnect();
        }

        socket.connect();

        socket.on('connect_error', (error) => {
            if (error.message === 'Authentication error') {
                socket.disconnect();
            }
        });

        return () => {
            socket.off('connect_error');
        };
    }, [accessToken]); 

    return socket;
};