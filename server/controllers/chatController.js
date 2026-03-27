const { default: mongoose } = require("mongoose");
const chatRoom = require("../models/chatRoomModel");


const createChat = async(req,res) =>{
    try{
        const { receiverId } = req.body;
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId)
        const members = [ receiverObjectId, req.user.id ];
        // console.log(receiverObjectId, mongoose.Types.ObjectId.isValid(req.user.id))

        const existingChat = await chatRoom.findOne({
            members: { $all: members }
        });

        if (existingChat){
            return res.status(200).json({message: 'Chat already exists', chat: existingChat })
        }

        const newChatRoom = await chatRoom.create({
            members: members 
        });

        if (newChatRoom){
            return res.status(201).json({message: 'new chatroom created', chat: newChatRoom });
        }
    }catch(err){
        console.log(err)
    }
}

module.exports = { createChat };