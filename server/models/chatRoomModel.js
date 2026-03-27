const { Schema , model} = require('mongoose');

const chatRoomSchema = new Schema({
    members : [
        {
            type : Schema.Types.ObjectId,
            ref : 'userInfo',
            require: true
        }
    ],
    isGroup :{
        type : Boolean,
        default : false
    },
    
    name : String,
    Admin: {
        type : Schema.Types.ObjectId,
        ref : 'userInfo'
    },

    lastMessage :{
        text : 'String',
        senderId : {
            type : Schema.Types.ObjectId,
            ref : 'userInfo'
        },
        createdAt : Date
    }
},{
    timestamps : true
});

chatRoomSchema.index({members : 1, updateAt: -1})

const chatRoom = model('ChatRoom', chatRoomSchema);

module.exports = chatRoom;