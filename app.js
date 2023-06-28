import express from "express";
import mongoose from "mongoose";
import path from "path";
import jwt2 from "jsonwebtoken"
import morgan from "morgan"
// At the component you want to use confetti
// import ConfettiGenerator from "confetti-js";
// import hbs from "hbs";
//Environment variables
import dotenv from 'dotenv';
dotenv.config();

//APP
const app = express();

//Logs OUR ACTIVITY
app.use(morgan("dev"));


//dirname configuration
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//HBS
import hbs from "hbs";
hbs.registerPartials(__dirname + "/views/partials");
hbs.registerHelper('joinPoints', function(points) {
  return points.join(',');
});

hbs.registerHelper('calculateTotal', function(items) {
  let total = 0;
  items.forEach(item => {
    total += item.productId.salePrice * item.quantity;
  });
 
  return total;
});
hbs.registerHelper('multiply', function(num1,num2) {
  return num1*num2;
});
hbs.registerHelper('convert', function(date) {
  const formattedDate = date.toLocaleDateString();
  return formattedDate;
});
 

 
//HBS and Static files configuration
app.set("view engine","hbs");
app.use(express.static(path.join(__dirname, "views","styles")));
app.set('views',[path.join(__dirname, 'views'),path.join(__dirname, 'views/pages'),path.join(__dirname, 'views/layouts')]);
app.use("/styles",express.static(path.join(__dirname,"views","styles")));
app.use("/uploads",express.static(path.join(__dirname,"views","uploads")));
app.use("/images",express.static(path.join(__dirname,"views","images")));
app.use("/JS",express.static(path.join(__dirname,"views","JS")));
app.use(express.static('node_modules'));

// app.use("/node_modules",express.static(path.join(__dirname,"node_modules")));

//Mongooose Connection
mongoose.connect("mongodb://127.0.0.1:27017/PetsWorld");



//Form or JSON Configuration
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//MIME TYPE configuration
import { lookup } from "mime-types";

//Nodemailer Configuration
import nodemailer from "nodemailer";
//Middleware
import authoriseAdminJwt from "./Middleware/authoriseAdminJwt.js";
import authoriseJwt from "./Middleware/authoriseJwt.js";
//Routers
import userLoginRouter from "./routes/userLoginRouter.js"
import userRegisterRouter from "./routes/userRegisterRouter.js"
import forgotPageRouter from "./routes/forgotPageRouter.js"
import productMngmtRouter from "./routes/productMngmtRouter.js";
import productAddRouter from "./routes/productAddRouter.js";
import adminProductViewRouter from "./routes/adminProductViewRouter.js"
import adminLoginRouter from "./routes/adminLoginRouter.js" 
import adminUserViewRouter from "./routes/adminUserViewRouter.js"
import userProductViewRouter from "./routes/userProductViewRouter.js";
import ctgryAddRouter from "./routes/ctgryAddRouter.js"
import adminCtgryViewRouter from "./routes/adminCtgryViewRouter.js"
import userProductDescrRouter from "./routes/userProductDescrRouter.js";
import dogFoodRouter from "./routes/dogFoodRouter.js";
import userCarRouter from "./routes/userCartRouter.js";
import userOrderHistRouter from "./routes/userOrderHistRouter.js";
import userWishlistRouter from "./routes/userWishlistRouter.js"
import userCheckoutRouter from "./routes/userCheckoutRouter.js"
import userPymntRouter from "./routes/userPymntRouter.js"
import userAddressRouter from "./routes/userAddressRouter.js"
import handleAddressRouter from "./routes/handleAddressRouter.js"
import adminOrderRouter from "./routes/adminOrderRouter.js"
import adminDashRouter from "./routes/adminDashRouter.js"
import userProfileRouter from "./routes/userProfileRouter.js"
//API routers
import productApi from "./routes/productApi.js";
import userApi from "./routes/userApi.js";
import customUserApi from "./routes/customApi.js";
import cartApi from "./routes/cartApi.js"
import userModel from "./models/userModel.js";

//DataRouter
import dataRouter from "./routes/dataRouter.js";

// import ctgryApi from "./routes/product"
//This code helps in preventing the access of logged in history content after Log out 
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});
//Otp generator
async function sendEmail() {
  // Create a test account with ethereal
  // let testAccount = await nodemailer.createTestAccount();
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
  const randomNumber = Math.floor(Math.random() * 1000);
  // Compose the email message
  let message = {
    from:"liliane.stroman46@ethereal.email",
    to: "sanjuag99@gmail.com",
    subject: "Random Number",
    text: `Here is your random number: ${randomNumber}`,
  };
  // Send the email
  let info = await transporter.sendMail(message);

  // Log the message details and preview URL
  console.log("Message sent: %s", info.messageId);
  
  // Genensole.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
// sendEmail().catch(console.error);



//Rendering Page
// app.use("/admin",productMngmtRouter);
app.use("/login",userLoginRouter);
app.use("/register",userRegisterRouter);
app.use("/forgot",forgotPageRouter);
app.use("/product-add",authoriseAdminJwt,productAddRouter);
app.use("/product-view",adminProductViewRouter);
app.use("/admin",adminLoginRouter);
app.use("/user-view",adminUserViewRouter);
app.use("/ctgry-add",authoriseAdminJwt,ctgryAddRouter);
app.use("/ctgry-view",authoriseAdminJwt,adminCtgryViewRouter);
app.use("/",userProductViewRouter);
app.use("/product-descr",userProductDescrRouter); 
app.use("/dog-food",dogFoodRouter);
app.use("/cart",authoriseJwt,userCarRouter);
app.use("/order-history",authoriseJwt,userOrderHistRouter);
app.use("/wishlist",userWishlistRouter);
app.use("/checkout",authoriseJwt,userCheckoutRouter);
app.use("/pymnt",authoriseJwt,userPymntRouter);
app.use("/address",authoriseJwt,userAddressRouter);
app.use("/profile",authoriseJwt,userProfileRouter);
app.get("/otp",(req,res)=>{
  res.render("otpLogin")
})

app.use("/",adminOrderRouter);
app.use("/",adminDashRouter);

//API
app.use("/api",productApi);
// app.use("/products",productsApi);
app.use("/api",userApi);
app.use("/api",cartApi);
app.use("/",handleAddressRouter);
app.use("/data",dataRouter);
app.use("/custom",customUserApi);
// app.use(express.static("views", {
//   setHeaders: (res, path) => {
//     const contentType = lookup(path);
//     if (contentType === "text/css") {
//       res.setHeader("Content-Type", contentType);
//     }
//   }
// }));


//Just Test for admin Page SetUp

app.get("/test",(req,res)=>{
  res.render("justTest",{admin:true,user:false});
})

//Just Test for admin Page SetUp
import sendMail from "./utils/sendMail.js";
app.get("/sendMail",(req,res)=>{
  // 
  if(req.session.data){
    res.json({"session":req.session.data})
  }else{
    res.json({"session":"no session"})
  }
  
})


let port  = 2000;
app.listen(port,()=>{
    console.log(`App is listening at ${port}`)
})