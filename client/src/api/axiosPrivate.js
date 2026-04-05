import { useEffect } from "react";
import api from "./axios";
import { useAuth } from "../context/authContext";
import { refreshAccessToken } from "./refresh";

export const useAxiosPrivate = () => {
  const { accessToken, setAccessToken } = useAuth();

  useEffect(() => {
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        if (!config.headers.Authorization && accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      }
    );

    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error.config;

        if (error.response?.status === 401 && !prevRequest._retry) {
          prevRequest._retry = true;

          try {
            const newToken = await refreshAccessToken(setAccessToken);

            if (newToken) {
            prevRequest.headers = {
                ...prevRequest.headers,
                Authorization: `Bearer ${newToken}`,
            };
              return api(prevRequest);
            }
          } catch (refreshError) {
            setAccessToken(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, []);

  return api;
};