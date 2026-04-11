const userInfo = require("../models/userInfoModel");


const setUserOnline = async (userId) =>{
    return await userInfo.findByIdAndUpdate(userId,{
        status: 'online'
    })
}

const setUserOffline = async (userId) =>{
    return await userInfo.findByIdAndUpdate(userId,{
        status: 'offline',
        lastSeen: new Date()
    })
}

module.exports = {setUserOnline, setUserOffline}