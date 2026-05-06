const { default: mongoose } = require('mongoose');
const userInfo = require('../models/userInfoModel');
const chatRoom = require('../models/chatRoomModel');

const setUserOnline = async (userId) =>{
    return await userInfo.findByIdAndUpdate(userId,{
        status: 'online'
    })
}

const setUserOffline = async (userId) =>{
    return await userInfo.findByIdAndUpdate(userId,{
        status: 'offline',
        lastSeen: new Date()
    })
}

const findUser = async (filter) =>{
    return await userInfo.findOne(filter).lean();
}

const searchUser = async ({searchValue, uId}) =>{
    const regexValue = "^"+searchValue;
    const userId = new mongoose.Types.ObjectId(uId);

    const chats = await chatRoom.find({ members: userId},
        {_id : 0,members: 1}).lean();

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
    }).limit(10).lean();

    if(users){
        const filteredUsers = users.map((user)=>({
            id : user._id.toString(),
            name : user.username,
            status: user.status
        }));
        return {filteredUsers: filteredUsers}
    }
    
    return {filteredUsers: []}
    
}

module.exports = {setUserOnline, setUserOffline, findUser, searchUser}