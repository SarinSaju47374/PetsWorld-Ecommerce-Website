import express from "express";
import {ctgryAdd} from "../controllers/controllers.js";
import multer from "multer";
import { ctgryModel } from "../models/productModel.js";
import fs from "fs";


const router = express.Router();

router.get("/",ctgryAdd);

router.use(express.json());
 
const upload = multer({ dest: 'views/uploads' });

router.post("/",upload.array('photos'),async(req,res)=>{
     const{
        ctgryName,
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
     const photo = req.files.map((file) => {
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
      })[0];

    await ctgryModel.create({
        ctgryName:ctgryName,
        photo:photo,
    })
    console.log("Successfully category added to data base")
    res.render("adminCtgryAdd",{admin:true,user:false});
})

export default router;