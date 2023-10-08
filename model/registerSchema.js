const mongoose = require('../database/dbConnect')


const registerschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    number: {
        type: Number
    },
    address: [{
        address1:{
            type: String
        },
        city:{
            type: String
        },
        state:{
            type: String
        },
        zip:{
            type: String
        }
    }],
    password: {
        type: String,
        required: true
    },
    blocked: {
        type: String,
        required: true
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
            price: {
                type: Number
            },
            totalprice: {
                type: Number
            },
            productname: {
                type: String
            },
            images: {
                type: String
            },
            grandtotal: {
                type: Number
            },
        }],
        grandtotal: {
            type: Number
        },
    },
    orders: [{
        address: {
            address1:{
                type: String
            },
            city:{
                type: String
            },
            state:{
                type: String
            },
            zip:{
                type: String
            }
        },
        razorpay_order_Payment_Id:{
            type: String,
        },
        total: {
            type: String
        },
        payment: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
        productName: {
            type: String
        },
        quantity: {
            type: Number
        },
        productid: {
            type: String
        },
        totalprice: {
            type: String
        },
        images: {
            type: String
        },
        status: {
            type: String,
            default: 'Pending'
        },
        coupendiscount:{
            type: Number
        }
    }],
    coupens:[{
        isused:{
            type: String
        },
        coupenid:{
            unique:true,
            type: String
        },
        code: {
            type: String,
            required: true
        },
        discount: {
            type: Number,
            required: true
        },
        minvalue: {
            type: Number,
            require:true
        },
        expirydate: {
            type: String,
            required: true
        },
        discription: {
            type: String,
            required: true
        }
    }],
    usedcoupens:[{
        coupenid:{
            type: String
        }
    }],
    wallet:{
        total:{
            type: Number
        },
        refund:[{
            amount:{
                type: Number
            },
            orderid:{
                type: String
            },
            productname:{
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            },
            refundstatus:{
                tpye: String
            }
        }]
    }
})

const registercollection = new mongoose.model('user register', registerschema)

module.exports = registercollection