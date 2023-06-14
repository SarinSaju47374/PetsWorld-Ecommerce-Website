import {ctgryModel, productModel,cartModel,addressModel} from "../models/productModel.js"
import userModel from "../models/userModel.js"
import adminModel from "../models/adminModel.js"
import fs from  "fs";
import path from "path";
import jwt2 from "jsonwebtoken";
import CryptoJS from "crypto-js"
import mongoose from "mongoose";
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
function ctgryAdd(req,res){
    res.render("adminCtgryAdd",{admin:true,user:false});
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
        
    else if(req.query.delete_oid){
        let oid = req.query.delete_oid;
        const product = await productModel.deleteOne({_id: oid});
        // Delete the associated files
        if (product && product.photo && product.photo.length > 0) {
            product.photo.forEach(photo => {
            console.log(path.join(__dirname,"views",`${photo.filePath}.png`));
            const filePath = path.join(__dirname,"..","views",`${photo.filepath}.png`);
            fs.unlink(filePath, (err) => {
                if (err) {
                console.error(`Error deleting file ${filePath}: ${err}`);
                } else {
                console.log(`File ${filePath} deleted successfully`);
                }
            });
            });
        }

        await productModel.deleteOne({_id:oid});
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
    let {
        userName,
        fName,
        lName,
        email,
        psswd,
        phoneNumber
    } = req.body
    await userModel.create({
        userName:userName,
        fName:fName,
        lName:lName,
        email:email,
        psswd:CryptoJS.AES.encrypt(psswd,process.env.secret_p),
        phoneNumber:phoneNumber,
    });
    res.render("userLogin",{admin:false,user:false});  
}



//userAddr Handle
async function handleAddr(req,res){
  let userId = new ObjectId(jwt2.verify(req.params.tk,process.env.secretKeyU).user);
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
  } =  req.body;
 let data = await addressModel.create({
  userId:userId,
  country:country,
  fName:fName,
  lName:lName,
  addr:addr,
  city:city,
  state:state,
  pinCode:pinCode,
  ph:ph,
 })
 await userModel.findByIdAndUpdate(userId, { $push: { addresses: data._id } });
 console.log(data);
  res.json(200);
}

//users

async function userProductView(req,res){
    let productsD = await fetch("http://127.0.0.1:2000/api/products");
    let productsInfo  = await productsD.json();
    let products = productsInfo.products; 
    let token = req.headers.cookie?.split("=")[1];
    // console.log(req.cookies.token);
    // res.render("userLandingPage",{admin:false,user:true,loggedIn:true});
    if (req.headers.cookie && token) {
         
        // Proceed with decoding the token
        const secretKey = process.env.secretKeyU;
        try {
        //decoding token
        const decodedToken = jwt2.verify(token, secretKey);
        const userId = decodedToken.user;
        // console.log(userId);
        res.render("userLandingPage",{admin:false,user:true,loggedIn:true,products});
        // Proceed with extracting the user name from the decoded token
        } catch (error) {
            console.log(error)
        }
        
      } else {
        console.log("Cookie doesnt exist")
        // Cookie doesn't exist, handle accordingly
        res.render("userLandingPage",{admin:false,user:true,loggedIn:false,products});
      } 
}

async function userProductDescr(req,res){
    if(req.query.oid){
        let productsD = await fetch("http:///127.0.0.1:2000/api/products");
        let products = await productsD.json();
         
        products.products.forEach(obj => {
            if (obj.photo && Array.isArray(obj.photo)) {
              obj.photo.forEach(photo => {
                if (photo.filepath) {
                  photo.filepath = photo.filepath.replace(/\\/g, "/");
                }
              });
            }
          });
        let product = products.products.find(item=>item._id==req.query.oid) 
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
          
        let qnty = cart[0].items[0].quantity
        // console.log(qnty);
        res.render("userProductDescr",{admin:false,user:true,product,qnty});
        }
        
    }
    
}

function userCartView(req,res){
  const token = req.headers.cookie?.split("=")[1]; 
  let id = jwt2.verify(token,process.env.secretKeyU).user 
  res.render("userCart",{admin:false,user:true,id});
}
function userOrderHistView(req,res){
    res.render("userOrderHistory",{admin:false,user:true});
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
    res.render("userAddress",{admin:false,user:true});
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

async function getUserAddress(req,res){
  const userId = req.params.userId;

  try {
    // Find the user by userId and populate the addresses
    const user = await userModel.findById(userId).populate('addresses');

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    const { addresses } = user;
    const total = addresses.length;
    const page = 0; // Assuming page 0 for simplicity
    const limit = addresses.length; // Assuming all addresses are returned in a single page

    const response = {
      error: false,
      total,
      page: page + 1,
      limit,
      addresses,
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

async function getCart(req,res){
  try {
    const userId = req.params.id; // Extract the user ID from the request query

    // Fetch the cart document for the given user ID
    const cart = await cartModel.findOne({ userId }).populate('items.productId');

    let total = 0;
    cart.items.forEach(c=>total+=c.productId.salePrice*c.quantity);
    if (!cart) {
      return res.status(404).json({ error: true, message: 'Cart not found' });
    }

    const response = {
      error: false,
      total: cart.items.length,
      totalPrice:total,
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
    getUserAddress
};

 