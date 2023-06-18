import express from "express";
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import jwt2 from 'jsonwebtoken';
const router = express.Router();
import CryptoJS from "crypto-js"
import Token from "../models/tokenModel.js";
import userModel from "../models/userModel.js";
// import CryptoJS from "crypto-js"

router.get("/",(req,res)=>{
  res.set("Set-Cookie",``);
  res.render("userLogin");
})

router.post("/", async (req, res) => {
  console.log(req.body.psswd)
  if(req.body.lgnBtn=="regular-login"){
    console.log("This is login")
    let usersD = await fetch("http://127.0.0.1:2000/api/users");
    let users = await usersD.json();
    let user = users.users.find(d => (CryptoJS.AES.decrypt(d.psswd,process.env.secret_p).toString(CryptoJS.enc.Utf8)==req.body.psswd) && (d.email===req.body.emailMob || d.phoneNumber===Number(req.body.emailMob)))
    if(!user.verified){
      let token = await Token.findOne({userId:user._id});
      if(!token){
        const token  = await Token.create({
          userId:user._id,
          token:crypto.randomBytes(32).toString(hex),
        })
        const url = `${process.env.BASE_URL}users/${user._id}/${token.token}`;
        await sendEmail(user.email,"Verify Email",url);
      }
      res.status(400).send({message:"An Email sent to your Email Please Verify"});
    }
    if(user){
      console.log("User Exists")
      let JWTtoken = jwt2.sign({user:user._id,exp:Math.floor(Date.now()/1000)*(60*60)},process.env.secretKeyU);
      const expiration = new Date(new Date().getTime()+3600000);
      res.set("Set-Cookie",`token=${JWTtoken};httpOnly:false;Expiration=${expiration.toUTCString()}`);
      res.redirect("/");
    }else{
      console.log("User doesnt Exist")
      res.render("userLogin",{admin:false,user:false,flag:true})
    }
  }else{
    console.log("This is otp login")
    if(/^\d{10}$/.test(req.body.emailMob)){
      console.log("This is a number");
      
      var randomNumber = Math.floor(Math.random() * 9000) + 1000;
      fetch('http://127.0.0.1:2000/api/users', {
      method: 'PUT', // Use the PUT method for updating
      headers: {
        'Content-Type': 'application/json', // Set the request content type
        // Additional headers if required
      },
      body: JSON.stringify({ 
        // Data to be updated
         otp:randomNumber,
         number:req.body.emailMob
      })
     })
      .then(response => {
        // Handle the response
        if (response.ok) {
          // Value updated successfully
          console.log('Value updated successfully');
        } else {
          // Handle errors
          console.error('Error updating value:', response.status);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });

      
      // res.render("otpLogin",{admin:false,user:false,number:req.body.emailMob})
      // Your AccountSID and Auth Token from console.twilio.com
      const accountSid = 'ACfdde94f962631e5d5d57ea933cdf4618';
      const authToken = 'ed2ca5ccc281d3c4bc68dd8ba399448f';

      

      const client = twilio(accountSid, authToken);

      client.messages
        .create({
          body: ` Your OTP is ${randomNumber}`,
          to:  `+91${req.body.emailMob}`, // Text your number
          from: '+13157079467', // From a valid Twilio number
        })
        .then((message) => {
          console.log("Message is Succesfully Sent");
          res.render("otpLogin",{admin:false,user:false,otp:randomNumber,number:req.body.emailMob})
        });
    }
  }
});

router.get("/forgot",(req,res)=>{
  res.render("forgotPage1",{admin:false,user:false})
})

router.post("/forgot",async (req,res)=>{
   
  let {email} = req.body;
  let secret  = email+process.env.SECRET_AUTH;
  try{
    let user = await userModel.findOne({email:email});
    let payload = {
      id:user._id,
      email:user.email
    }
    const token = jwt2.sign(payload,secret,{expiresIn:'15m'})
    console.log(token)
    const link = `${process.env.BASE_URL}/login/reset-password/${user._id}/${token}`
    console.log(link);
    res.json({flag:true});
  }catch(err){
    console.log("login/forgot err: ",err);
    res.json({flag:false})
  }
})

router.get("/reset-password/:id/:tk",async(req,res)=>{
  const{id,tk} = req.params;
  //Checks the user id is valid or not
  const user = await userModel.findOne({_id:id});
  if(!user) res.json({"message":"invalid Link"})
  let secret  = user.email+process.env.SECRET_AUTH;
  try{
    const payload = jwt2.verify(tk,secret);
    res.render("forgotPage2",{admin:false,user:false,email:payload.email});
  }catch(err){
    console.log("Err: ",err);
    res.json({"message":"invalid Link"})
  }
  // res.render("forgotPage2")
})
router.post("/reset-password/:id/:tk", async (req, res) => {
  const { id, tk } = req.params;
  let { psswd } = req.body;
  const encryptedPassword = CryptoJS.AES.encrypt(psswd, process.env.secret_p).toString();
  const user = await userModel.findOne({ _id: id });
  if (!user) {
    return res.json({ "message": false })
  };
  let secret = user.email + process.env.SECRET_AUTH; 
  try {
    const payload = jwt2.verify(tk, secret);
    
    await userModel.updateOne({ _id: payload.id }, { psswd:encryptedPassword });
    return res.json({ "message": true });
  } catch (err) {
    console.log("Err: ", err);
    return res.json({ "message": false });
  }
});
export default router;