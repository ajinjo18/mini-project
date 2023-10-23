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

    const passwordupdated = req.session.passwordupdated
    req.session.passwordupdated=null

    const profileupdated = req.session.profileupdated
    req.session.profileupdated =null 

    res.render('mainHome/profile',{username,user,googleuser,userdata,passwordupdated,profileupdated})
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


// -----------------------------------name and number edit-----------------------------


let profiledata;
let otp;

// ---------------node mailer--------------

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  },
});


// --------------------get otp-----------------

const getotp = (req, res) => {
  const invalidotp = req.session.invalidforgetotp
  req.session.invalidforgetotp=null

  res.render('mainHome/otpnumname',{invalidotp})
}


// ---------------------post otp-------------------


const postotp = async(req,res)=>{
  const enteredotp = req.body.otp
  const email = req.session.user

  if(otp==enteredotp){
    await registercollection.updateOne({ email: email }, { $set: { name : profiledata.name , number : profiledata.number} })
    req.session.profileupdated = {
      message: 'Profile Updatd',
      type: 'success'
    }
    password=null
    res.redirect('/home/profile')
  }
  else{
    req.session.invalidforgetotp = {
      message: 'otp not valid',
      type: 'danger'
    }
  res.redirect('/home/2otp')
  }
}

// -------------------------resend otp---------------------------

const otpgenerator=(req,res)=>{

  const registeremail = req.session.user

  otp = generateOTP.generate(6, { digits: true, alphabets: false, specialChars: false });

    const mailOptions = {
      from: 'testtdemoo11111@gmail.com',
      to: `${registeremail}`,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email: ' + error);
        res.json({ message: 'error otp sending' })
      }
      else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.redirect('/home/2otp')
}

// ----------------post edit user profile--------------


const posteditprofile =async(req,res)=>{
  try{
    const registeremail = req.session.user

    profiledata={
      name:req.body.name,
      number:req.body.number
    }


    otp = generateOTP.generate(6, { digits: true, alphabets: false, specialChars: false });

    const mailOptions = {
      from: 'testtdemoo11111@gmail.com',
      to: `${registeremail}`,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email: ' + error);
        res.json({ message: 'error otp sending' })
      }
      else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.json({ message: 'otp' })
    
    
    // const useremail=req.session.user
    // const userdata=await registercollection.findOne({email:useremail},{password:1,_id:0})

    // if(userdata.password==req.body.password){

    //   const profiledata=req.session.profiledata
    //   const useremail=req.session.user

    //   await registercollection.updateOne({email:useremail},{$set:profiledata})

    //   res.status(200).json({ message: "done password", type: 'success' })
    // }
    // else{
    //   res.status(400).json({ message: "Invalid password", type: 'danger' })
    // }
  }
  catch(err){
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


// ---------------------get wallet--------------------

const getwallet = async(req,res)=>{

  const email = req.session.user
  const wallet = await registercollection.findOne({email:email},{wallet:1})

  res.render('mainHome/wallet',{wallet})
}

module.exports={
    getprofile,geteditprofile,posteditprofile,getotp,postotp,otpgenerator,getwallet
}