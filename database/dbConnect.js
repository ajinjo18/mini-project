const mongoose=require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/mini_project')
.then(()=>{
    console.log('mongodb connected');
})
.catch((err)=>{
    console.log('connction failed',err);
})

module.exports=mongoose