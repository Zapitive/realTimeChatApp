const mongoose = require('mongoose');
const userInfo = require('./models/userInfoModel');
const chatRoom = require('./models/chatRoomModel');
const message = require('./models/messageModel');

const models = [userInfo, chatRoom, message]

const connectDB = async () =>{
    try{
        let conn
        conn = await mongoose.connect(process.env.mongoDB_URI, {
            autoIndex: false
        });
        if (conn) {
            console.log('Connect to DB');
            await Promise.all(models.map(m => m.syncIndexes()));
            console.log('indexes on models Done');
        }
    }catch(error){
        console.log('error connecting to DB');
        console.log(error);
    }
    
    
}

module.exports = connectDB
