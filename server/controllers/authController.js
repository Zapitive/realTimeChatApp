const userInfo = require('../models/userInfoModel')
const {generateHash} = require('../utils/passwordProcess')

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
            return res.status(201).json({status:true, message:"User created successfully"});
        }else{
            return res.status(500).json({status:false, message:"Unable to create user"});
        }
    }catch(err){
        console.log(err);
    }
}

module.exports = {signUp}