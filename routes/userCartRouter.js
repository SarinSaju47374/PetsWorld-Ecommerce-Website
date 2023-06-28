import express from "express";
import {userCartView,prodCheckout,cartCheckout,cartPymntInit,cartPay,orderInvoice,orderStatus,orderCancel,verifyPymnt} from "../controllers/controllers.js";
import jwt2 from "jsonwebtoken";
const router = express.Router();

router.get("/",userCartView);
router.post("/")
router.get("/checkout/item/:iid",prodCheckout);
router.get("/checkout",cartCheckout);
router.get("/pymnt/:idType/:id",cartPymntInit)
router.post("/pymnt/chkout/:idType/:id",cartPay)
router.post("/pymnt/verify",verifyPymnt)
router.get("/order/:id",orderInvoice);
router.get("/order/real-time/:id",orderStatus);
router.post("/order/cancel",orderCancel);
export default router;