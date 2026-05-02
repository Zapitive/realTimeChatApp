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

const findUser = async (filter) =>{
    return await userInfo.findOne(filter).lean();
}

module.exports = {setUserOnline, setUserOffline, findUser}