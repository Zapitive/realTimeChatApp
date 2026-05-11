const { Server } = require('socket.io');
const { authenticateSocketToken } = require('../middlewares/authMiddleware');
const { setUserOnline, setUserOffline } = require('../services/userService');
const { messageReceivedUpdate, createNewMessage, receivedAllMessages, seenAllChatMessages, seenSingleMessage } = require('../services/messageService');
const { getChatMembers, updateLastMessage } = require('../services/chatRoomService');

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
    const offlineTimers = new Map();

    io.on('connection',async (socket) =>{

        const userId = socket.user.id;

        if (offlineTimers.has(userId)) {
            clearTimeout(offlineTimers.get(userId));
            offlineTimers.delete(userId);
        }
        
        socketUsers.set(userId,socket.id);
        socket.join(userId);

        if(!onlineUsers.has(userId)){
            onlineUsers.set(userId, new Set());
            setUserOnline(userId).catch(console.error);
            receivedAllMessages(userId).catch(console.error);
            socket.broadcast.emit("userOnline", {userId});
        }

        onlineUsers.get(userId).add(socket.id);

        socket.on('joinRoom', async(data, callback) =>{
            try{
                
                const convo = await getChatMembers(data.activeChatId);
                const isMember = convo?.members.some(id => String(id) === String(userId));
                if (!isMember) return;

                if (socket.rooms.has(data.activeChatId)) return;
                socket.join(data.activeChatId);
            }catch(err){
                console.error('Failed to join room', err);
                callback({status: 'error', msg:'Failed to join chat'});
            }
        });

        // send message event
        socket.on('sendMessage', async (data, callback) => {
            try{    
                const {chatId, messageInp} = data;

                if (!chatId || !messageInp || typeof messageInp !== "string") {
                    return callback({ status: "error", message: "Invalid data" });
                }
                const convo = await getChatMembers(chatId);

                if (!convo) return;

                const receiverId = convo.members.find(
                    (id) => id.toString() !== userId.toString()
                );

                const newMessage = await createNewMessage(chatId, socket.user.id, messageInp);
                
                if(newMessage){
                    await updateLastMessage(chatId,newMessage.content, newMessage.senderId, newMessage.createdAt);

                    socket.to(String(chatId)).emit('receiveMessage',newMessage);
                    io.to(String(receiverId)).emit('receiveNotification',newMessage);
                }

                callback({
                    status: "ok",
                    msgStatus: 'sent',
                    msgId: newMessage._id,
                });
            }catch(err){
                console.error('Failed to send message', err);
                callback({status:'error', msg:'Failed to send message'});
            }
        });

        // message received event
        socket.on('messageReceived',async (data, callback)=>{
            try{    
                const {msgId, chatId, senderId} = data;
                // write in DB on msgId received and userId received it
                await messageReceivedUpdate(msgId, userId);

                io.to(String(senderId)).emit('receivedUpdate',{msgId: msgId, chatId: chatId});
            }catch(err){
                console.error('Failed to mark message received');
            }
        });

        socket.on('messagesSeen', async (data, callback)=>{
            try{    
                const {chatId} = data;
                
                await seenAllChatMessages(userId, chatId);
                const chatMembers = await getChatMembers(chatId);
                const receiverId = chatMembers.members.find(
                    (id) => String(id) !== String(userId)
                );
                io.to(String(receiverId)).emit('seenUpdate', {chatId: chatId});
            }catch(err){
                console.error('Failed to mark all messages seen',err);
            }
        });

        socket.on('messageSeen', async (data, callback) =>{
            try{
                const {msgId, senderId, chatId} = data;

                await seenSingleMessage(userId, msgId);
                io.to(String(senderId)).emit('seenSingleMessage',{msgId: msgId, chatId: chatId});
            }catch(err){
                console.error('Failed to mark single message seen',err);
            }
        });

        socket.on('typing', (data) =>{
            try{    
                const {chatId} = data;
                socket.to(String(chatId)).emit('typing', {chatId});
            }catch(err){
                console.error('Typing error', err);
            }
        });

        socket.on('stopTyping', (data) =>{
            try{    
                const {chatId} = data;
                socket.to(chatId).emit('stopTyping', {chatId});
            }catch(err){
                console.error('Stopped typing error',err);
            }
        });

        socket.on('disconnect', async ()=>{
            
            try{    
                const timer = setTimeout(async() =>{
                    const userSockets = onlineUsers.get(userId); // set of userId
                    if(userSockets){
                        userSockets.delete(socket.id);

                        if (userSockets.size === 0){
                            // add debouncing for updating offline prevents flickering of online and offline
                            onlineUsers.delete(userId);
                            await setUserOffline(userId);
                            socket.broadcast.emit("userOffline", {userId});
                            socketUsers.delete(userId);
                        }
                    }
                }, 5000);

                offlineTimers.set(userId,timer);
                
            }catch(err){
                console.error('disconnecting error', err);
            }
        });

    });

}


module.exports = { initSocket }