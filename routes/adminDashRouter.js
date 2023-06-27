import express from "express";
import {} from "../controllers/controllers.js";

const router = express.Router();

router.get("/dashboard",(req,res)=>{
    res.render("adminDashboard",{admin:true,user:false});
});
 
// router.post("/",adminProductUpdate);

export default router;