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
    try{
        const isMatched = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatched; 
    }catch(err){
        console.log("Password comparision failed");
        throw err;
    }
}


module.exports = {generateHash, passwordCheck}