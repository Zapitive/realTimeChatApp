const express = require('express');

require('dotenv').config();
const connectDB = require('./conn');
const authRoutes = require('./routes/authRoutes')

const app = express();

PORT = process.env.PORT || 5001;

connectDB();

app.get('/',(req,res)=>{
    res.send('App running successfully')
})

app.use('/api/auth',authRoutes)

try{
    app.listen(PORT, ()=>{
        console.log(`app is listening on port ${PORT}`)
    })
}catch(error){
    console.log(error)
}