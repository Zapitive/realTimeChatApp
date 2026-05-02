const userInfo = require('../models/userInfoModel');
const RefreshToken = require('../models/refreshTokenModel')
const {generateHash, passwordCheck} = require('../utils/passwordProcess');
const {generateToken} = require('../utils/generateToken');
const crypto = require('crypto');
const authService = require('../services/authService');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000
}

const handleError = (err, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
};

const signUp = async(req,res) =>{
    try{
        const {username, email, password} = req.body;
        const result = authService.signUp({username, email, password});

        res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

        return res.status(201).json({message:"User created successfully",token: result.token});
    }catch(err){
        handleError(err, res);
    }
}

const login = async (req,res) =>{
    try{
        const {identifier, password} = req.body;
        const result = authService.login({identifier, password});

        res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

        return res.status(200).json({message:"Login successful", token: (await result).token})
    }catch(err){
        handleError(err, res);
    }

}

const refresh = async (req,res) =>{
    try{
        const token = req.cookies.refreshToken;

        const result = await authService.refresh(token);

        res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

        return res.status(200).json({message: "Token refreshed", token: result.token});

    }catch(err){
        handleError(err, res);
    }
}

module.exports = {signUp, login, refresh}