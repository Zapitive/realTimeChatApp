const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const generateToken = async (userId) =>{
    try{
        const token = await jwt.sign(
            {id:userId},
            process.env.JWT_SECRET_KEY,
            {expiresIn:'20m'}
        )
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

        return {token: token, refreshToken: refreshToken, hashedToken: hashedToken}
    }catch(err){
        console.log(err)
    }
}

module.exports = {generateToken}