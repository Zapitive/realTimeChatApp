const {Schema, model} = require('mongoose');

const userInfoSchema = new Schema({
    username:{
        type:String,
        required: true,
        index:true
    },
    email:{
        type: String,
        required: true,
        index:true
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