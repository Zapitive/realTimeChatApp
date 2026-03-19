import api from './axios';
import { useAuth } from '../context/authContext';

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

    return api;
};