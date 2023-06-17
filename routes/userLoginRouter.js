import express from "express";
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import jwt2 from 'jsonwebtoken';
const router = express.Router();
import CryptoJS from "crypto-js"
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
    }else{
      try {
        // Otp generator
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
          email:req.body.emailMob
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
        // Create a transporter using the ethereal SMTP transport
        let transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: "liliane.stroman46@ethereal.email",
            pass: 'jXRBdjgazuXdzFrU2f',
          },
        });
    
        // Compose the email message
        let message = {
          from: "liliane.stroman46@ethereal.email",
          to: req.body.emailMob,
          subject: "Random Number",
          text: `Here is your OTP number: ${randomNumber}`,
        };
    
        // Send the email
        let info = await transporter.sendMail(message);
    
        // Log the message details and preview URL
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        res.render("otpLogin",{admin:false,user:false,otp:randomNumber,number:req.body.emailMob})
        // res.status(200).json({ message: "Email sent successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send email" });
      }
    }
  }
});
export default router;