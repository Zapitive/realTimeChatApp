const userInfo = require('../models/userInfoModel')
const {generateHash} = require('../utils/passwordProcess')

const signUp = async(req,res) =>{
    try{
        const {username, email, password} = req.body

        const hashedPassword = await generateHash(password)
        const user = await userInfo.create({
            username: username,
            email: email,
            password: hashedPassword
        })

        if(user){
            return res.status(201).json({status:true, message:"User created successfully"})
        }else{
            return res.status(500).json({status:false, message:"Unable to create user"})
        }
    }catch(err){
        console.log(err)
    }
}

module.exports = {signUp}