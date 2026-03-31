const { Server } = require('socket.io');
const { authenticateSocketToken } = require('../middlewares/authMiddleware');
const message = require('../models/messageModel');
const chatRoom = require('../models/chatRoomModel');

let io;

const initSocket = (server) =>{

    io = new Server(server,{
        cors:{
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST', 'DELETE']
        }
    });

    io.use(authenticateSocketToken);

    const socketUsers = new Map();

    io.on('connection', (socket) =>{

        const userId = socket.user.id;
        
        socketUsers.set(userId,socket.id);
        socket.join(userId);

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

            const newMessage = await message.create({
                chatId: chatId,
                senderId: socket.user.id,
                content: messageInp
            });
            callback(newMessage);
            if(newMessage){
                io.to(receiverId.toString()).emit('receiveMessage',newMessage);
            }
        });

        socket.on('disconnect', ()=>{
            console.log('User disconnected', socket.id)
        })

    });

}


module.exports = { initSocket }