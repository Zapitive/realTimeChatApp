import api from './axios';

export const refreshAccessToken = async (setAccessToken) =>{
    try{
        const res = await api.post("/api/auth/refresh");
        setAccessToken(res.data.token);
        return res.data.token;

    }catch(err){
        console.log("Refresh failed",err);
        return null;
    }
};