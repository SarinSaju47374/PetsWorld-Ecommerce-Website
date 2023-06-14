import jwt2 from "jsonwebtoken"
;

//Admin Verification Middleware
const authoriseAdminJwt = (req,res,next)=>{
    let token = req.headers.cookie?.split("=")[1];
    if(token){
         jwt2.verify(token,process.env.secretKeyA,(err,user)=>{
            if(err){
                res.render("403Error")
            }else{
                next();
            }
        })
         
    }else{
        res.redirect("/admin")
         
    }
}
export default authoriseAdminJwt;