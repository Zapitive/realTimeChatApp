const userService = require('../services/userService')

// const allUsers = async(req,res) =>{
//     // take all users except the current user
//     const users = await userInfo.find({_id:{$ne:req.user.id}}, {username:1}).limit(10);
    
//     const filteredUsers = users.map((user) =>({
//         ...user.toObject(),
//         status:"offline"
//     }));
//     return res.status(200).json({message:"Users found", users:filteredUsers})
// }

const searchUser = async(req,res) =>{
    try{
        const searchValue = req.query?.searchValue || "";
        const uId = req.user.id;
        const result = userService.searchUser(searchValue, uId)
        
        return res.status(200).json({message:"Users found",users: result.filteredUsers});

    }catch(err){
        console.log(err)
    }
    
}

module.exports = {allUsers, searchUser}