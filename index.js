const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); // Ensure this model is exported correctly
const jwt = require('jsonwebtoken');
const bcrypt=require('bcrypt')
const cors =require('cors')
const app = express();
require('dotenv').config();

app.use(cors())
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log('Connection error:', err));

// Signup route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    console.log(username);

    try {
        let existingUser = await User.findOne({ username }); // await added

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

         User.insertOne({ username, password }); // create new user instance
        // save to DB

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.get('/login',async(req,res)=>{
    const {username,password}=req.body
    try{
        let existingUser = await User.findOne({username})
        if(existingUser){
            const isMatch = await bcrypt.compare(password,existingUser.password)
            if(!isMatch){
                return res.status(400).json({message:'invalud creditnals'})
            }
            const token=jwt.sign({userId:existingUser._id},JWT_SECRET,{expiresIn:'1h'})
            res.json({message:'logged in',token:token})
        }
        else{
            res.send(400).json({message:"user not found"})
        }
    }
    catch(err){console.log(err)}
})
function verifyToken(req,res,next){
    const token = req.body.token
    jwt.verify(token,"secret",(err,decoded)=>{
        if(err){res.sendStatus(403)
        return}
    else{
        req.user=decoded
        next()
    }
    })
}
app.post('/profile/:id',verifyToken,async(req,res)=>{
    console.log(req.params.id)
    const user =await User.findById(req.params.id).select('-password')
    res.json({message:'welcome to the profile',user})
})
app.post('/logout',async(req,res)=>{
    res.json({message:'user logout sucessfully'})
})

app.listen(process.env.PORT, () => {
  console.log('Server is working on port', process.env.PORT);
});

