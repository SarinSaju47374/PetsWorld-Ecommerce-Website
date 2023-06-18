import nodemailer from "nodemailer";

export default async(email,subject,text,res)=>{
    try{
        const transporter = nodemailer.createTransport({
            host:process.env.HOST,
            service:process.env.SERVICE,
            port:Number(process.env.EMAIL_PORT),
            secure:Boolean(process.env.SECURE),
            auth:{
                user:process.env.USER,
                pass:process.env.PASS,
            }
        });
        const options = {
            from:process.env.USER,
            to:email,
            subject:subject,
            text:text,
        }
        transporter.sendMail(options,(err,info)=>{
            if(err){
                console.log("Email not sent");
                res.status(400).send({message:"Email Not Sent"})
                console.log(err);
            }else{
                console.log("Email sent successfully");
                res.status(200).send({message:"Email Sent"})
            }
        });
        
    }catch(err){
        console.log("Email not sent");
        console.log(err);
    }
}