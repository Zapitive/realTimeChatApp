const bcrypt = require('bcrypt')

const generateHash = async(plainPassword) =>{
    try{
        const hashedPassword = await bcrypt.hash(plainPassword,10);
        return hashedPassword
    }catch(err){
        console.log("Password hashing failed")
    }
}

module.exports = {generateHash}