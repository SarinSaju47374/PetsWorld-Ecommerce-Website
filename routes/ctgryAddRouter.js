import express from "express";
import {ctgryAdd} from "../controllers/controllers.js";
import multer from "multer";
import { subCtgryModel,ctgryModel } from "../models/productModel.js";
import fs from "fs";

const router = express.Router();
 
router.get("/",ctgryAdd);
router.use(express.json());

const upload = multer({ dest: 'views/categories' });

router.post("/subCtgry", upload.single('photo'), async (req, res) => {
  const {subCtgry,ctgryId} = req.body;

  // Get the uploaded file from req.file and extract necessary information
  const file = req.file;
  
  if (file) {
    const oldPath = file.path;
    const newPath = `${file.path}.png`;

    if (fs.existsSync(oldPath)) {
      fs.rename(oldPath, newPath, function(err) {
        if (err) throw err;
        console.log('File renamed successfully');
      });
    } else {
      console.log('File does not exist at the old path:', oldPath);
    }
  
    const photo = JSON.stringify({
        title: file.originalname,
        filepath: newPath.replace(/views/gi,""),
      });

    if(!ctgryId) res.json({"success":false})
    await subCtgryModel.create({
        name:subCtgry.toUpperCase().trim(),
        category:ctgryId,
        photo,
    });
    console.log("Successfully added product to the database");
    res.json({"success":true});
  } else {
    console.log("No photo uploaded");
    res.status(400).send("No photo uploaded");
  }
});
router.post("/ctgry", async (req, res) => {
    const {ctgry} = req.body;
    console.log(req.body);
    try{
        await ctgryModel.create({
            name:ctgry.toUpperCase().trim(),
        });
        console.log("Successfully added product to the database");
        res.json({"success":true});
    }catch(err){
        console.log(err);
    }
});


router.get("/fetch",async (req,res)=>{
  let ctgrys = await ctgryModel.find();
  res.json(ctgrys);
})
router.get("/fetch/:id",async (req,res)=>{
   let {id} = req.params;
   let subCtgrys = await subCtgryModel.find({category:id})
   res.json(subCtgrys);
})
export default router;
