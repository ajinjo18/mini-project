const mongoose  = require('../database/dbConnect')


const registerschema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    number:{
        type:Number
    },
    address:[{
        type:String
    }],
    password:{
        type:String,
        required:true
    },
    blocked:{
        type:String,
        required:true
    },
    cart: {
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'productCollection'
            },
            quantity: {
                type: Number,
                default: 1
            },
            price:{
                type:Number
            },
            totalprice:{
                type:Number
            },
            productname:{
                type:String
            },
            images:{
                type:String
            },
            grandtotal: {
                type:Number
            },
        }],
        grandtotal: {
            type:Number
        },
    },
    orders:[{
        date:{
            type: Date,
            default: Date.now
        },
        address:{
            type:String
        },
        total:{
            type:String
        },
        payment:{
            type:String
        },
        product: [{
            date:{
                type: Date,
                default: Date.now
            },
            productName: {
                type: String
            },
            quantity: {
                type: Number
            },
            productid:{
                type: String
            },
            totalprice:{
                type:String
            },
            images:{
                type:String
            },
            status:{
                type:String,
                default:'Pending'
            }
        }]
    }]
})

const registercollection =new mongoose.model('user register',registerschema)

module.exports=registercollection