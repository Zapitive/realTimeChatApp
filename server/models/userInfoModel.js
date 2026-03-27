const {Schema, model} = require('mongoose');

const userInfoSchema = new Schema({
    username:{
        type:String,
        required: true,
        index:true,
        unique : true
    },
    email:{
        type: String,
        required: true,
        index:true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }
},{
    timestamps: true
});

const userInfo = model('userInfo',userInfoSchema);

module.exports = userInfo;