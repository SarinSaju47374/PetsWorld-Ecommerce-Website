import nodemailer from "nodemailer";

export default async(email,subject,text )=>{
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
                console.log(err);
            }else{
                console.log("Email sent successfully");
            }
        });
        
    }catch(err){
        console.log("Email not sent");
        console.log(err);
    }
}