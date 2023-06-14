import express from "express";
import {getUsers,getUserAddress} from "../controllers/controllers.js"
import userModel from "../models/userModel.js";
const router = express.Router();

router.get("/users",getUsers);
router.get("/users/:id",getUserAddress);
router.put("/users",async(req,res)=>{
    try{
        await userModel.updateOne({phoneNumber:req.body.number},{otp:req.body.otp});
    }catch(error){
        console.log(error);
    }    
})

export default router;