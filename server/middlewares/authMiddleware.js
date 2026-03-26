const jwt = require('jsonwebtoken')

const authenticateToken = async (req,res,next) =>{
    try{
        const authHeaders = req.headers['authorization'];
        const token = authHeaders && authHeaders.split(' ')[1];

        if (token){
            jwt.verify(token, process.env.JWT_SECRET_KEY,(err,user) =>{
                if (err){
                    return res.status(401).json({status:false, message:"Invalid token"});
                }
                req.user = user;
                next();
            })
        }else{
            return res.status(401).json({status:false, message:"No token available"});
        }

    }catch(err){
        console.log(err)
    }
}

const authenticateSocketToken = (socket,next) =>{

    try{
        const token = socket.handshake.auth.token;

        if(!token){
            return next(new Error('Unauthorized'));
        }

        const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        socket.user = user;

        next();

    }catch(err){
        next(new Error("Invalid token"));
    }

}

module.exports = {authenticateToken, authenticateSocketToken}