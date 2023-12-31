const mongoose = require('../database/dbConnect')


const registerschema = new mongoose.Schema({
    temppassword:{
        type: String
    },
    tempname:{
        type: String
    },
    tempnumber:{
        type: Number
    },
    otp:{
        type: Number
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true,
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
            type: String
        },
        code: {
            type: String,
        },
        discount: {
            type: Number,
        },
        minvalue: {
            type: Number,
        },
        expirydate: {
            type: String,
        },
        discription: {
            type: String,
        }
    }],
    usedcoupens:[{
        coupenid:{
            type: String
        }
    }],
    wallet:{
        total:{
            default: 0,
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
            status: {
                type: String,
            }
            
        }]
    }
})

const registercollection = new mongoose.model('userregister', registerschema)

module.exports = registercollection