const {model,Schema, default: mongoose} = require('mongoose');

const refreshTokenSchema = new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userInfo"
    },
    refreshToken:{
        type: String,
        required: true
    },
    createdAt:{
        type:Date,
        default: Date.now,
        expires: 604800
    }
});

const RefreshToken = model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;