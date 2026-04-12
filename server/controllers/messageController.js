const chatRoom = require("../models/chatRoomModel");
const message = require("../models/messageModel");


const getMessages = async (req, res) =>{
    try{   
        const chatId = req.query?.chatId || "";
        const userId = req.user.id;

        const messages = await message.find({chatId: chatId}).limit(20);
        const chat = await chatRoom.findById({_id: chatId},{
            _id: 0,
            members: 1
        });

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
            res.status(200).json({message: 'Found old messages', chatMessages: chatMessages})
        }
    }catch(err){
        console.log(err)
    }
}

module.exports = { getMessages }