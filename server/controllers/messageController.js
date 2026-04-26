const chatRoom = require("../models/chatRoomModel");
const message = require("../models/messageModel");


const getMessages = async (req, res) =>{
    try{   
        const {chatId, cursorCreatedAt} = req.query;
        const userId = req.user.id;

        if (!chatId){
            return res.status(400).json({message: "chatId is required"})
        }

        const chat = await chatRoom.findById(chatId).select("members");

        if (!chat || !chat.members.includes(userId)) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const query = { chatId };

        if (cursorCreatedAt){
            query.createdAt = {$lt: new Date(cursorCreatedAt)}
        }

        const messages = await message.find(query).sort({createdAt: -1}).limit(20);

        let nextCursor = null;

        if (messages.length > 0) {
            const last = messages[messages.length - 1];
            nextCursor = last.createdAt;
        }

        const chatMessages = messages.map((msg) =>{
            
            const id = String(msg._id);
            const senderId = String(msg.senderId);
            const isOwn = userId === senderId;
            const date = new Date(msg.createdAt);
            let msgStatus = 'sent';
            if (isOwn){
                if (chat.members.length - 1 === msg.seenBy.length){
                    msgStatus = 'seen'
                }
                else if((chat.members.length - 1 === msg.receivedBy.length)){
                    msgStatus = 'received'
                }
            }
            
            const text = msg.content;
            
            return {
            id: id,
            text: text,
            isOwn: isOwn,
            ...(isOwn && { msgStatus: msgStatus }),
            timestamp: date
            }
        });

        if(messages){
            return res.status(200).json({message: 'Found old messages', chatMessages: chatMessages, nextCursor: nextCursor})
        }
        res.status(200).json({message:"No messages Found"})
    }catch(err){
        console.log(err)
    }
}

module.exports = { getMessages }