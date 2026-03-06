const express = require('express');

const app = express();

PORT = 5000;

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