const { default: mongoose } = require('mongoose');
const userInfo = require('../models/userInfoModel');
const chatRoom = require('../models/chatRoomModel');

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
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const chats = await chatRoom.find({
            members: userId
        },{
            _id : 0,
            members: 1
        });

        const contactedUsers = [
            ...new Set(
                chats.flatMap(c => c.members)
            )
        ].filter(id => id.toString() !== userId.toString());

        const users = await userInfo.find({
            $or:[
                {username:{ $regex: regexValue, $options: "i" }},
                {email:{ $regex: regexValue, $options: "i" }}
            ],
            _id:{
                $ne: userId,
                $nin: contactedUsers
            }
            },{
                username:1,
                status: 1
        }).limit(10);

        const filteredUsers = users.map((user)=>({
            id : user._id.toString(),
            name : user.username,
            status: user.status
        }));

        return res.status(200).json({message:"Users found",users:filteredUsers});

    }catch(err){
        console.log(err)
    }
    
}

module.exports = {allUsers, searchUser}