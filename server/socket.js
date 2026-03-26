const { Server } = require('socket.io');
const { authenticateSocketToken } = require('./middlewares/authMiddleware');

let io;

const initSocket = (server) =>{

    io = new Server(server,{
        cors:{
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST', 'DELETE']
        }
    });

    io.use(authenticateSocketToken)

    io.on('connection', (socket) =>{

        

        console.log('User connected', socket.id);
        console.log('user ID', socket.user.id);

        socket.on('disconnect', ()=>{
            console.log('User disconnected', socket.id)
        })

    });

}


module.exports = { initSocket }