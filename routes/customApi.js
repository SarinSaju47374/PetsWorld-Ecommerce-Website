import express from "express";
import { getUsersV2,getOrdersV2,getSpecificOrder,modifyOrder,getCategories} from "../controllers/controllers.js" 
const router = express.Router();
 
 

router.get("/users",getUsersV2);
router.get("/orders",getOrdersV2);
router.get("/orders/:oid",getSpecificOrder)
router.get("/categories",getCategories)
// router.get("/subCategories/:cid",getSubCategories)
router.post("/orders",modifyOrder);
export default router;