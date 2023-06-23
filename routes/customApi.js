import express from "express";
import { getUsersV2,getOrdersV2} from "../controllers/controllers.js" 
const router = express.Router();
 
 

router.get("/users",getUsersV2);
router.get("/orders",getOrdersV2);
export default router;