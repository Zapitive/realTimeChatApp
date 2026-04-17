const chatRoom = require("../models/chatRoomModel")

const getChatMembers = async (chatId) => {
    return chatRoom.findById(chatId,{
        _id:0,
        members:1
    })
}

module.exports = {getChatMembers}