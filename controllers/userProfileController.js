const registercollection = require('../model/registerSchema')
const nodemailer = require('nodemailer');
const generateOTP = require('generate-otp');



// --------------------get user profile--------------------


const getprofile=async(req,res)=>{
  try{

    const useremail=req.session.user
    const userdata=await registercollection.findOne({email:useremail})
    const username=req.session.username
    const user=req.session.user

    if(req.user) {
      req.session.googleuser=req.user.name
    }

    const googleuser=req.session.googleuser
    res.render('mainHome/profile',{username,user,googleuser,userdata})
  }
  catch(err){
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}



// ----------------get edit user profile--------------


const geteditprofile=async(req,res)=>{
  try{
    const useremail=req.session.user
    const userdata=await registercollection.findOne({email:useremail})
    const username=req.session.username
    const user=req.session.user

    if(req.user) {
      req.session.googleuser=req.user.name
    }

    const googleuser=req.session.googleuser
    res.render('mainHome/profileedit',{username,user,googleuser,userdata})
  }
  catch(err){
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}



// ----------------post edit user profile--------------


const posteditprofile =async(req,res)=>{
  try{
    if(req.body.newpassword===''){
      const profiledata={
        name:req.body.name,
        number:req.body.number,
        address:req.body.address,
      }
      req.session.profiledata=profiledata
    }
    else{
      const profiledata={
        name:req.body.name,
        number:req.body.number,
        password:req.body.newpassword
      }
      req.session.profiledata=profiledata
    }
    
    const useremail=req.session.user
    const userdata=await registercollection.findOne({email:useremail},{password:1,_id:0})

    if(userdata.password==req.body.password){

      const profiledata=req.session.profiledata
      const useremail=req.session.user

      await registercollection.updateOne({email:useremail},{$set:profiledata})

      res.status(200).json({ message: "done password", type: 'success' })
    }
    else{
      res.status(400).json({ message: "Invalid password", type: 'danger' })
    }
  }
  catch(err){
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports={
    getprofile,geteditprofile,posteditprofile
}