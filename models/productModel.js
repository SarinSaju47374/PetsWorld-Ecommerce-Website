import {model,Schema} from "mongoose";

//products schema
const productSchema = new Schema({
    productName: {
        type:String,
    },
    brandName:{
      type:String
    },
    description: {
        type:String,
    },
    points: {
        type:[String],
    },
    productPrice: {
        type:Number,
    },
    salePrice:{
        type:Number,
    },
    stock: {
        type:Number,
    },
    category: {
        type:String,
    },
    subCategory:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:()=>Date.now(),
    },
    paymentOption:{
        type:String,
    },
    rating:{
        type:Number,
    },
    photo: {
        type:[{title: String,filepath: String,}]
    },
  });



// //cart schema
// const cartSchema = new Schema(
//   {userId: {
//     type: Schema.Types.ObjectId,
//     ref: 'users',
//     required: true,
//   },
//   items: [
//     {
//       productId: {
//         type: Schema.Types.ObjectId,
//         ref: 'product',
//         required: true,
//       },
//       productName: {
//         type:String,
//       },
//       brandName:{
//         type:String
//       },
//       description: {
//           type:String,
//       },
//       productPrice: {
//           type:Number,
//       },
//       salePrice:{
//           type:Number,
//       },
//       stock: {
//           type:Number,
//       },
//       category: {
//           type:String,
//       },
//       subCategory:{
//           type:String,
//       },
//       createdAt:{
//           type:Date,
//           default:()=>Date.now(),
//       },
//       paymentOption:{
//           type:String,
//       },
//       rating:{
//           type:Number,
//       },
//       photo: {
//         title: String,
//         filepath: String,
//       },
//       quantity:Number,
//     },
//   ],} 
//   ,{
//   collection:"cart"
// });
// const cartSchema = new Schema(
//   {userId: {
//     type: Schema.Types.ObjectId,
//     ref: 'user',
//     required: true,
//   },
//   items: [
//     {
//       productId: {
//         type: Schema.Types.ObjectId,
//         ref: 'product',
//         required: true,
//       }, 
//       quantity:Number,

//     },
//   ],} 
//   ,{
//   collection:"cart"
// });

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'product',
          required: true,
        },
        quantity: Number,
      },
    ],
  },
  {
    collection: 'cart',
  }
);

// // Middleware to update item price and total price when quantity is changed
// cartSchema.pre('save', async function (next) {
//   if (this.isModified('items')) {
//     try {
//       const populateOptions = { path: 'items.productId', select: 'salePrice' };
//       const cart = await this.constructor.populate(this, populateOptions);

//       let totalPrice = 0;

//       const updatedItems = cart.items.map((item) => {
//         item.price = item.productId.salePrice * item.quantity;
//         totalPrice += item.price;
//         return item;
//       });

//       this.items = updatedItems;
//       this.totalPrice = totalPrice;
//     } catch (error) {
//       console.log(error);
//       return next(error);
//     }
//   }

//   next();
// });




 


const addressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  country:{
    type:String,
    required:true,
  },
  fName: {
    type: String,
    requried:true
  },
  lName :String,
  addr:{
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pinCode : {
    type: String,
    required: true
  },
  ph:{
    type:Number,
    required:true,
  },
  isShippingAddress: {
    type: Boolean,
    default: false
  }
});

addressSchema.pre('save', async function(next) {
  if (this.isShippingAddress) {
    // Remove the isShippingAddress flag from other addresses for the same user
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isShippingAddress: false } }
    );
  }
  next();
});

// //order Schema
// const orderSchema = new Schema({
//     address: {
//       type: Schema.Types.ObjectId,
//       ref: 'address',
//       required: true,
//     },
//     product: [{
//       type: Schema.Types.ObjectId,
//       ref: 'cart',
//     }],
//     paymentMode: {
//       type: String,
//       required: true,
//     },
  
// });
const orderSchema = new Schema({
  date: Date,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  address: {
    country:{
      type:String,
      required:true,
    },
    fName: {
      type: String,
      requried:true
    },
    lName :String,
    addr:{
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pinCode : {
      type: String,
      required: true
    },
    ph:{
      type:Number,
      required:true,
    },
  },
  product: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  paymentmode: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1
  },
  orderPlaced: {
    type: Date,
  },
  orderShipped: {
    type: Date,
  },
  orderOnRoute: {
    type: Date
  },
  orderDelivered: {
    type: Date
  }
});

// const wishlistSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//   },
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   }
// });


const categorySchema = new Schema({
  ctgryName:{
    type:String,
    required:true,
  },
  photo: {
    type:{title: String,filepath: String,}
  },
  isHide:{
    type:Boolean,
    enum:[true,false],
    default:false, 
  }
},{
  collection:"category"
})
const subCategorySchema = new Schema({
  ctgryName:{
    type: Schema.Types.ObjectId,
    ref: 'category',
    required: true,
  },
  subCtgryName:{
    type:String,
    required:true,
  },
  photo: {
    type:{title: String,filepath: String,}
  },
},{
  collection:"subCategory"
})

const productModel = model('product', productSchema);
const cartModel = model('cart', cartSchema);
const addressModel = model('address',addressSchema)
const orderModel = model('orders',orderSchema);
const ctgryModel = model('category',categorySchema);
const subCtgryModel = model('subCategory',subCategorySchema);
export {productModel,cartModel,addressModel,orderModel,ctgryModel,subCtgryModel};
