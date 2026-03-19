import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvier = ({children})=>{

    const [accessToken, setAccessToken] = useState(null);

    return(
        <AuthContext.Provider value={{accessToken, setAccessToken}}>
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () =>{
    return useContext(AuthContext);
};