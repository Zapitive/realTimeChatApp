const bcrypt = require('bcrypt')

const generateHash = async(plainPassword) =>{
    try{
        const hashedPassword = await bcrypt.hash(plainPassword,10);
        return hashedPassword;
    }catch(err){
        console.log("Password hashing failed");
    }
}

const passwordCheck = async(plainPassword, hashedPassword) =>{
    try{
        const isMatched = bcrypt.compare(plainPassword, hashedPassword);
        return isMatched; 
    }catch(err){
        console.log("Password comparision failed");
    }
}


module.exports = {generateHash, passwordCheck}