const chatRoom = require("../models/chatRoomModel");
const message = require("../models/messageModel");
const userInfo = require("../models/userInfoModel");
const AppError = require("../utils/AppError");
const chatRoomService = require('../services/chatRoomService');

// Private helpers

const resolveMessageStatus = (msg, totalMembers) => {
    const othersCount = totalMembers - 1;

    if (msg.seenBy.length === othersCount)     return 'seen';
    if (msg.receivedBy.length === othersCount) return 'received';
    return 'sent';
};

const formatMessages = (messages, chat, userId) => {
    return messages.map((msg) => {
        const senderId = String(msg.senderId);
        const isOwn    = userId === senderId;

        return {
            id:        String(msg._id),
            text:      msg.content,
            isOwn,
            timestamp: new Date(msg.createdAt),
            ...(isOwn && { msgStatus: resolveMessageStatus(msg, chat.members.length) })
        };
    });
};

//-------------------------------------------------------------------------------------

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
    const [chats, user] = await Promise.all([
        chatRoom.find({ members: userId }).select('_id').lean(),
        userInfo.findById(userId, { lastSeen: 1 }).lean()
    ]);

    const chatIds = chats.map(chat => chat._id);

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
    const lastSeenMsg = await message.findOne({
        chatId: chatId,
        seenBy: userId
    }).sort({createdAt: -1}).select({createdAt: 1})
    
    const since = lastSeenMsg?.createdAt ?? new Date(0);

    return await message.updateMany({
        chatId: chatId,
        senderId: {$ne: userId},
        seenBy: {$nin: [userId]},
        createdAt: {$gte: since}
    },{
        $addToSet : { seenBy: userId}
    })
}

const seenSingleMessage = async (userId, msgId) =>{
    return await message.findByIdAndUpdate(
        msgId,
        {$addToSet: {seenBy: userId}}
    )
}

const getMessages = async ({chatId, cursorCreatedAt, userId}) =>{

    if(!chatId)
        throw new AppError('chatId is required', 400);

    const chat = await chatRoomService.getChatMembers(chatId);

    const isMember = chat.members.some(member => String(member) === String(userId));
    if (!isMember) throw new AppError('Unauthorized to view messages', 403);
    
    const query = { chatId };

    if (cursorCreatedAt){
        query.createdAt = {$lt: new Date(cursorCreatedAt)}
    }

    const messages = await message.find(query).sort({createdAt: -1}).limit(20).lean();

    let nextCursor = null;

    if (messages.length === 0)
        return { chatMessages: [], nextCursor: null };

    
    const last = messages[messages.length - 1];
    nextCursor = last.createdAt;

    const chatMessages = formatMessages(messages, chat, userId);

    return {chatMessages: chatMessages, nextCursor: nextCursor}
        
}

module.exports = {messageReceivedUpdate, createNewMessage, receivedAllMessages, seenAllChatMessages, seenSingleMessage, getMessages}