const { default: mongoose } = require("mongoose");
const chatRoom = require("../models/chatRoomModel");
const userInfo = require("../models/userInfoModel");


const createChat = async(req,res) =>{
    try{
        const { receiverId } = req.body;
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId)
        const members = [ receiverObjectId, req.user.id ];
        // console.log(receiverObjectId, mongoose.Types.ObjectId.isValid(req.user.id))

        const existingChat = await chatRoom.findOne({
            members: { $all: members },
            isGroup: false
        });

        if (existingChat){
            return res.status(200).json({message: 'Chat already exists', chatId: existingChat._id })
        }

        const newChatRoom = await chatRoom.create({
            members: members 
        });

        if (newChatRoom){
            return res.status(201).json({message: 'new chatroom created', chatId: newChatRoom._id });
        }
    }catch(err){
        console.log(err)
    }
}

const allChats = async (req, res) =>{
    try{

        const userId = new mongoose.Types.ObjectId(req.user.id);

        const results = await chatRoom.aggregate([
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
                    "users.status":1
                }
            }
        ])


        res.status(200).json({message: "All chats received", chats:results})


    }catch(err){
        console.log(err)
    }
}

module.exports = { createChat, allChats };