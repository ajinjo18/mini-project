const mongoose  = require('../database/dbConnect')


const productSchema=new mongoose.Schema({
    productname: {
        type: String,
        required: true
    },
    stock: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    description: {
        type: String,
        require: true,
    },
    images: [
        {
            type: String,
        }
    ],
    category: {
        type: String,
        required: true
    }
})

const productCollection=new mongoose.model('products',productSchema)

module.exports=productCollection