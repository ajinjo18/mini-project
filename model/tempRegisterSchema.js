const mongoose = require('../database/dbConnect')

const tempRegisterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        required: true
    },
    blocked: {
        type: String,
        required: true
    },
    otp: {
        type: Number
    }
})

const tempRegisterCollection=new mongoose.model('tempRegister',tempRegisterSchema)

module.exports=tempRegisterCollection