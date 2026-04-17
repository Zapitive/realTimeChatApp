const chatRoom = require("../models/chatRoomModel");
const message = require("../models/messageModel");
const userInfo = require("../models/userInfoModel");


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
    const user = await userInfo.findById(userId,{
        lastSeen: 1
    });

    const lastSeen = user.lastSeen || new Date(0)

    return await message.updateMany({
        chatId: {$in: chatIds},
        senderId: {$ne: userId},
        receivedBy: {$ne: userId},
        createdAt: {$gte: lastSeen}
    },{
        $addToSet: {
            receivedBy: userId
        }
    });

}

const seenAllChatMessages = async (userId, chatId) => {
    return await message.updateMany({
        chatId: chatId,
        senderId: {$ne: userId}
    },{
        $addToSet : { seenBy: userId}
    })
}

module.exports = {messageReceivedUpdate, createNewMessage, receivedAllMessages, seenAllChatMessages}