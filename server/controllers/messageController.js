const messageService = require('../services/messageService');

const handleError = (err, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
};

const getMessages = async (req, res) =>{
    try{   
        const {chatId, cursorCreatedAt} = req.query;
        const userId = req.user.id;

        const result = await messageService.getMessages({chatId, cursorCreatedAt, userId});

        return res.status(200).json({
            message: 'Messages fetched sucessfully',
            chatMessages: result.chatMessages, 
            nextCursor: result.nextCursor
        });

    }catch(err){
        handleError(err, res);
    }
}

module.exports = { getMessages }