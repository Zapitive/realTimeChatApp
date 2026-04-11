const chatRoom = require("../models/chatRoomModel");
const message = require("../models/messageModel")


const messageReceivedUpdate = async(messageId, receiverId) =>{
    return await message.findByIdAndUpdate(messageId,{
        $addToSet: {
            receivedBy: receiverId
        }
    })
}

const createNewMessage = async(chatId, senderId, content) =>{
    const newMessage = await message.create({
        chatId: chatId,
        senderId: senderId,
        content: content
    });
    return newMessage
}

const receivedAllMessages = async (userId) =>{
    const chats = await chatRoom.find({
        members:userId
    }).select('_id');

    const chatIds = chats.map(chat => chat._id);

    return await message.updateMany({
        chatId: {$in: chatIds},
        senderId: {$ne: userId},
        receivedBy: {$ne: userId}
    },{
        $addToSet: {receivedBy: userId}
    });

}

module.exports = {messageReceivedUpdate, createNewMessage, receivedAllMessages}