import express from "express";
import {userCartView,prodCheckout,cartCheckout,cartPymntInit,cartPay,orderInvoice} from "../controllers/controllers.js";
import jwt2 from "jsonwebtoken";
const router = express.Router();

router.get("/",userCartView);
router.post("/")
router.get("/checkout/item/:iid",prodCheckout);
router.get("/checkout",cartCheckout);
router.get("/pymnt/:idType/:id",cartPymntInit)
router.post("/pymnt/:idType/:id",cartPay)
router.get("/order/:id",orderInvoice);
export default router;