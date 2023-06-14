import express from "express";
import {userCartView} from "../controllers/controllers.js";
import jwt2 from "jsonwebtoken";
const router = express.Router();

router.get("/",userCartView);
router.post("/")

export default router;