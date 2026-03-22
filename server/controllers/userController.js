const { default: mongoose } = require('mongoose');
const userInfo = require('../models/userInfoModel');

const allUsers = async(req,res) =>{
    // take all users except the current user
    const users = await userInfo.find({_id:{$ne:req.user.id}}, {username:1}).limit(10);
    
    const filteredUsers = users.map((user) =>({
        ...user.toObject(),
        status:"offline"
    }));
    return res.status(200).json({message:"Users found", users:filteredUsers})
}

const searchUser = async(req,res) =>{
    try{
        const searchValue = req.query?.searchValue || "";
        const regexValue = "^"+searchValue;
        const objId = new mongoose.Types.ObjectId(req.user.id)

        const users = await userInfo.find({
            $or:[
                {username:{ $regex: regexValue, $options: "i" }},
                {email:{ $regex: regexValue, $options: "i" }}
            ],
            _id:{$ne: objId}
            },{
                username:1
        }).limit(10);

        const filteredUsers = users.map((user)=>({
            ...user.toObject(),
            status:'offline'
        }));

        return res.status(200).json({message:"Users found",users:filteredUsers});

    }catch(err){
        console.log(err)
    }
    
}

module.exports = {allUsers, searchUser}