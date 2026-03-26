import api from './axios';
import { useAuth } from '../context/authContext';
import { refreshAccessToken } from './refresh';
import { replace, useNavigate } from 'react-router-dom';

export const useAxiosPrivate = () =>{
    const {accessToken, setAccessToken} = useAuth();
    const navigate = useNavigate();

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
            if (
                (error.response?.status === 401 || error.response?.status === 403) 
                && !prevRequest._retry){
                prevRequest._retry = true;

                try{
                    const newToken = await refreshAccessToken(setAccessToken);
                    console.log(newToken)
                    
                    prevRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(prevRequest);

                }catch(refreshError){

                    setAccessToken(null);
                    return Promise.reject(refreshError);

                }
                
            }

            return Promise.reject(error)
        }
    );

    return api;
};