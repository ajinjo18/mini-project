const productCollection=require('../model/productSchema')
const registercollection = require('../model/registerSchema')
const categorycollection = require('../model/categorySchema')


const home=async(req,res)=>{
  try{
    const product=await productCollection.find().limit(30)
    
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
  const active='active'
  res.render('mainHome/home',{username,user,googleuser,product,active})
  }
  catch(err){
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const shop=async(req,res)=>{
  try{
    const category=await categorycollection.find()
    const product=await productCollection.find()
    
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
  res.render('mainHome/shop',{username,user,googleuser,product,category})
  }
  catch(err){
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const getproductview=async(req,res)=>{
  try{
    const id=req.params.id
    const product=await productCollection.findOne({_id:id})
    
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
  res.render('mainHome/productdetails',{username,user,googleuser,product})
  }
  catch(err){
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const category=async (req,res)=>{
  try{
    const id=req.params.id
    const product=await productCollection.find({category:id})
    const category1=await categorycollection.find()

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
  res.render('mainHome/category',{username,user,googleuser,product,category1,id})
  }
  catch(err){
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const address=async(req,res)=>{
  const user=req.session.user
  const data1=await registercollection.findOne({email:user})
  const address=data1.address
  res.render('mainHome/address',{address})
}

const postaddress=async(req,res)=>{
  const address=req.body.address
  const user=req.session.user

  // console.log('running');
  // console.log(address);
  if(address!=''){
    await registercollection.updateOne(
      { email: user },
      { $push: { address: address } }
    );
    res.redirect('/home/address')
  }
  else{
    res.redirect('/home/address')
  }
}

const updateaddress=async(req,res)=>{
  try {
      console.log('running');
      const data=req.body.data
      const address=req.body.data.address
      const address1=req.body.data.address1
      const user=req.session.user
      console.log(user);
      console.log(data);

      console.log(address1);
      console.log(address);
      if(address!=''){
        const updatedUser = await registercollection.findOneAndUpdate(
          { email: user, 'address': address1 },
          { $set: { 'address.$': address } },
          { new: true }
        );
      
        if (updatedUser) {
          console.log('Address updated successfully:', updatedUser);
        } else {
          console.error('No user found or error updating address.');
        }
        res.redirect('/home/address')
      }
      else{
        res.redirect('/home/address')
      }
    
  } catch (error) {
    console.error('Error updating address:', error);
  }
}

const deleteaddrress=async(req,res)=>{
  try{
    console.log('running');
    const address=req.body.address
    const user=req.session.user
    console.log(address);
    await registercollection.updateOne(
      { email: user },
      { $pull: { address: address } },
      { multi: true }
    )
    .then(() => {
      console.log('Address removed successfully.');
      res.status(200).json({ error: 'Address removed successfully' });
    })
    .catch(err => {
      console.error('Error removing address:', err);
    });
    res.redirect('/home/address')
  }
  catch (error) {
  console.error(error);
}
}


// ------------cancel order-------------

const cancelorder = async (req, res) => {
  console.log('running');
  const id=req.params.id
  const status='Cancelled'

  try {
      const updatedUser = await registercollection.findOneAndUpdate(
          { 'orders.product._id': id },
          { $set: { 'orders.$[i].product.$[j].status': status } },
          {
              new: true,
              arrayFilters: [
                  { 'i.product._id': id },
                  { 'j._id': id }
              ]
          }
      );
      res.redirect('/home/orders')
  } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports={
    shop,home,getproductview,category,address,postaddress,updateaddress,deleteaddrress,cancelorder
}