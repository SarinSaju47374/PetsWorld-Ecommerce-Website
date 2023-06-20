import express from "express";
import {userCartView,prodCheckout,cartCheckout,cartPymntInit,cartPay} from "../controllers/controllers.js";
import jwt2 from "jsonwebtoken";
const router = express.Router();

router.get("/",userCartView);
router.post("/")
router.get("/checkout/item/:iid",prodCheckout);
router.get("/checkout",cartCheckout);
router.get("/pymnt/:idType/:id",cartPymntInit)
router.post("/pymnt/:idType/:id",cartPay)

export default router;