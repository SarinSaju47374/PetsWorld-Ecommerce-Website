import {ctgryModel, productModel,cartModel,addressModel,orderModel} from "../models/productModel.js"
import userModel from "../models/userModel.js"
import adminModel from "../models/adminModel.js"
import Token from "../models/tokenModel.js"
import fs from  "fs";
import path from "path";
import jwt2 from "jsonwebtoken";
import CryptoJS from "crypto-js"
import mongoose from "mongoose";
import sendMail from "../utils/sendMail.js"
import crypto from "crypto";
import {genrateRazorPay,verifyRazrPymnt} from "../utils/razorPay.js";
const ObjectId = mongoose.Types.ObjectId;
//dirname configuration
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
 


//website
function adminLogin(req,res){
    res.set("Set-Cookie",`token=;httpOnly;Expiration=Thu, 01 Jan 1970 00:00:00 GMT`);
    res.render("adminLogin",{admin:false,user:false});
}

async function adminVerify(req,res){
    const {userName,psswd} = req.body;
    let admins = await adminModel.find({}); 
    // console.log(admins)
    const admin = admins.find(admin=>admin.userName==userName && admin.psswd==psswd);
    // console.log(admin);
    if(admin){
        let JWTtoken = jwt2.sign({user:admin.userName,exp:Math.floor(Date.now()/1000)*(60*60)},process.env.secretKeyA);
        const expiration = new Date(new Date().getTime()+3600000);
        res.removeHeader("Set-Cookie");
        res.set("Set-Cookie",`token=${JWTtoken};httpOnly;Expiration=${expiration.toUTCString()}`);
        //Change this as soon as possible;
        res.redirect("/product-view");
    }else{
        res.send("Not a valid User Macha!")
    }
}

function productAdd(req,res){
    res.render("adminProductAdd",{admin:true,user:false});
}
async function ctgryAdd(req,res){
    let ctgrys = await ctgryModel.find();
    res.render("adminCtgryAdd",{admin:true,user:false,ctgrys});
}
async function ctgryUpdate(req,res){
    const{
        oid,
        ctgryName,
     } = req.body;
      // Get the uploaded files from req.files and extract necessary information
     
    await ctgryModel.updateOne({_id:oid},{
         ctgryName:ctgryName
    })
    
    res.redirect("/ctgry-view");
     
}

async function adminProductView(req,res){
    if(req.query.oid){
        let oid = req.query.oid;
      let productData = await fetch("http://127.0.0.1:2000/api/products")
        let products = await productData.json();
        let product = products.filter(item=>item._id==oid)[0];
        console.log(product);
        res.render("adminProductUpdate",{admin:true,user:false,product});
    }
        
    else if(req.query.hide_oid){
      let oid = req.query.hide_oid;
      const product = await productModel.updateOne({_id: oid},{
        isHidden:true
      });
      // const product = await productModel.deleteOne({_id: oid});
      // Delete the associated files
      // if (product && product.photo && product.photo.length > 0) {
      //     product.photo.forEach(photo => {
      //     console.log(path.join(__dirname,"views",`${photo.filePath}.png`));
      //     const filePath = path.join(__dirname,"..","views",`${photo.filepath}.png`);
      //     fs.unlink(filePath, (err) => {
      //         if (err) {
      //         console.error(`Error deleting file ${filePath}: ${err}`);
      //         } else {
      //         console.log(`File ${filePath} deleted successfully`);
      //         }
      //     });
      //     });
      // }

      // await productModel.deleteOne({_id:oid});
      const productData = await fetch("http://127.0.0.1:2000/api/products");
      const products = await productData.json();
      res.redirect("/product-view")
    }else if(req.query.ftd_oid){
      let oid = req.query.ftd_oid;
      const product = await productModel.updateOne({_id: oid},{
        isFeatured:true
      });
      const productData = await fetch("http://127.0.0.1:2000/api/products");
      const products = await productData.json();
      res.render("adminProductView",{admin:true,user:false,products});
    }
   else{
    const productData = await fetch("http://127.0.0.1:2000/api/products");
    const products = await productData.json();
    res.render("adminProductView",{admin:true,user:false,products});
   }
}

async function adminProductUpdate(req,res){
    const{
        oid,
        productName,
        brandName,
        description,
        points,
        productPrice,
        salePrice,
        stock,
        category,
        subCategory,
        paymentOption,
        rating,
     } = req.body;
      // Get the uploaded files from req.files and extract necessary information
     
    await productModel.updateOne({_id:oid},{
        productName:productName,
        brandName:brandName,
        description:description,
        points:points.split(","),
        productPrice:productPrice,
        salePrice:salePrice,
        stock:stock,
        category:category,
        subCategory:subCategory,
        paymentOption:paymentOption,
        rating:rating,
    })
    
    const productData = await fetch("http://127.0.0.1:2000/products");
    const products = await productData.json();
    res.render("adminProductView",{admin:true,user:false,products});
}
async function adminCtgryView(req,res){
    if(req.query.oid){
        let oid = req.query.oid;
        let ctgryData = await fetch("http://127.0.0.1:2000/products/categories")
        let ctgrys = await ctgryData.json();
        let ctgry = ctgrys.filter(item=>item._id==oid)[0];
        console.log(ctgry);
        res.render("adminCtgryUpdate",{admin:true,user:false,ctgry});
    }
    else if(req.query.unhide_oid){
        let oid = req.query.unhide_oid;
        await ctgryModel.updateOne({_id: oid},{
            isHide:false,
        });
        const ctgryData = await fetch("http://127.0.0.1:2000/products/categories");
        const ctgrys = await ctgryData.json();
        res.render("adminCtgryView",{admin:true,user:false,ctgrys});
         
    }
    else if(req.query.hide_oid){
        let oid = req.query.hide_oid;
        await ctgryModel.updateOne({_id: oid},{
            isHide:true,
        });
        const ctgryData = await fetch("http://127.0.0.1:2000/products/categories");
        const ctgrys = await ctgryData.json();
        res.render("adminCtgryView",{admin:true,user:false,ctgrys});
    }else{
        const ctgryData = await fetch("http://127.0.0.1:2000/products/categories");
        const ctgrys = await ctgryData.json();
        res.render("adminCtgryView",{admin:true,user:false,ctgrys});
    }
        
    
}


async function adminUserView(req,res){
    if(req.query.unBlock_oid){
        let oid = req.query.unBlock_oid;
        const user = await userModel.findOne({_id: oid});
        // Delete the associated files
        if (user && user.isBlocked) {
            const user = await userModel.updateOne({_id: oid},{isBlocked:false});
        }
        let userData = await fetch("http://127.0.0.1:2000/api/users");
        let users = await userData.json();
        res.render("adminUserView",{admin:true,user:false,users});
    }
    else if(req.query.block_oid){
        let oid = req.query.block_oid;
        const user = await userModel.findOne({_id: oid});
        // Delete the associated files
        if (user && !user.isBlocked) {
            const user = await userModel.updateOne({_id: oid},{isBlocked:true});
        }
        let userData = await fetch("http://127.0.0.1:2000/api/users");
        let users = await userData.json();
        res.render("adminUserView",{admin:true,user:false,users});
        
    }
   else{
    let userData = await fetch("http://127.0.0.1:2000/api/users");
    let users = await userData.json();
    res.render("adminUserView",{admin:true,user:false,users});
   }
}


async function addUser(req,res){
  console.log("entered add user")
    try{
      console.log("Im inside")
      let {
        userName,
        fName,
        lName,
        email,
        psswd,
        phoneNumber
      } = req.body
      console.log(req.body)
      let user = await userModel.create({
          userName:userName,
          fName:fName,
          lName:lName,
          email:email,
          psswd:CryptoJS.AES.encrypt(psswd,process.env.secret_p),
          phoneNumber:phoneNumber,
      });
      console.log("Usert details Generated");
      const token  = await Token.create({
        userId:user._id,
        token:crypto.randomBytes(32).toString('hex'),
      })
      // await Token.createIndexes({createdAt:1,expireAfterSeconds:30})
      Token.collection.getIndexes((err, indexes) => {
        if (err) {
          console.error(err);
        } else {
          console.log(indexes);
        }})
      console.log("Token Generated");
      const url = `${process.env.BASE_URL}/register/${user._id}/verify/${token.token}`;
      //Send Verification Temporary URL(controlled in DataBase using TTL) Via Email
      await sendMail(user.email,"Verify Email",`Click the link to get Verified ${url}`);
      // await sendEmail(user.email,"Verify Email",url);
      // console.log("Token Generated");
      // res.status(201).send({message:"An email sent to your Account! Please Verify!"})
         
        res.redirect(`/register/verify/${user.id}`);
      // res.render("userLogin",{admin:false,user:false}); 
    }catch(err){
      res.status(500).send({message:"Internal Server Error"})
      console.log(err)
    }
}

//When user clicks resend the token is generated again and sent to mail
async function resendMail(req,res){
  console.log("Entered Resend Mail")
  try{
    const token = await Token.findOne({ userId: req.body.userId });
  if (token) {
    // Token exists, update it
    token.token = crypto.randomBytes(32).toString('hex');
    await token.save();
    console.log("Token is created");
    console.log(token);
    const url = `${process.env.BASE_URL}/register/${user._id}/verify/${token.token}`;
    await sendMail(user.email,"Verify Email",`Click the link to get Verified ${url}`);
    res.json({sent:true});
  } else {
    // Token does not exist, send response
    return res.json({ sent: false });
  }   
    // await Token.createIndexes({createdAt:1,expireAfterSeconds:30})
     
     console.log(token);
    
    // await sendEmail(user.email,"Verify Email",url);
    // console.log("Token Generated");
     
      
    

    // res.render("userLogin",{admin:false,user:false}); 
  }catch(err){
    
    console.log(err)
  }
}

// async function verifyToken(req,res){
//   console.log("Entere the verify Token")
//   try{
//     const user  = await userModel.findOne({_id:req.params.id});
//     console.log(user);
//     if(!user) return res.status(400).send({message:"Invalid Link"});

//     const token = await Token.findOne({userId:user._id,token:req.params.token})
//     console.log(token);
//     if(!token) return res.status(400).send({message:"Invalid Link"});
//     await userModel.updateOne({ _id: user._id }, { verified: true })
//     console.log("User Verified in DB")
//     await Token.deleteOne({_id:token._id});
//     console.log("Token Removed")
//     res.redirect("/register/user-verified");
//   }catch(err){
//     res.status(500).send({message:"Internal Server Error"})
//   }
// }

async function verifyToken(req, res) {
  console.log("Enter the verify Token");
  try {
    const user = await userModel.findOne({ _id: req.params.id });
    console.log(user);
    if (!user) res.redirect("/");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    console.log(token);
    if (!token) res.redirect("/");

    // Check if the token has expired
    if (token.expiration < Date.now()) {
      return res.status(400).send({ message: "Verification link has expired" });
    }

    // Validate the token against the user
    if (token.userId.toString() !== user._id.toString()) {
      console.log("Invalid Link");
      res.redirect("/");
    }

    await userModel.updateOne({ _id: user._id }, { verified: true });
    console.log("User Verified in DB");
    await Token.deleteOne({ _id: token._id });
    console.log("Token Removed");
    res.render("emailVerified", { admin: false, user: false });
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
}


//userAddr Handle
async function handleAddr(req, res) {
  let userId = new ObjectId(jwt2.verify(req.params.tk, process.env.secretKeyU).user);
  console.log(userId);

  let {
    country,
    fName,
    lName,
    addr,
    city,
    state,
    pinCode,
    ph,
    aid
  } = req.body;

  let addressData = {
    userId: userId,
    country: country,
    fName: fName,
    lName: lName,
    addr: addr,
    city: city,
    state: state,
    pinCode: pinCode,
    ph: ph,
  };

  let user = await userModel.findOne({ _id: userId });

  if (aid) {
    // Update existing address
    let address = await addressModel.findByIdAndUpdate(aid, addressData, { new: true });

    // Update the address reference in the user collection
    let existingAddress = user.addresses.find((address) => address.addrId.toString() === aid);
    if (existingAddress) {
      existingAddress.addrId = address._id;
    } else {
      user.addresses.push({ addrId: address._id });
    }
  } else {
    // Create a new address
    let address = await addressModel.create(addressData);
    user.addresses.push({ addrId: address._id });
  }

  await user.save();

  console.log(user);
  res.json(200);
}


//users

async function userProductView(req, res) {
  let productsD = await fetch("http://127.0.0.1:2000/api/products");
  let productsInfo = await productsD.json();
  let products = productsInfo.products;
 
  //cookie extraction
  let cookieHeaderValue = req.headers.cookie;
  let token = null;

  if (cookieHeaderValue) {
    let cookies = cookieHeaderValue.split(";");

    for (let cookie of cookies) {
      let [cookieName, cookieValue] = cookie.trim().split("=");

      if (cookieName === "token") {
        token = cookieValue;
        break;
      }
    }
  }
  //cookie extraction

  if (token) {
    const secretKey = process.env.secretKeyU;

    try {
      const decodedToken = jwt2.verify(token, secretKey);
      const userId = decodedToken.user;

      res.render("userLandingPage", {
        admin: false,
        user: true,
        loggedIn: true,
        products,
      });
    } catch (error) {
      console.log(error);
      res.render("userLandingPage", {
        admin: false,
        user: true,
        loggedIn: false,
        products,
      });
    }
  } else {
    console.log("Cookie doesn't exist");
    res.render("userLandingPage", {
      admin: false,
      user: true,
      loggedIn: false,
      products,
    });
  }
}


async function userProductDescr(req,res){
  console.log("im inside Product Descrtiption Page *************************")
    if(req.query.oid){
        let qnty=1;
        // let productsD = await fetch("http:///127.0.0.1:2000/api/products");
        // let products = await productsD.json();
        let product = await productModel.findById(req.query.oid);
        product.photo.forEach(photo => {
          if (photo.filepath) {
            photo.filepath = photo.filepath.replace(/\\/g, "/");
          }
        })
        // products.products.forEach(obj => {
        //     if (obj.photo && Array.isArray(obj.photo)) {
        //       obj.photo.forEach(photo => {
        //         if (photo.filepath) {
        //           photo.filepath = photo.filepath.replace(/\\/g, "/");
        //         }
        //       });
        //     }
        //   });
        // let product = products.products.find(item=>item._id==req.query.oid) 
        let token = req.headers.cookie?.split("=")[1]
        // console.log(token);
        if(token){
          let  userId = new ObjectId(jwt2.verify(token,process.env.secretKeyU).user)
          console.log(userId);
          console.log(req.query.oid);
          const cart = await cartModel.aggregate([
            {
              $match: {
                userId: userId,
                items: { $elemMatch: { productId: new ObjectId(req.query.oid) } }
              }
            },
            {
              $project: {
                items: {
                  $filter: {
                    input: '$items',
                    as: 'item',
                    cond: { $eq: ['$$item.productId', new ObjectId(req.query.oid)] }
                  }
                }
              }
            }
          ]);
        if(cart.length>1){
          qnty = cart[0].items[0].quantity
          console.log(qnty);
        }  
        
        res.render("userProductDescr",{admin:false,user:true,product,qnty});
        }
        res.render("userProductDescr",{admin:false,user:true,product,qnty});
    }
    
}

function userCartView(req,res){
  //cookie extraction
  let cookieHeaderValue = req.headers.cookie;
  let token = null;
 console.log("im inside the CartView!")
  if (cookieHeaderValue) {
    let cookies = cookieHeaderValue.split(";");

    for (let cookie of cookies) {
      let [cookieName, cookieValue] = cookie.trim().split("=");

      if (cookieName === "token") {
        token = cookieValue;
        break;
      }
    }
  }
    //cookie extraction
  let id = jwt2.verify(token,process.env.secretKeyU).user 
  console.log("This is id of cart view ",id)
  res.render("userCart",{admin:false,user:true,id});
}
async function userOrderHistView(req,res){
  //cookie extraction
  let cookieHeaderValue = req.headers.cookie;
  let token = null;

  if (cookieHeaderValue) {
    let cookies = cookieHeaderValue.split(";");

    for (let cookie of cookies) {
      let [cookieName, cookieValue] = cookie.trim().split("=");

      if (cookieName === "token") {
        token = cookieValue;
        break;
      }
    }
  }
  //cookie extraction
  
  let  userId = jwt2.verify(token,process.env.secretKeyU).user;
    try{
      let orders = await orderModel.find({user:userId}).populate('user').sort({date:-1});
      res.render("userOrderHistory",{admin:false,user:true,orders});
    }catch(err){
      console.log("Error inside OrderHist Controller: ",err);
    }
 
}
function userWishlistView(req,res){
    res.render("userWishlist",{admin:false,user:true});
}
function userCheckout(req,res){
    res.render("userCheckout",{admin:false,user:true});
}

function userPymntView(req,res){
    res.render("userPymntOpt",{admin:false,user:true});
}
function userAddressView(req,res){
    const token = req.headers.cookie?.split("=")[1]; 
    let id = jwt2.verify(token,process.env.secretKeyU).user 
    res.render("userAddress",{admin:false,user:true,id});
}

async function prodCheckout(req,res){
  let {iid} = req.params;
  console.log(iid);
   //cookie extraction
   let cookieHeaderValue = req.headers.cookie;
   let token = null;
 
   if (cookieHeaderValue) {
     let cookies = cookieHeaderValue.split(";");
 
     for (let cookie of cookies) {
       let [cookieName, cookieValue] = cookie.trim().split("=");
 
       if (cookieName === "token") {
         token = cookieValue;
         break;
       }
     }
   }
   //cookie extraction

  try{
    console.log("im inside try of item in cart")
    let userId = jwt2.verify(token,process.env.secretKeyU).user
    let cart = await cartModel.findOne({userId:userId}).populate('items.productId');
    console.log(cart);
    console.log(cart.items)
    let item = cart.items.filter(val=>val._id.toString()==iid);
    let addr = await addressModel.findOne({ userId:userId, isShippingAddress: true })
    res.render("userCheckout",{admin:false,user:true,item,addr,iid})
  }catch(err){
    console.log(err);
    res.status(500).send("Internal Servor Error");
  }
}
async function cartCheckout(req,res){
   //cookie extraction
   let cookieHeaderValue = req.headers.cookie;
   let token = null;
 
   if (cookieHeaderValue) {
     let cookies = cookieHeaderValue.split(";");
 
     for (let cookie of cookies) {
       let [cookieName, cookieValue] = cookie.trim().split("=");
 
       if (cookieName === "token") {
         token = cookieValue;
         break;
       }
     }
   }
   //cookie extraction

  try{
    console.log("im inside try of item in cart")
    let userId = jwt2.verify(token,process.env.secretKeyU).user
    let cart = await cartModel.findOne({userId:userId}).populate('items.productId');
    let item = cart.items
    let cid = cart._id.toString();
    let addr = await addressModel.findOne({ userId:userId, isShippingAddress: true })
    if(item.length>=1){
      console.log("cart aint empty")
      res.render("userCheckout",{admin:false,user:true,item,addr,cid});
    }else{
      console.log("cart is empty")
      res.render("userCart",{admin:false,user:true,item,addr,cid,popped:true});
    }
  }catch(err){
    console.log(err);
    res.status(500).send("Internal Servor Error");
  }
}
async function cartPymntInit(req,res){
  let {idType,id} = req.params 
  //cookie extraction
   let cookieHeaderValue = req.headers.cookie;
   let token = null;
 
   if (cookieHeaderValue) {
     let cookies = cookieHeaderValue.split(";");
 
     for (let cookie of cookies) {
       let [cookieName, cookieValue] = cookie.trim().split("=");
 
       if (cookieName === "token") {
         token = cookieValue;
         break;
       }
     }
   }
   //cookie extraction

  try{
    let userId = jwt2.verify(token,process.env.secretKeyU).user
    let cart = await cartModel.findOne({userId:userId}).populate('items.productId');
    let addr = await addressModel.findOne({ userId:userId, isShippingAddress: true })
    let item;
    if(idType=="cid"){
      item = cart.items
      return res.render("userPymntOpt",{admin:false,user:true,item,addr,idType,id})
    }else{
      item = cart.items.filter(val=>val._id.toString()==id)
      return res.render("userPymntOpt",{admin:false,user:true,item,addr,idType,id})
    }
  }catch(err){
    console.log(err);
    res.status(500).send("Internal Servor Error");
  }
}


async function cartPay(req,res){
  //cookie extraction
  let cookieHeaderValue = req.headers.cookie;
  let token = null;

  if (cookieHeaderValue) {
    let cookies = cookieHeaderValue.split(";");

    for (let cookie of cookies) {
      let [cookieName, cookieValue] = cookie.trim().split("=");

      if (cookieName === "token") {
        token = cookieValue;
        break;
      }
    }
  }
  //cookie extraction
  try{
    let userId = jwt2.verify(token,process.env.secretKeyU).user;
    let addr = await addressModel.findOne({userId:userId,isShippingAddress:true});
    let {pymnt} = req.body;
    let {idType,id} = req.params;
    // res.json({"Pymnt":pymnt,"idType":idType,"id":id});
    if(pymnt=="cod"){
      if(idType=="cid"){
        let cart = await cartModel.findOne({_id:id}).populate('items.productId');
        let total = 0;
        let products = [];
        let qnty=0;
        const orderDate = new Date(); //The order Date
        const expectedDelivery = new Date();
        expectedDelivery.setDate(expectedDelivery.getDate()+4);///Adding 4 days to orderplaced date.
        //looping in the cartItems
        cart.items.forEach(item=>{
          total+=item.productId.salePrice*item.quantity;
          products.push({
            productId:item.productId._id,
            quantity:item.quantity,
            status:"orderPlaced",
            orderPlaced:orderDate, 
            expectedDelivery:expectedDelivery,
          });
          qnty+=item.quantity;
        })
        console.log(products);
        
        //adding it to  order collection
        let newOrder = await orderModel.create({
          date:orderDate,
          user:userId,
          address: {
            country:addr.country,
            fName:addr.fName,
            lName :addr.lName,
            addr: addr.addr,
            city: addr.city,
            state: addr.state,
            pinCode :addr.pinCode,
            ph:addr.ph,
          },
          products:[...products],
          paymentmode:pymnt,
          totalPrice:total,
          quantity:qnty,
        })
        async function reduceStock() {
          for (const item of cart.items) {
             await productModel.updateOne(
              {_id:item.productId._id},
              { $inc: { stock: -item.quantity } }
             )
          }
          await cartModel.deleteOne({_id:id});
        }
        reduceStock();
        res.json({"url":`/cart/order/${newOrder._id}`})

      }else if(idType=="iid"){
          
      }
    }else{
      let cart = await cartModel.findOne({_id:id}).populate('items.productId');
      let total=0;
      cart.items.forEach(item=>{
        total+=item.productId.salePrice*item.quantity;
      })
      let data = await genrateRazorPay(total*100);
      res.json({"order":data,"id":process.env.RAZOR_ID});
    }
  }catch(err){
    console.log("Err: ",err);
    res.status(500).json({"message":"Internal Servor error"})
  }
}

async function verifyPymnt(req,res){
  let {idType,id} = req.body
  //Tweaks needed for iid;
  //cookie extraction
  let cookieHeaderValue = req.headers.cookie;
  let token = null;

  if (cookieHeaderValue) {
    let cookies = cookieHeaderValue.split(";");

    for (let cookie of cookies) {
      let [cookieName, cookieValue] = cookie.trim().split("=");

      if (cookieName === "token") {
        token = cookieValue;
        break;
      }
    }
  }
  //cookie extraction
  let userId = jwt2.verify(token,process.env.secretKeyU).user;
  try{
   
    await verifyRazrPymnt(req.body);
    console.log("Its verified");
    let addr = await addressModel.findOne({userId:userId,isShippingAddress:true});
    let pymnt = 'online';
    let cart = await cartModel.findOne({_id:id}).populate('items.productId');
        let total = 0;
        let products = [];
        let qnty=0;
        const orderDate = new Date(); //The order Date
        const expectedDelivery = new Date();
        expectedDelivery.setDate(expectedDelivery.getDate()+4);///Adding 4 days to orderplaced date.
        //looping in the cartItems
        cart.items.forEach(item=>{
          total+=item.productId.salePrice*item.quantity;
          products.push({
            productId:item.productId._id,
            quantity:item.quantity,
            status:"orderPlaced",
            orderPlaced:orderDate, 
            expectedDelivery:expectedDelivery,
          });
          qnty+=item.quantity;
        })
        console.log(products);
        
        //adding it to  order collection
        let newOrder = await orderModel.create({
          date:orderDate,
          user:userId,
          address: {
            country:addr.country,
            fName:addr.fName,
            lName :addr.lName,
            addr: addr.addr,
            city: addr.city,
            state: addr.state,
            pinCode :addr.pinCode,
            ph:addr.ph,
          },
          products:[...products],
          paymentmode:pymnt,
          totalPrice:total,
          quantity:qnty,
        })
        async function reduceStock() {
          for (const item of cart.items) {
             await productModel.updateOne(
              {_id:item.productId._id},
              { $inc: { stock: -item.quantity } }
             )
          }
          await cartModel.deleteOne({_id:id});
        }
        reduceStock();
        res.json({"url":`/cart/order/${newOrder._id}`})
  }catch(err){
    console.log(err);
  }
}

async function orderInvoice(req,res){
  try{
    let {id} = req.params;
    let order = await orderModel.findOne({_id:id}).populate("products.productId");
    return res.render("userOrderInvoice",{admin:false,user:true,order})
  }catch(err){
    console.log("Err: ",err)
  }
}
async function adminOrderInvoice(req,res){
  try{
    let {id} = req.params;
    let order = await orderModel.findOne({_id:id}).populate("products.productId");
    return res.render("adminOrderInvoice",{admin:true,user:false,order})
  }catch(err){
    console.log("Err: ",err)
  }
}

async function modifyOrder(req,res){
  let  {orderId,productId,newStatus}= req.body;
   
  try{
    let orders  = await orderModel.findById(orderId);
    let product = orders.products.find(val=>val.productId==productId)
    let prod = await productModel.findById(productId);
    if(newStatus=="orderCancelled"){
      prod.stock+=product.quantity;
    }  
    await prod.save();
    product.status = newStatus;
    product[orderStatus] = new Date();
    await orders.save();
    res.json({"sent":true})
     
  }catch(err){
    console.log(err);
  }
}
async function orderStatus(req,res){
  let {id} = req.params;
  try{
    let order = await orderModel.findOne({_id:new ObjectId(id)}).populate("products.productId"  );
     
    res.json({"products":order.products,"oid":order._id,"valid":true})
  }catch(err){
    console.log("Order Status error: ",err)
    res.json({"products":null,"valid":false})

  }
}

async function orderCancel(req,res){
  let {oid,pid} = req.body;
  try{
    let orders  = await orderModel.findById(oid);
    let product = orders.products.find(val=>val.productId==pid)
    let prod = await productModel.findById(pid);
    
    console.log(product,product.quantity);
    prod.stock+=product.quantity;
    await prod.save();
    product.status = "orderCancelled";
    product.orderCancelled = new Date();
    await orders.save();
    res.json({"sent":true})
  }catch(err){
    console.log("Error in order cancel controller: ",err);
    res.json({"sent":false})
  }
}

//api
async function getProducts(req,res){
     
    try {
        const priceThreshold = 30;
        let sort = req.query.sort || "createdAt,-1";
        let category = req.query.cat || "";
        let subCategory = req.query.subCat|| "";
        const priceAmount = parseFloat(req.query.s)||null;
       
        // Filter options
        const filter = {};
        if (category !== "") {
          filter.category = category;
        }
        if (subCategory !== "") {
          filter.subCategory = subCategory;
        }
        const search = req.query.s || "";
        const total = await productModel.countDocuments({
            $or: [
                { productName: { $regex: search, $options: "i" } },
                { brandName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { points: { $elemMatch: { $regex: search, $options: "i" } } },
                {
                    salePrice: {
                      $gte: priceAmount - priceThreshold,
                      $lte: priceAmount + priceThreshold,
                    }
                }
                // Add more fields to search here
              ],
          ...filter
        })
          
        const categories  = await productModel.find()
        const cat =  [...new Set(categories.map(cat=>cat.category))];''
        const limit = !isNaN(parseInt(req.query.l)) && parseInt(req.query.l) <= 3
        ? parseInt(req.query.l)||3
        : 3;
        const page = !isNaN(parseInt(req.query.p)) && parseInt(req.query.p) >= 0 && parseInt(req.query.p) <= Math.ceil(total/limit)    
        ? parseInt(req.query.p)-1||0
        :0;
          
        // Sort options
        const sortOptions = sort.split(",");
        const sortBy = {};
        if (sortOptions.length === 2) {
          sortBy[sortOptions[0]] = parseInt(sortOptions[1]);
        } else {
          sortBy[sortOptions[0]] = 1;
        }
      
        
        

        // Query for product collection
        const products = await productModel.find({
          $and: [
            {
              $or: [
                { productName: { $regex: search, $options: "i" } },
                { brandName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { points: { $elemMatch: { $regex: search, $options: "i" } } },
                {
                  salePrice: {
                    $gte: priceAmount - priceThreshold,
                    $lte: priceAmount + priceThreshold,
                  },
                },
                // Add more fields to search here
              ],
            },
            { isHidden: false }, // Add condition to filter by isHidden field
            { ...filter },
          ],
        })
          .populate("category", "name") // Populate the "category" field and retrieve only the "name" property
          .populate("subCategory", "name") // Populate the "subCategory" field and retrieve only the "name" property
          .sort(sortBy)
          .skip(page * limit)
          .limit(limit);
          
        
      
        const response = {
          error: false,
          total,
          page: page + 1,
          limit,
          categories:cat,
          products
        };
        
        res.status(200).json(response);
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
      }
      
    
}

async function updateProductsApi(req, res) {
    try {
      const {
        productName,
        brandName,
        description,
        points,
        productPrice,
        salePrice,
        stock,
        category,
        subCategory,
        paymentOption,
        rating,
      } = req.body;
  
      const updatedProduct = {
        productName,
        brandName,
        description,
        points: points.split(","),
        productPrice,
        salePrice,
        stock,
        category,
        subCategory,
        paymentOption,
        rating,
      };
  
      await productModel.updateOne({ _id: req.params.id }, updatedProduct);
      console.log("Product modified successfully");
  
      res.sendStatus(200);
    } catch (error) {
      console.error("Error:", error);
      res.sendStatus(500);
    }
  }
  

async function getUsers(req,res){
    try {
         
        let sort = req.query.sort || "userName";
        const search = req.query.s || "";
        const total = await userModel.countDocuments({
            $or: [
                { userName: { $regex: search, $options: "i" } },
                { fName: { $regex: search, $options: "i" } },
                { lName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                // Add more fields to search here
              ]
        })
          
        const limit = !isNaN(parseInt(req.query.l)) && parseInt(req.query.l) <= 3
        ? parseInt(req.query.l)||3
        : "";
        const page = !isNaN(parseInt(req.query.p)) && parseInt(req.query.p) >= 0 && parseInt(req.query.p) <= Math.ceil(total/limit)    
        ? parseInt(req.query.p)-1||0
        :0;
          
        // Sort options
        const sortOptions = sort.split(",");
        const sortBy = {};
        if (sortOptions.length === 2) {
          sortBy[sortOptions[0]] = parseInt(sortOptions[1]);
        } else {
          sortBy[sortOptions[0]] = 1;
        }
        // Query for product collection
        const users = await userModel.find({
            $or: [
                { userName: { $regex: search, $options: "i" } },
                { fName: { $regex: search, $options: "i" } },
                { lName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                // Add more fields to search here
              ]
                // Add more fields to search here
        })
          .sort(sortBy)
          .skip(page * limit)
          .limit(limit);
        const response = {
          error: false,
          total,
          page: page + 1,
          limit,
          users
        };
        
        res.status(200).json(response);
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
      }
}
async function getUsersV2(req,res){
    try {
         
        let sort = req.query.sort || "userName";
        const search = req.query.s || "";
        const total = await userModel.countDocuments({
            $or: [
                { userName: { $regex: search, $options: "i" } },
                { fName: { $regex: search, $options: "i" } },
                { lName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                // Add more fields to search here
              ]
        })
          
        const limit = !isNaN(parseInt(req.query.l)) && parseInt(req.query.l) <= 3
        ? parseInt(req.query.l)||3
        : "3";
        const page = !isNaN(parseInt(req.query.p)) && parseInt(req.query.p) >= 0 && parseInt(req.query.p) <= Math.ceil(total/limit)    
        ? parseInt(req.query.p)-1||0
        :0;
          
        // Sort options
        const sortOptions = sort.split(",");
        const sortBy = {};
        if (sortOptions.length === 2) {
          sortBy[sortOptions[0]] = parseInt(sortOptions[1]);
        } else {
          sortBy[sortOptions[0]] = 1;
        }
        // Query for product collection
        const users = await userModel.find({
            $or: [
                { userName: { $regex: search, $options: "i" } },
                { fName: { $regex: search, $options: "i" } },
                { lName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                // Add more fields to search here
              ]
                // Add more fields to search here
        })
          .sort(sortBy)
          .skip(page * limit)
          .limit(limit);
        const response = {
          error: false,
          total,
          page: page + 1,
          limit,
          users
        };
        
        res.status(200).json(response);
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
      }
}

async function getUserDetails(req,res){
  let {tk} = req.params;
  let id = jwt2.verify(tk,process.env.secretKeyU).user;
  try{
    let user  = await userModel.findById(id);
    res.json(user);
  }catch(err){
    console.log("Error in getUserDetails controller : ",err);
  }
}
async function updateUserDetails(req,res){
  let {tk} = req.params;
  let {fName,lName,ph} = req.body;
  let id = jwt2.verify(tk,process.env.secretKeyU).user;
  
  try{
    let user  = await userModel.findById(id);
     
    user.fName = fName;
    user.lName = lName;
    user.phoneNumber = ph;
    await user.save();
    res.json({"updated":true})
  }catch(err){
    console.log("Error in getUserDetails controller : ",err);
  }
}

async function getOrdersV2(req, res) {
  try {
    let sort = req.query.sort || "-date"; // Sort by descending order of date by default
    const search = req.query.s || "";
    const total = await orderModel.countDocuments({
      $or: [
        { "user.userName": { $regex: search, $options: "i" } },
        { "address.fName": { $regex: search, $options: "i" } },
        { "address.lName": { $regex: search, $options: "i" } },
        { "address.email": { $regex: search, $options: "i" } },
        // Add more fields to search here
      ],
    });

    const limit =
      !isNaN(parseInt(req.query.l)) && parseInt(req.query.l) <= 3
        ? parseInt(req.query.l) || 3
        : 3;
    const page =
      !isNaN(parseInt(req.query.p)) &&
      parseInt(req.query.p) >= 0 &&
      parseInt(req.query.p) <= Math.ceil(total / limit)
        ? parseInt(req.query.p) - 1 || 0
        : 0;

    // Sort options
    const sortOptions = sort.split(",");
    const sortBy = {};
    if (sortOptions.length === 2) {
      sortBy[sortOptions[0]] = parseInt(sortOptions[1]);
    } else {
      sortBy[sortOptions[0]] = -1; // Sort by descending order by default
    }

    // Query for order collection
    const orders = await orderModel
      .find({
        $or: [
          { "user.userName": { $regex: search, $options: "i" } },
          { "user.fName": { $regex: search, $options: "i" } },
          { "user.lName": { $regex: search, $options: "i" } },
          { "address.fName": { $regex: search, $options: "i" } },
          { "address.lName": { $regex: search, $options: "i" } },
          // Add more fields to search here
        ],
      })
      .populate({
        path: "user",
        model: userModel, // Use the userModel variable for population
        select: "userName fName lName", // Only populate the userName field of the user
      })
      .populate({
        path:"products.productId",
        model:productModel,
      })
      .select("-products") // Exclude the products field from the query result
      .sort(sortBy)
      .skip(page * limit)
      .limit(limit);

    const response = {
      error: false,
      total,
      page: page + 1,
      limit,
      orders,
    };

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal order Server Error" });
  }
}

async function getSpecificOrder(req,res){
  let {oid}  = req.params;
  try{
    let order = await orderModel.findById(oid).populate('products.productId');
    res.json(order);
  }catch(err){
    console.log("Error in getSpecific Order: ",err);
  }
}



async function getUserAddress(req,res){
  const userId = new ObjectId(req.params.id);
  try {
    // Find the user by userId and populate the addresses
    const user = await userModel.findById(userId).populate("addresses.addrId");
    console.log(user);
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    // const { addresses } = user;
    const total = user.addresses.length;
    const page = 0; // Assuming page 0 for simplicity
    const limit = user.addresses.length; // Assuming all addresses are returned in a single page
  //  console.log(user.addresses)
    const response = {
      error: false,
      total,
      page: page + 1,
      limit,
      addresses:user.addresses, //was getting [ [ new ObjectId("6489420ea4dff93081e802bd") ] ] instead of [ new ObjectId("6489420ea4dff93081e802bd") ] 
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
}
// async function getCart(req,res){
//   try {
//     const userId = req.params.id; // Extract the user ID from the request query

//     // Fetch the cart document for the given user ID
//     const cart = await cartModel.findOne({userId}) 
//     let total = 0;
//     cart.items.forEach(c=>total+=c.salePrice*c.quantity);
//     if (!cart) {
//       return res.status(404).json({ error: true, message: 'Cart not found' });
//     }

//     const response = {
//       error: false,
//       total: cart.items.length,
//       totalPrice:total,
//       page: 1,
//       limit: cart.items.length,
//       products: cart.items
//     };

//     res.status(200).json(response);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: true, message: 'Internal Server Error' });
//   }
// }

async function getCart(req, res) {
  try {
    const userId = new ObjectId(req.params.id); // Extract the user ID from the request query

    // Fetch the cart document for the given user ID
    const cart = await cartModel.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return res.status(404).json({ error: true, message: 'Cart not found' });
    }

    let total = 0;
    cart.items.forEach((item) => {
      if (item.productId) {
        item.price = item.quantity * item.productId.salePrice;
        total += item.price;
      }
    });

    const response = {
      error: false,
      total: cart.items.length,
      totalPrice: total,
      page: 1,
      limit: cart.items.length,
      products: cart.items
    };

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
}

// ********** Time Consuming Code ************ the next code solves this issue og slowness
// async function addToCart(req,res){
//   let id =  new ObjectId(req.query.prId);
//   console.log(id);
//   let product = await productModel.findOne({_id:id});
//   // console.log("product: ",product)
//   let token = req.query.tk;
//   console.log("token: ",token)
//   if(token){
//     let userId = new ObjectId(jwt2.verify(token,process.env.secretKeyU).user);
//     let cart = await cartModel.findOne({userId:userId});
//     if(!cart){
//       console.log("cart exists")
//       if(product){
//         console.log("product exists in product collection")
//         await cartModel.create({
//           userId:userId,
//           items:[
//             {
//               productId:id,
//               productName:product.productName,
//               brandName:product.brandName,
//               description:product.decription,
//               productPrice:product.productPrice,
//               salePrice:product.salePrice,
//               stock:product.stock,
//               category:product.category,
//               subCategory:product.subCategory,
//               paymentOption:product.paymentOption,
//               rating:product.rating,
//               quantity:1,
//             }
//           ]
//         })
//         console.log("added to cart")
//       }
//     }else{
//       console.log("Cart Exits with such Product")
//       try {
//         const existingCart = await cartModel.findOneAndUpdate(
//           { _id: cart._id, 'items.productId': id },
//           { $inc: { 'items.$.quantity': 1 } },
//           { new: true }
//         );
    
//         if(!existingCart){
//           console.log("inSide else of cart existence but no such product .")
//           const updatedCart = await cartModel.findByIdAndUpdate(
//             cart._id,
//             { $push: { items: { 
//               productId:id,
//               productName:product.productName,
//               brandName:product.brandName,
//               description:product.decription,
//               productPrice:product.productPrice,
//               salePrice:product.salePrice,
//               stock:product.stock,
//               category:product.category,
//               subCategory:product.subCategory,
//               paymentOption:product.paymentOption,
//               rating:product.rating,
//               quantity:1,
//              } } }
             
//           );
    
//           // Product ID not found, push the whole product to the cart
//           // console.log('Product added to cart:', updatedCart);
//         }
//       } catch (error) {
//         console.error('Error adding product to cart:', error);
//       }
    
//     }
//   }else{
//       res.json({redirect:"/login"});
//   }

// }


// 

//Faster Code then Before 
async function addToCart(req, res) {
  const productId = new ObjectId(req.query.prId);
  const token = req.query.tk;
  
  if (token) {
    const userId = new ObjectId(jwt2.verify(token, process.env.secretKeyU).user);
    let cart = await cartModel.findOne({ userId });
    
    if (!cart) {
      // Cart doesn't exist, create a new cart and add the product
      const product = await productModel.findOne({ _id: productId });
      
      if (product) {
        await cartModel.create({
          userId,
          items: [{
            productId,
            quantity: 1,
          }],
        });
      }
      
      res.json({ message: 'Product added to cart' });
    } else {
      // Cart exists, perform updates in bulk
      const existingCartItem = cart.items.find(item => item.productId.equals(productId));
      
      if (existingCartItem) {
        // Product already exists in the cart, increase the quantity
        existingCartItem.quantity += 1;
      } else {
        // Product doesn't exist in the cart, add the product
        const product = await productModel.findOne({ _id: productId });
        
        if (product) {
          cart.items.push({
            productId,
            quantity: 1,
          });
        }
      }
      await cart.save();
      res.json({ message: 'Product added to cart' });
    }
  } else {
    res.json({ redirect: '/login' });
  }
}


async function dogFoodView(req,res){
    let { cat, sub } = req.query;
    let productsD = await fetch("http:127.0.0.1:2000/products");
    let products = await productsD.json();
    products = products.filter(item=>item.category==cat && item.subCategory==sub)
    res.render("dogFood",{user:true,admin:false,products})
}


export {
    adminLogin,
    adminVerify,
    productAdd,
    ctgryAdd,
    ctgryUpdate,
    adminProductView,
    adminCtgryView,
    getProducts,
    adminProductUpdate,
    getUsers,
    addUser,
    adminUserView,
    userProductView,
    userProductDescr,
    dogFoodView,
    userCartView,
    userOrderHistView,
    userWishlistView,
    userCheckout,
    userPymntView,
    userAddressView,
    updateProductsApi,
    getCart,
    addToCart,
    handleAddr,
    getUserAddress,
    resendMail,
    verifyToken,
    cartCheckout,
    prodCheckout,
    cartPymntInit,
    cartPay,
    orderInvoice,
    orderStatus,
    getUsersV2,
    getOrdersV2,
    adminOrderInvoice,
    orderCancel,
    getSpecificOrder,
    modifyOrder,
    getUserDetails,
    updateUserDetails,
    verifyPymnt
};

 