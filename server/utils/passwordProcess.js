const bcrypt = require('bcrypt')

const generateHash = async(plainPassword) =>{
    try{
        const hashedPassword = await bcrypt.hash(plainPassword,10);
        return hashedPassword;
    }catch(err){
        console.log("Password hashing failed");
        throw err;
    }
}

const passwordCheck = async(plainPassword, hashedPassword) =>{
    return bcrypt.compare(plainPassword, hashedPassword);
}


module.exports = {generateHash, passwordCheck}