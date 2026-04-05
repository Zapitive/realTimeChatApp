import { createContext, useContext, useState, useEffect } from "react";
import { refreshAccessToken } from "../api/refresh";

const AuthContext = createContext();

export const AuthProvier = ({children})=>{

    const [accessToken, setAccessToken] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
    const checkAuth = async () => {
        try {
        const res = await refreshAccessToken(setAccessToken);
        } catch (err) {
        setAccessToken(null);
        } finally {
        setIsAuthLoading(false);
        }
    };

    checkAuth();
    }, []);

    return(
        <AuthContext.Provider value={{accessToken, setAccessToken, isAuthLoading}}>
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () =>{
    return useContext(AuthContext);
};