const { Server } = require('socket.io');
const { authenticateSocketToken } = require('../middlewares/authMiddleware');
const message = require('../models/messageModel');
const chatRoom = require('../models/chatRoomModel');
const { setUserOnline, setUserOffline } = require('../services/userService');
const {messageReceivedUpdate, createNewMessage, receivedAllMessages} = require('../services/messageService');

let io;

const initSocket = (server) =>{

    io = new Server(server,{
        cors:{
            origin: process.env.FRONTEND_URL,
            methods: ['GET', 'POST', 'DELETE']
        }
    });

    io.use(authenticateSocketToken);

    const socketUsers = new Map();
    const onlineUsers = new Map();

    io.on('connection',async (socket) =>{

        const userId = socket.user.id;
        
        socketUsers.set(userId,socket.id);
        socket.join(userId);

        if(!onlineUsers.has(userId)){
            onlineUsers.set(userId, new Set());
            await setUserOnline(userId);
            await receivedAllMessages(userId);
            socket.broadcast.emit("userOnline", {userId});
        }

        onlineUsers.get(userId).add(socket.id);

        socket.on('joinRoom', async(data) =>{
            if (socket.rooms.has(data.activeChatId)) return;
                socket.join(data.activeChatId);
        })

        // send message event
        socket.on('sendMessage', async (data, callback) => {
            const {chatId, messageInp} = data;

            const convo = await chatRoom.findOne({
                _id: chatId,
                members: userId
            },{
                members: 1
            });

            if (!convo) return;

            const receiverId = convo.members.find(
                (id) => id.toString() !== userId.toString()
            );

            const newMessage = await createNewMessage(chatId, socket.user.id, messageInp);
            
            if(newMessage){
                await chatRoom.updateOne(
                    {_id:chatId},
                    {
                        $set:{
                            lastMessage:{
                                text: newMessage.content,
                                senderId: newMessage.senderId,
                                createdAt: newMessage.createdAt
                            }
                        }
                    }
                );

                io.to(String(chatId)).emit('receiveMessage',newMessage);
                io.to(String(receiverId)).emit('receiveNotification',newMessage);
            }

            callback({
                status: "ok",
                msgStatus: 'sent',
                msgId: newMessage._id,
            });
        });

        // message received event
        socket.on('messageReceived',async (data)=>{
            const {msgId, chatId, senderId} = data;
            // write in DB on msgId received and userId received it
            await messageReceivedUpdate(msgId, userId);

            io.to(String(senderId)).emit('receivedUpdate',{msgId: msgId, chatId: chatId});
        });

        socket.on('disconnect', async ()=>{
            // console.log('User disconnected', socket.id);
            
            const userSockets = onlineUsers.get(userId); // set of userId

            if(userSockets){
                userSockets.delete(socket.id);

                if (userSockets.size === 0){
                    // add debouncing for updating offline prevents flickering of online and offline
                    onlineUsers.delete(userId);
                    await setUserOffline(userId);
                    socket.broadcast.emit("userOffline", {userId});
                }
            }
        })

    });

}


module.exports = { initSocket }