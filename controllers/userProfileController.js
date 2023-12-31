const registercollection = require('../model/registerSchema')
const nodemailer = require('nodemailer');
const generateOTP = require('generate-otp');
const bcrypt = require('bcrypt')



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
  res.render('mainHome/otpnumname')
}


// ---------------------post otp-------------------


const postotp = async(req,res)=>{
  const enteredotp = req.body.otp
  const email = req.session.user

  const check = await registercollection.findOne({email:email},{otp:1,tempname:1,tempnumber:1})
  if (check.otp === null) {
      return res.status(400).json({ message: 'errorotp' });
  }
  const sendOtp = check.otp

  if(sendOtp == enteredotp){
    await registercollection.updateOne({ email: email }, { $set: { name : check.tempname , number : check.tempnumber} })
    await registercollection.findOneAndUpdate(
      { email: email },
      { $unset: { tempname: 1, tempnumber: 1 } }
    );
    req.session.profileupdated = {
      message: 'profile updated',
      type: 'success'
    }
    return res.status(400).json({ message: 'Updated' });
  }
  else{
    return res.status(400).json({ message: 'errorotp' });
  }
}

// -------------------------resend otp---------------------------

const otpgenerator=async(req,res)=>{

  const email = req.session.user

  const otp = generateOTP.generate(6, { digits: true, alphabets: false, specialChars: false });
  await registercollection.findOneAndUpdate({email:email},{$set:{otp:otp}})


  const mailOptions = {
    from: 'testtdemoo11111@gmail.com',
    to: `${email}`,
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
      setTimeout(async () => {
        try {
          await registercollection.findOneAndUpdate({ email: email }, { $unset: { otp: 1 } });
        } catch (error) {
          console.error('Error removing OTP:', error.message);
        }
      }, 60000);
    }
  });
  res.redirect('/home/2otp')
}

// ----------------post edit user profile--------------


const posteditprofile =async(req,res)=>{
  try{
    const email = req.session.user

    await registercollection.findOneAndUpdate(
      { email: email },
      { $unset: { tempname: 1, tempnumber: 1 } }
    );
      await registercollection.findOneAndUpdate({email:email},{$set:{tempname:req.body.name,tempnumber:req.body.number}})


    const otp = generateOTP.generate(6, { digits: true, alphabets: false, specialChars: false });
    await registercollection.findOneAndUpdate({email:email},{$set:{otp:otp}})


    const mailOptions = {
      from: 'testtdemoo11111@gmail.com',
      to: `${email}`,
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
        setTimeout(async () => {
          try {
            await registercollection.findOneAndUpdate({ email: email }, { $unset: { otp: 1 } });
          } catch (error) {
            console.error('Error removing OTP:', error.message);
          }
        }, 60000);
      }
    });
    res.json({ message: 'otp' })
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