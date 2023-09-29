const productCollection=require('../model/productSchema')
const registercollection = require('../model/registerSchema')


const addtocart=async(req,res)=>{
    const id=req.params.id
    const pname=await productCollection.findOne({_id:id},{productname:1,_id:0,price:1,images:1})
    productname=pname.productname
    const price=pname.price
    const images='/img/'+pname.images[0]
    const userid=req.session.userid
    const userId=req.session.user
    
    await registercollection.updateOne(
        { _id: userid, 'cart.items.productId': { $ne: id } }, // Ensure productId is not already in the cart
        { $push: { 'cart.items': { productId: id , productname:productname , price:price , totalprice:price , images:images} } }
      );  


    const grandtotal=await registercollection.aggregate([
        { $match: { email: userId } },  // Match the documents with the specified email 
        { $unwind: '$cart.items' },         // Unwind the 'items' array
        { $group: { _id: null, total: { $sum: '$cart.items.totalprice' } } }  // Group and calculate the sum
    ])

    if (grandtotal.length > 0) {
        const totalSum = grandtotal[0].total;
        req.session.grandtotal1=totalSum
        console.log('Total sum of totalprice:', totalSum);
      }
     else {
        console.log('User not found or cart is empty.');
    }
        console.log(req.session.grandtotal);
        const totalSum=req.session.grandtotal1
        await registercollection.findOneAndUpdate(
          { email: userId },
          { $set: { 'cart.grandtotal': totalSum } }
      );
      
      res.redirect('/home/cart')
}



module.exports={
    addtocart
}