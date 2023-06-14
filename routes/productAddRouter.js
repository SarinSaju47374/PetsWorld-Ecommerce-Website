import express from "express";
import {productAdd} from "../controllers/controllers.js";
import multer from "multer";
import { productModel } from "../models/productModel.js";
import fs from "fs";


const router = express.Router();

router.get("/",productAdd);
router.use(express.json());router.use(express.json());

const upload = multer({ dest: 'views/uploads' });
router.post("/",upload.array('photos'),async(req,res)=>{
     const{
        productName,
        brandName,
        description,
        points,
        productPrice,
        salePrice,
        stock,
        category,
        subCategory,
        paymentOption,
        rating,
     } = req.body;
     console.log(req.body)
     
    
    //  // Get the uploaded files from req.files and extract necessary information
    // const photos = req.files.map((file) => {
    //     const oldPath = `${file.path}`;
    //     const newPath = `${file.path}.png`;
    //     fs.rename(oldPath, newPath, function(err) {
    //         if (err) throw err;
    //         console.log('File renamed successfully');  
    //     });
    //     return {
    //         title: file.originalname,
    //         filepath: file.path.replace(/views/gi,""),
    //     };
    // });

     // Get the uploaded files from req.files and extract necessary information
     const photos = req.files.map((file) => {
        const oldPath = `${file.path}`;
        const newPath = `${file.path}.png`;
        
        if (fs.existsSync(oldPath)) {
          fs.rename(oldPath, newPath, function(err) {
            if (err) throw err;
            console.log('File renamed successfully');
          });
        } else {
          console.log('File does not exist at the old path:', oldPath);
        }
      
        return {
          title: file.originalname,
          filepath: file.path.replace(/views/gi,""),
        };
      });
    await productModel.create({
        productName:productName,
        brandName:brandName,
        description:description,
        points:points.split(","),
        productPrice:productPrice,
        salePrice:salePrice,
        stock:stock,
        category:category,
        subCategory:subCategory,
        paymentOption:paymentOption,
        rating:rating,
        photo:photos
    })
    console.log("Successfully product added to data base")
    res.send("Sucess");
})

export default router;