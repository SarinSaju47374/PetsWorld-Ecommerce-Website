import express from "express";
import {addUser} from "../controllers/controllers.js"
const router = express.Router();

router.get("/",(req,res)=>{
    res.render("userRegister");
})
router.post("/",addUser);

 




export default router;
