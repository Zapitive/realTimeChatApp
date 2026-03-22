const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

require('dotenv').config();
const connectDB = require('./conn');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { authenticateToken } = require('./middlewares/authMiddleware');

const app = express();

PORT = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    methods:'POST,GET,DELETE',
    credentials:true
}));

app.use(bodyParser.urlencoded({ extended: true }));

connectDB();


app.use('/api/auth',authRoutes)
app.use('/api/user',userRoutes);
app.get('/api/protected',authenticateToken,(req,res)=>{
    res.send(req.user.id)
})

try{
    app.listen(PORT, ()=>{
        console.log(`app is listening on port ${PORT}`)
    })
}catch(error){
    console.log(error)
}