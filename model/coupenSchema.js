const mongoose  = require('../database/dbConnect')


const coupenschema=new mongoose.Schema({
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
})

const coupenCollection=new mongoose.model('coupen',coupenschema)

module.exports=coupenCollection