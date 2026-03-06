const express = require('express');

require('dotenv').config();
const connectDB = require('./conn')

const app = express();

PORT = process.env.PORT || 5001;

connectDB();

app.get('/',(req,res)=>{
    res.send('App running successfully')
})

try{
    app.listen(PORT, ()=>{
        console.log(`app is listening on port ${PORT}`)
    })
}catch(error){
    console.log(error)
}