import express from "express";
import {userProductView} from "../controllers/controllers.js";
import userModel from "../models/userModel.js";
import { addressModel } from "../models/productModel.js";
import jwt2 from "jsonwebtoken";
const router = express.Router();

router.get("/",async (req,res)=>{
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
    let id  = jwt2.verify(token,process.env.secretKeyU).user;
    try{
        let user  = await userModel.findById(id);
        let addr = await addressModel.findOne({userId:id,isShippingAddress:true});
        res.render("userProfile",{admin:false,user:true,user,addr});
    }catch(err){
        console.log(err);
        res.status(500).json({"message":"Internal server Error"});
    }
    
});

export default router;