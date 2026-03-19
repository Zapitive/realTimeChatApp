import api from './axios';
import { useAuth } from '../context/authContext';
import { refreshAccessToken } from './refresh';

export const useAxiosPrivate = () =>{
    const {accessToken, setAccessToken} = useAuth();

    api.interceptors.request.use(
        (config) =>{
            if (accessToken){
                config.headers.Authorization = `Bearer ${accessToken}`;
            }

            return config;
        }
    );

    api.interceptors.response.use(
        (response) => response,
        async(error) =>{
            const prevRequest = error.config;
            if (error.response?.status === 401 && !prevRequest._retry){
                prevRequest._retry = true;

                const newToken = await refreshAccessToken(setAccessToken);

                if (newToken){
                    prevRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(prevRequest);
                }
            }

            return Promise.reject(error)
        }
    );

    return api;
};