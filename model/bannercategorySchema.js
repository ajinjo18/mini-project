const mongoose  = require('../database/dbConnect')


const bannercategorySchema=new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        requird:true
    },
    image:{
        type: String,
        require:true
    }
})

const bannercategorycollection=new mongoose.model('bannerCategory',bannercategorySchema)


module.exports=bannercategorycollection