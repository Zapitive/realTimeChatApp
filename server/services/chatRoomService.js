const chatRoom = require("../models/chatRoomModel");
const userInfo = require("../models/userInfoModel");
const { default: mongoose } = require("mongoose");

const getChatMembers = async (chatId) => {
    return chatRoom.findById(chatId,{
        _id:0,
        members:1
    })
}

const createChat = async ({receiverId, userId}) =>{
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
    const members = [ receiverObjectId, userId ];
    
    const existingChat = await chatRoom.findOne({
        members: { $all: members },
        isGroup: false
    }).lean();
    
    if (existingChat){
        return {existingChatId: existingChat._id}
    }
    
    const newChatRoom = await chatRoom.create({
        members: members 
    });

    return {newChatRoomId: newChatRoom._id}
}

const allChats = async ({userId}) => {
    const userId = new mongoose.Types.ObjectId(userId);

    const chats = await chatRoom.aggregate([
        {
            $match: {
                members : userId
            }
        },
        {
            $lookup: {
                from: "userinfos",
                localField: "members",
                foreignField: "_id",
                as: "users"
            }
        },
        {
            $addFields: {
                users: {
                    $filter: {
                    input: "$users",
                    as: "u",
                    cond: { $ne: ["$$u._id", userId] }
                    }
                }
            }
        },
        {
            $unwind:"$users"
        },
        {
            $project :{
                "_id":0,
                "id" : "$_id",
                "users.id": "$users._id",
                "users.name": "$users.username",
                "users.status":1,
                "users.lastMessage":"$lastMessage.text"
            }
        }
    ])

    return chats
}

module.exports = {getChatMembers, createChat, allChats}