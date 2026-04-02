const message = require("../models/messageModel");


const getMessages = async (req, res) =>{
    const chatId = req.query?.chatId || "";
    const userId = req.user.id;

    const messages = await message.find({chatId: chatId},{
        senderId: 1,
        content: 1,
        createdAt : 1
    }).limit(20);


    const chatMessages = messages.map((msg) =>{
        
        const id = String(msg._id);
        const senderId = String(msg.senderId);
        const isOwn = userId === senderId;
        const date = new Date(msg.createdAt);

        const text = msg.content;
        
        return {
        id: id,
        text: text,
        isOwn: isOwn,
        timestamp: date
        }
    });

    if(messages){
        res.status(200).json({message: 'Found old messages', chatMessages: chatMessages})
    }
}

module.exports = { getMessages }