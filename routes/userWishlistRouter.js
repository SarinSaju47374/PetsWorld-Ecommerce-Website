import express from "express";
import {userWishlistView} from "../controllers/controllers.js";
import jwt2 from "jsonwebtoken";
const router = express.Router();

router.get("/",userWishlistView);

export default router;