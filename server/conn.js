const mongoose = require('mongoose')

const connectDB = async () =>{
    try{
        let conn
        conn = await mongoose.connect(process.env.mongoDB_URI)
        if (conn) console.log('Connect to DB')

    }catch(error){
        console.log('error connecting to DB')
    }
    
    
}

module.exports = connectDB
