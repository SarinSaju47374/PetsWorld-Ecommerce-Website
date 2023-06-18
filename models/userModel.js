import mongoose from "mongoose";
const {model,Schema} = mongoose;

const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
    },
    fName:{
        type:String,
        required:true,
    },
    lName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    phoneNumber:{
        type:Number,
        required:true
    },
    psswd:{
        type:String,
        required:true,
        unique:true
    },
    verified:{
        type:Boolean,
        default:false,
        required:true,
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    addresses:[
        {addrId:{
            type:Schema.Types.ObjectId,
            ref:"address",
        }}
    ],
    otp: {
        type: Number,
        default: 0,
        // unique: true,
        // partialFilterExpression: { otp: { $ne: null } },
    },
})



const userModel = model("user",userSchema);
export default userModel;