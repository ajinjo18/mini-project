const mongoose  = require('../database/dbConnect')


const offerbannerSchema=new mongoose.Schema({
    sale:{
        type:String,
        required:true
    },
    discount:{
        type:String,
        requird:true
    },
    day:{
        type: String,
        require:true
    },
    hour:{
        type: String,
        require:true
    },
    min:{
        type: String,
        require:true
    },
    sec:{
        type: String,
        require:true
    }
})

const offersalecollection=new mongoose.model('saleoffer',offerbannerSchema)


module.exports = offersalecollection