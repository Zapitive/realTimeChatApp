const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
require('dotenv').config();
const connectDB = require('./conn');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { initSocket } = require('./socket/socket');

const app = express();
const server = http.createServer(app);
initSocket(server);

PORT = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE'],
    credentials:true
}));

app.use(bodyParser.urlencoded({ extended: true }));

connectDB();


app.use('/api/auth',authRoutes)
app.use('/api/user',userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages',messageRoutes);


try{
    server.listen(PORT, ()=>{
        console.log(`app is listening on port ${PORT}`)
    })
}catch(error){
    console.log(error)
}