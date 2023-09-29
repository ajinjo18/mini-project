const mongoose  = require('../database/dbConnect')


const categorySchema=new mongoose.Schema({
    discription:{
        type:String,
        required:true
    },
    category:{
        unique:true,
        type:String,
        requird:true
    }
})

const categorycollection=new mongoose.model('category',categorySchema)

module.exports=categorycollection