const mongoose  = require('../database/dbConnect')


const returnschema=new mongoose.Schema({
    productname: {
        type: String,
    },
    payment: {
        type: String,
    },
    amount: {
        type: Number,
    },
    orderid: {
        type: String,
    },
    user:{
        type: String
    },
    status:{
        type: String
    }
})

const returnproductCollection=new mongoose.model('returnproduct',returnschema)

module.exports=returnproductCollection