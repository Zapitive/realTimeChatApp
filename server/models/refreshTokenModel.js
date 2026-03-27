const { model,Schema } = require('mongoose');

const refreshTokenSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
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