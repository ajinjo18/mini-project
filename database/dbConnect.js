const mongoose=require('mongoose')
// mongoose.connect('mongodb://127.0.0.1:27017/mini_project')
const url = 'mongodb+srv://ajinjo1899:Ajinjo@cluster0.3s5dh3f.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(url)

.then(()=>{
    console.log('mongodb connected');
})
.catch((err)=>{
    console.log('connction failed',err);
})

module.exports=mongoose