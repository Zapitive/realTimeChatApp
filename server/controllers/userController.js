const userService = require('../services/userService')



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

module.exports = {searchUser}