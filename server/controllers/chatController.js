const chatRoomService = require('../services/chatRoomService')

const handleError = (err, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
};

const createChat = async(req,res) =>{
    try{
        const { receiverId } = req.body;
        const userId = req.user.id;

        const result = await chatRoomService.createChat({receiverId, userId});

        if (result?.existingChatId){
            return res.status(200).json({message: 'Chat already exists', chatId: result.existingChatId });
        }
        return res.status(201).json({message: 'new chatroom created', chatId: result.newChatRoomId });

    }catch(err){
        handleError(err, res);
    }
}

const allChats = async (req, res) =>{
    try{

        const uId = req.user.id;

        const result = await chatRoomService.allChats({uId});
        return res.status(200).json({message: "All chats received", chats: result});


    }catch(err){
        handleError(err, res);
    }
}

module.exports = { createChat, allChats };