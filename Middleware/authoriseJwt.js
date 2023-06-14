let jwt = require("jsonwebtoken");

//User Verification Middleware
const authoriseJwt = (req,res,next)=>{
    let token = req.headers.cookie?.split("=")[1];
    if(token){
         jwt.verify(token,process.env.secretKeyU,(err,user)=>{
            if(err){
                res.render("403Error")
            }else{
                next();
            }
        })
         
    }else{
        res.redirect("/login");
        
    }
}

module.exports = authoriseJwt;