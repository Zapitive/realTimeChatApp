const userInfo = require('../models/userInfoModel');
const RefreshToken = require('../models/refreshTokenModel')
const {generateHash, passwordCheck} = require('../utils/passwordProcess');
const {generateToken} = require('../utils/generateToken');
const crypto = require('crypto')

const signUp = async(req,res) =>{
    try{
        const {username, email, password} = req.body;

        if (!username || !email || !password){
            return res.status(400).json({status:false, message:"All fields required"});
        }

        const registeredUser = await userInfo.findOne({username:username});
        const registeredEmail = await userInfo.findOne({email:email});

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validEmail = !emailRegex.test(email);

        if(registeredUser){
            return res.status(400).json({status:false, message:"Username already taken"});
        }else if(registeredEmail && validEmail){
            return res.status(400).json({status:false, message:"Invalid email"});   
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

        const strongPassword = passwordRegex.test(password);

        if(!strongPassword){
            return res.status(400).json({status:false, message:"Password too weak"});
        }

        const hashedPassword = await generateHash(password);
        const user = await userInfo.create({
            username: username,
            email: email,
            password: hashedPassword
        })

        if(user){
            const {token, refreshToken, hashedToken} = await generateToken(user._id);
            await RefreshToken.create({
                userId: user._id,
                refreshToken: hashedToken,
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            });

            return res.status(201).json({status:true, message:"User created successfully",token: token});
        }else{
            return res.status(500).json({status:false, message:"Unable to create user"});
        }
    }catch(err){
        console.log(err);
    }
}

const login = async (req,res) =>{
    try{
        const {identifier, password} = req.body;

        const user = await userInfo.findOne({$or: [{username: identifier}, {email: identifier}]});

        
        if(!user){
            return res.status(404).json({status:false, message:"User not found"});
        }

        const isMatched = await passwordCheck(password, user.password);

        if(isMatched){
            await RefreshToken.deleteMany({userId:user._id});
            const {token, refreshToken, hashedToken} = await generateToken(user._id);
            await RefreshToken.create({
                userId: user._id,
                refreshToken: hashedToken,
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly : true,
                secure: true,
                sameSite: "None"
            });

            return res.status(200).json({status:true, message:"Login successful",token: token});
        }else{
            return res.status(403).json({status:false, message:"Password does not match"});
        }
    }catch(err){
        console.log(err)
    }

}

const refresh = async (req,res) =>{
    try{
        const token = req.cookies.refreshToken;

        if (!token){
            return res.status(401).json({status:false, message:"No token in cookies"});
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const storedToken = await RefreshToken.findOne({
            refreshToken:hashedToken
        });

        if(!storedToken){
            return res.status(403).json({status:false, message:"Invalid token"})
        }

        await RefreshToken.deleteMany({
            userId: storedToken.userId
        });

        const {token: accessToken, refreshToken, hashedToken: newHash} = await generateToken(storedToken.userId);

        await RefreshToken.create({
            userId: storedToken.userId,
            refreshToken: newHash
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        return res.status(200).json({status:true, message: "new token generated", token:accessToken})



    }catch(err){
        console.log(err)
    }
}

module.exports = {signUp, login, refresh}