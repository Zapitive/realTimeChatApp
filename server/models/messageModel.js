const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
    chatId :{
        type : Schema.Types.ObjectId,
        ref : 'chatRoom',
        required : true
    },
    senderId : {
        type : Schema.Types.ObjectId,
        ref : 'userInfo',
        required : true
    },
    content : {
        type : String,
        trim : true
    },
    contentType :{
        type : String,
        enum : ['text', 'image', 'file'],
        default : 'text'
    },
    receivedBy : [
        {
            type : Schema.Types.ObjectId,
            ref : 'userInfo'
        }
    ],
    seenBy : [
        {
            type : Schema.Types.ObjectId,
            ref : 'userInfo'
        }
    ]},{
        timestamps : true
    }
);

messageSchema.index({chatId: 1, createdAt : -1});
// index not needed as createdAt will be checked with lastSeen, so creating unnecessary write overhead.
// messageSchema.index({receivedBy: 1});

const message = model('message',messageSchema);

module.exports = message;