const productCollection = require('../model/productSchema')
const registercollection = require('../model/registerSchema')
const categorycollection = require('../model/categorySchema')
const nodemailer = require('nodemailer');
const generateOTP = require('generate-otp');



// ------------------get home------------------


const home = async (req, res) => {
  try {
    let numberOfItems;
    const product = await productCollection.find().limit(30)

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user } // Match the document based on email
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' } // Calculate the size of the items array
        }
      }
    ]).exec();

    if (total.length > 0) {
      numberOfItems = total[0].numberOfItemsInCart;
    }


    if (req.session.user) {
      const d1 = await registercollection.findOne({ email: user })
      req.session.username = d1.name
    }

    if (req.user) {
      req.session.googleuser = req.user.name
    }
    const username = req.session.username
    const googleuser = req.session.googleuser
    res.render('mainHome/home', { username, user, googleuser, product, numberOfItems, })
  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}



// ------------------------get shop---------------------


const shop = async (req, res) => {
  try {
    let numberOfItems;

    const category = await categorycollection.find()
    const product = await productCollection.find()

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user } // Match the document based on email
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' } // Calculate the size of the items array
        }
      }
    ]).exec();

    if (total.length > 0) {
      numberOfItems = total[0].numberOfItemsInCart;
    }

    if (req.session.user) {
      const d1 = await registercollection.findOne({ email: user })
      req.session.username = d1.name
    }

    if (req.user) {
      req.session.googleuser = req.user.name
    }

    const username = req.session.username
    const googleuser = req.session.googleuser
    res.render('mainHome/shop', { username, user, googleuser, product, category, numberOfItems })
  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}



// ---------------------product single view------------------


const getproductview = async (req, res) => {
  try {
    let numberOfItems;
    const id = req.params.id
    const product = await productCollection.findOne({ _id: id })

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user } // Match the document based on email
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' } // Calculate the size of the items array
        }
      }
    ]).exec();

    if (total.length > 0) {
      numberOfItems = total[0].numberOfItemsInCart;
    }

    if (req.session.user) {
      const d1 = await registercollection.findOne({ email: user })
      req.session.username = d1.name
    }

    if (req.user) {
      req.session.googleuser = req.user.name
    }
    const username = req.session.username
    const googleuser = req.session.googleuser
    res.render('mainHome/productdetails', { username, user, googleuser, product, numberOfItems })
  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}



// --------------------get category-------------------------


const category = async (req, res) => {
  try {
    let numberOfItems;
    const id = req.params.id
    const product = await productCollection.find({ category: id })
    const category1 = await categorycollection.find()

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user } // Match the document based on email
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' } // Calculate the size of the items array
        }
      }
    ]).exec();

    if (total.length > 0) {
      numberOfItems = total[0].numberOfItemsInCart;
    }

    if (req.session.user) {
      const d1 = await registercollection.findOne({ email: user })
      req.session.username = d1.name
    }

    if (req.user) {
      req.session.googleuser = req.user.name
    }

    const username = req.session.username
    const googleuser = req.session.googleuser
    res.render('mainHome/category', { username, user, googleuser, product, category1, id, numberOfItems })
  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}



// ----------------get address------------------


const address = async (req, res) => {
  const user = req.session.user
  const data1 = await registercollection.findOne({ email: user })
  const address = data1.address
  res.render('mainHome/address', { address })
}



// ------------------post address---------------------


const postaddress = async (req, res) => {
  const user = req.session.user
  // const {inputAddress, inputCity, inputState, inputZip }=req.body

  const address = {
    address1: req.body.inputAddress,
    city: req.body.inputCity,
    state: req.body.inputState,
    zip: req.body.inputZip
  }


  if (address != '') {
    await registercollection.updateOne(
      { email: user },
      { $push: { address: address } }
    );
    res.redirect('/home/address')
  }
  else {
    res.redirect('/home/address')
  }
}




// ------------------update address------------------


const updateaddress = async (req, res) => {
  try {
    const id = req.body.data.addressid
    const user = req.session.user

    const address = {
      address1: req.body.data.inputAddress,
      city: req.body.data.inputCity,
      state: req.body.data.inputState,
      zip: req.body.data.inputZip
    }

    if (address != '') {
      const updatedUser = await registercollection.findOneAndUpdate(
        { email: user, 'address._id': id },
        { $set: { 'address.$': address } },
        { new: true }
      );



      if (updatedUser) {
        console.log('Address updated successfully:', updatedUser);
      }
      else {
        console.error('No user found or error updating address.');
      }
      res.redirect('/home/address')
    }
    else {
      res.redirect('/home/address')
    }

  } catch (error) {
    console.error('Error updating address:', error);
  }
}



// -----------------delete address------------------


const deleteaddrress = async (req, res) => {
  try {

    const id = req.body.deleteid
    console.log(id);
    const user = req.session.user

    await registercollection.updateOne(
      { email: user },
      { $pull: { address: { _id: id } } }
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


// ---------------cancel order----------------


const cancelorder = async (req, res) => {
  const id = req.params.id
  const email = req.session.user

  const amount1 = req.query.amount
  const amount2 = parseFloat(amount1.replace(/[^\d.]/g, ''));

  const data = {
    productname : req.query.productname,
    payment : req.query.payment,
    amount : amount2,
    orderid : req.query.orderid,
    refundstatus : 'Completed'
  }


  const status = 'Cancelled'

  try {
    const updatedUser = await registercollection.findOneAndUpdate(
      { email: email, 'orders._id': id },
      { $set: { 'orders.$.status': status } },
      {
        new: true,
      }
    );



    const order = await registercollection.findOne(
      { 'orders._id': id },
      { 'orders.$': 1, _id: 0 } 
    );
    
    const coupendiscount = order && order.orders[0] ? order.orders[0].coupendiscount : null;
    
    console.log('Coupon Discount for order:', coupendiscount);
    
    let newtotal
    let data1

      if(coupendiscount != null){
        newtotal =+ amount2-coupendiscount
        data1 = {
          productname : req.query.productname,
          payment : req.query.payment,
          amount : amount2-coupendiscount,
          orderid : req.query.orderid,
          refundstatus : 'Completed'
        }
        await registercollection.findOneAndUpdate(
          {email:email},
          {$inc:{'wallet.total':newtotal}}
        )
      }else{
        newtotal =+ amount2
        data1 = {
          productname : req.query.productname,
          payment : req.query.payment,
          amount : amount2,
          orderid : req.query.orderid,
          refundstatus : 'Completed'
        }
        await registercollection.findOneAndUpdate(
          {email:email},
          {$inc:{'wallet.total':newtotal}}
        )
      }


    await registercollection.findOneAndUpdate(
      { email: email },
      { $push: { 'wallet.refund': data1 } },
      { new: true }
    );
    
    res.redirect('/home/orders')
  }
  catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// --------------------------------------------password----------------------------------


let password;
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

  res.render('mainHome/otp',{invalidotp})
}

// ---------------------post otp-------------------


const postotp = async(req,res)=>{
  const enteredotp = req.body.otp
  const email = req.session.user
  if(otp==enteredotp){
    await registercollection.updateOne({ email: email }, { $set: { password: password } })
    req.session.passwordupdated = {
      message: 'Password Updatd',
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
  res.redirect('/home/otp')
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
    res.redirect('/home/otp')
}


// -------------------------edit profile password----------------

const editprofilepassword = async (req, res) => {

  password = req.body.confirmpassword
  
  const registeremail = req.session.user

  if (password != '') {

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
    // res.redirect('/home/otp')
  }
  else {
    res.redirect('/home/profile')
  }
}




module.exports = {
  shop, home, getproductview, category, address, postaddress, updateaddress, deleteaddrress, cancelorder,
  editprofilepassword, getotp ,postotp,otpgenerator
}