import express from "express";
import {couponModel} from "../models/productModel.js";

const router = express.Router();
 
router.get("/coupon-admin",(req,res)=>{
    res.render("adminCoupons",{admin:true,user:false})
})
router.post("/coupon-admin",async(req,res)=>{
    let {
        coupon,
        discount,
        minPrice,
    } = req.body
    try{
        let couponData = await couponModel.create({
            coupon:coupon.toUpperCase(),
            discount:discount,
            minPrice:minPrice,
        })
        res.json(couponData);
    }catch(err){
        console.log("The error inside the POST of coupon-admin",err)
    }
})
router.get("/coupons-data",async(req,res)=>{
  
    try{
        let couponData = await couponModel.find();
        console.log(couponData);
        res.json(couponData);
    }catch(err){
        console.log("The error inside the POST of coupon-admin",err)
    }
})
export default router;
