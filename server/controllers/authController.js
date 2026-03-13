const userInfo = require('../models/userInfoModel');
const RefreshToken = require('../models/refreshTokenModel')
const {generateHash, passwordCheck} = require('../utils/passwordProcess');
const {generateToken} = require('../utils/generateToken');

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

            return res.status(201).json({status:true, message:"User created successfully",token: token, refreshToken: refreshToken});
        }else{
            return res.status(500).json({status:false, message:"Unable to create user"});
        }
    }catch(err){
        console.log(err);
    }
}

const login = async (req,res) =>{

    const {identifier, password} = req.body;

    const user = await userInfo.findOne({$or: [{username: identifier}, {email: identifier}]});

    
    if(!user){
        return res.status(404).json({status:false, message:"User not found"});
    }

    const isMatched = await passwordCheck(password, user.password);

    if(isMatched){
        const {token, refreshToken, hashedToken} = await generateToken(user._id);
        await RefreshToken.create({
            userId: user._id,
            refreshToken: hashedToken,
        });

        return res.status(200).json({status:true, message:"Login successful",token: token, refreshToken: refreshToken});
    }else{
        return res.status(401).json({status:false, message:"Password does not match"});
    }

}

module.exports = {signUp, login}