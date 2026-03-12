const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const generateToken = async (userId) =>{
    try{
        const token = await jwt.sign(
            {id:userId},
            process.env.JWT_SECRET_KEY,
            {expiresIn:'20m'}
        )
        const rtoken = crypto.randomBytes(64).toString('hex')
        return {token: token, rtoken: rtoken}
    }catch(err){
        console.log(err)
    }
}

module.exports = {generateToken}