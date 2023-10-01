const registercollection = require('../model/registerSchema')
const productCollection = require('../model/productSchema')
const { Collection } = require('mongoose')



// -----------------get cart-----------------


const getcart = async (req, res) => {
  const username = req.session.username
  const user = req.session.user
  if (req.user) {
    req.session.googleuser = req.user.name
  }
  const googleuser = req.session.googleuser

  const check = await registercollection.findOne({ email: user })


  const cartTotal = await registercollection.aggregate([
    { $unwind: "$cart.items" }, 
    {
      $group: {
        _id: null,
        total: { $sum: "$cart.items.totalprice" }  
      }
    }
  ]);

  const totalValue = cartTotal.length > 0 ? cartTotal[0].total : 0;

  const cartProductData = await Promise.all(
    check.cart.items.map(async (cartItem) => {
      const productData = await productCollection.findById(cartItem.productId);
      return { product: productData, quantity: cartItem.quantity ,id: cartItem.productId};
    })
  );

  res.render('mainHome/cart', { user, googleuser, username,totalValue, cartItems:cartProductData})
}



// -----------------post cart(quantity updation)---------------------


const postcart = async (req, res) => {
  const userId  = req.session.user;
  const id = req.params.id;
  const newQuantity = req.body.quantity;
  const images=req.body.imageUrl
  
  try {
    const productprice1=await productCollection.findOne({_id:id},{_id:0,price:1})
    const productprice=productprice1.price
    const totalprice=productprice*newQuantity

    const data=await registercollection.findOne({email:userId})
    const updatedUser = await registercollection.findOneAndUpdate(
      { email: userId, 'cart.items.productId': id },
      { $set: { 'cart.items.$.quantity': newQuantity ,'cart.items.$.price': productprice ,'cart.items.$.totalprice': totalprice , 'cart.items.$.images':images } },
      { new: true }
    );

    const grandtotal=await registercollection.aggregate([
      { $match: { email: userId } },  
      { $unwind: '$cart.items' },    
      { $group: { _id: null, total: { $sum: '$cart.items.totalprice' } } } 
    ])

    if (grandtotal.length > 0) {
      const totalSum = grandtotal[0].total;
      req.session.grandtotal=totalSum
    }

    const totalSum=req.session.grandtotal
    await registercollection.findOneAndUpdate(
      { email: userId },
      { $set: { 'cart.grandtotal': totalSum } }
    );

    if (updatedUser) {
      return res.status(200).json({ data, success: true, message: 'Quantity updated successfully.' });
    }
    else {
      return res.status(404).json({ success: false, message: 'Product not found in the cart.' });
    }
  }
  catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



// ---------------------get checkout------------------------


const getcheckout=async(req,res)=>{
  try{
    const user=req.session.user
    const data1=await registercollection.findOne({email:user})

    const address=data1.address
    const data=data1.cart.items;
    const grandtotal=data1.cart.grandtotal
    

    if(req.session.user) {
      const d1=await registercollection.findOne({email:user})
      req.session.username=d1.name
    }
    
    if(req.user) {
      req.session.googleuser=req.user.name
    }
    const username=req.session.username
    const googleuser=req.session.googleuser
    res.render('mainHome/checkout',{username,user,googleuser,data,grandtotal,address})
  }
  catch(err){
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}




// -------------------delete cart---------------------


const getdeletecart=async(req,res)=>{
  const id=req.params.id
  const user=req.session.user
  await registercollection.updateOne(
    { email: user },
    { $pull: { 'cart.items': { productId: id } } }
  );
  await registercollection.findOneAndUpdate(
    { email: user }, 
    { $unset: { "cart.grandtotal": 0 } }, 
    { new: true } 
  );
  res.redirect('/home/cart')
}



// --------------add address------------------


const addaddress=async(req,res)=>{
  const address=req.body.address
  const user=req.session.user

  if(address!=''){
    await registercollection.updateOne(
      { email: user },
      { $push: { address: address } }
    );
    res.redirect('/home/checkout')
  }
  else{
    res.redirect('/home/checkout')
  }
}



// -------------------place order------------------


const placeorder =async (req, res) => {
  try{

    const user=req.session.user
    const { address, payment } = req.body.data;
    const data1 = req.body.data1;
    const grandtotal = req.body.grandtotal;


    const productid1 = data1.map(product => ({
      productid: product.productid,
    }));

    const productid = productid1.map(item => item.productid);

    const productstock = await productCollection.find({ _id: productid });

    if (productstock.length > 0) {
      const stock = productstock.stock;
      console.log('Stock:', stock);
    } else {
      console.log('Product not found or no stock information available.');
    }

    if(address && payment){
      const newOrder = {
        address, 
        total: grandtotal, 
        payment
      }
      const productOrders = data1.map(product => ({
        productName: product.productName,
        quantity: product.quantity,
        productid: product.productid,
        totalprice: product.totalPrice,
        images: product.images
      }));
      
      newOrder.product = productOrders;
    
      await registercollection.updateOne(
        {email: user}, 
        {$push: {orders: newOrder}}
      )
      const updatedUser = await registercollection.findOneAndUpdate(
        { email: user }, 
        { $set: { "cart.items": [] } }, 
        { new: true } 
      );
    
      const updatedUser1 = await registercollection.findOneAndUpdate(
        { email: user }, 
        { $unset: { "cart.grandtotal": 0 } }, 
        { new: true } 
      );
            
      res.status(200).json({ message: "logined", type: 'success' })
    }
    else{
      res.status(400).json({ message: "choose your option", type: 'danger' })
    }
  }
  catch(err){
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }

};
  

// -------------order confirmed(thankyou)--------------------


const thankyou=async(req,res)=>{
  try{
    
    const user=req.session.user

    if(req.session.user) {
      const d1=await registercollection.findOne({email:user})
      req.session.username=d1.name
    }
    
    if(req.user) {
      req.session.googleuser=req.user.name
    }
    const username=req.session.username
    const googleuser=req.session.googleuser
    res.render('mainHome/thankyou',{username,user,googleuser})
  }
  catch(err){
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getcart,postcart,getcheckout,getdeletecart,addaddress,placeorder,thankyou
}