const express=require('express');
const User = require('../models/User');
const router= express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt= require('bcryptjs');
var jwt= require('jsonwebtoken');
var fetchuser= require('../middleware/fetchUser');

const JWT_SECRET='harryisagoodboy';




//Route 1:Create a user using: POST"/api/auth/createuser". Doesn't require auth
router.post('/createuser',[body('email', 'Enter a valid Email').isEmail(),
body('name', 'Enter a valid Email').isLength({min: 3}),
body('password', 'password must be atleast 5 characters').isLength({min: 5}),
],async (req,res)=>{
    // const user = User(req.body);
    // user.save();
    const errors=validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    
try{

    let user = await User.findOne({email: req.body.email});

    if (user){
        return res.status(400).json({errors: 'Email exists already'});
    }
    const salt= await bcrypt.genSalt(10);
    const secPass= await bcrypt.hash(req.body.password,salt);

    //create user
    user= await  User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass
    });

    const data={
        user:{
            id: user.id
        }
    }

    const authtoken=jwt.sign(data, JWT_SECRET);
    console.log(authtoken);

    //This part is commented as the father function is async

    // .then((user)=>{
    //     return res.json(user);
    // }).catch((err)=>{
    //     return res.status(400).json({error: "please enter unique value"})
    // });
    res.json({authtoken});
}
catch (error){

    console.error(error.message);
    res.status(500).send("Some error Occured");
}
})



//Route 2: Authenticate user endpt: POST "api/auth/login"
router.post('/login',[body('email', 'Enter a valid Email').isEmail(),
body('password', 'password cannot be blank').exists(),
],async (req,res)=>{

    const errors=validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try{
        let user= await User.findOne({email: req.body.email});
        if (!user){
            return res.status(400).json({errors: "Invalid Credentials"});
        };

        const passwordcompare= await bcrypt.compare(req.body.password,user.password);
        console.log(passwordcompare);
        if (!passwordcompare){
            return res.status(400).json({errors: "Invalid Credentials"});
        }

        const data={
            user:{
                id: user.id
            }
        }

        const authtoken=jwt.sign(data, JWT_SECRET);
        console.log(authtoken);
        res.json({authtoken});

    

    }
    catch (error){

        console.error(error.message);
        res.status(500).send(" Internal Server ZError");
    }
    

});

//Route 3: Get logged in user details using: POST: "api/auth/getuser" . Login Required

router.post('/getuser',fetchuser,async (req,res)=>{
try{
    const userID= req.user.id;
    const user= await User.findById(userID).select("password");
    res.send(user);


}
catch (error){

    console.error(error.message);
    res.status(500).send(" Internal Server ZError");
}
});
module.exports= router;
