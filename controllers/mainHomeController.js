const productCollection = require('../model/productSchema')
const registercollection = require('../model/registerSchema')
const categorycollection = require('../model/categorySchema')
const bannercategorycollection = require('../model/bannercategorySchema')
const offersalecollection = require('../model/offerbannerSchema')
const returnproductCollection = require('../model/returnproductSchema')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const generateOTP = require('generate-otp');
const { name } = require('ejs')



// ------------------get home------------------


const home = async (req, res) => {
  try {
    let numberOfItems;
    const product = await productCollection.find().limit(30)

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user }
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' }
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

    const bannerc = await bannercategorycollection.find()
    const offerbaner = await offersalecollection.find()

    res.render('mainHome/home', { username, user, googleuser, product, numberOfItems, bannerc, offerbaner })

  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}



// ------------------------get shop---------------------


const shop = async (req, res) => {
  try {

    const pagenum = 0;
    const a = 5 * pagenum;
    const b = 5 * (pagenum + 1)

    const product1 = await productCollection.find();

    const length = product1.length
    const pages = Math.ceil(length / 5)


    let numberOfItems;

    const category = await categorycollection.find()
    const product2 = await productCollection.find()

    const product = product2.slice(a, b);

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user }
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' }
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

    const shop = 'shop'

    res.render('mainHome/shop', { username, user, googleuser, product, category, numberOfItems, pagenum, pages, shop })
  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


// ------------------------pagination shop---------------------


const paginationshop = async (req, res) => {
  try {
    const pagenum1 = req.query.page;
    const pagenum = parseInt(pagenum1);
    const a = 5 * pagenum;
    const b = 5 * (pagenum + 1)

    const product1 = await productCollection.find();

    const length = product1.length
    const pages = Math.ceil(length / 5)


    let numberOfItems;

    const category = await categorycollection.find()
    const product2 = await productCollection.find()

    const product = product2.slice(a, b);

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user }
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' }
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

    const shop = 'shop'

    res.render('mainHome/shop', { username, user, googleuser, product, category, numberOfItems, pagenum, pages, shop })
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
        $match: { email: user }
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' }
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
    req.session.category = ''
    req.session.category = id
    const product = await productCollection.find({ category: id })
    const category1 = await categorycollection.find()

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user }
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' }
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
        console.log('Address updated successfully');
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
    const user = req.session.user

    await registercollection.updateOne(
      { email: user },
      { $pull: { address: { _id: id } } }
    )
      .then(() => {
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
    productname: req.query.productname,
    payment: req.query.payment,
    amount: amount2,
    orderid: req.query.orderid,
    refundstatus: 'Completed'
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

    let newtotal1
    let newtotal2
    let newtotal
    let data1

    // let newtotal
    // let data1

    if (coupendiscount != null) {
      // newtotal = + amount2 - coupendiscount

      newtotal1 = (coupendiscount / 100) * amount2
      newtotal2 = amount2 - newtotal1
      newtotal = + newtotal2

      data1 = {
        productname: req.query.productname,
        payment: req.query.payment,
        amount: newtotal,
        orderid: req.query.orderid,
        status: 'credited'
      }
      await registercollection.findOneAndUpdate(
        { email: email },
        { $inc: { 'wallet.total': newtotal } }
      )
    } else {
      newtotal = + amount2
      data1 = {
        productname: req.query.productname,
        payment: req.query.payment,
        amount: amount2,
        orderid: req.query.orderid,
        status: 'credited'
      }
      await registercollection.findOneAndUpdate(
        { email: email },
        { $inc: { 'wallet.total': newtotal } }
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



// =================================password edit====================================


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
  res.render('mainHome/otp')
}

// ---------------------post otp(edit password)-------------------


const postotp = async (req, res) => {
  const enteredotp = req.body.otp
  const email = req.session.user
  const check = await registercollection.findOne({email:email},{otp:1})
  if (check.otp === null) {
      return res.status(400).json({ message: 'errorotp' });
  }
  const sendOtp = check.otp

  const password = await registercollection.findOne({email:email},{temppassword:1})

  
  if (sendOtp == enteredotp) {
    await registercollection.updateOne({ email: email }, { $set: { password: password.temppassword } })
    await registercollection.findOneAndUpdate({ email: email }, { $unset: { temppassword: 1 } });

    req.session.passwordupdated = {
      message: 'PasswordUpdated',
      type: 'success'
    }
    return res.status(400).json({ message: 'PasswordUpdatd' });
  }
  else {
    return res.status(400).json({ message: 'errorotp' });
  }
}



// -------------------------resend otp(edit password)---------------------------

const otpgenerator = async(req, res) => {

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
  res.redirect('/home/otp')
}


// ----------------edit profile password(post password and send otp)--------------

const editprofilepassword = async (req, res) => {

  const email = req.session.user

  const newPassword =await bcrypt.hash(req.body.confirmpassword, 10)

  await registercollection.findOneAndUpdate({ email: email }, { $unset: { temppassword: 1 } });
  await registercollection.findOneAndUpdate({email:email},{$set:{temppassword:newPassword}})

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


// -------------------------post filterprice----------------

const filterprice = async (req, res) => {

  try {


    const minamountValue = req.body.minamountValue.replace('₹', '');
    const maxamountValue = req.body.maxamountValue.replace('₹', '');




    const product = await productCollection.find({ price: { $gte: minamountValue, $lte: maxamountValue } })

    res.send({ minamountValue, maxamountValue })
  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }

}


// -------------------------get filterprice----------------

const viewfilerproduct = async (req, res) => {
  try {
    let product

    const minamountValue = req.params.min.replace('₹', '');
    const maxamountValue = req.params.max.replace('₹', '');

    if (minamountValue == undefined) {
      minamountValue = '200'
      maxamountValue = '2000'
    }

    req.session.minamountValue = minamountValue
    req.session.maxamountValue = maxamountValue

    const sort = req.params.sort

    if (sort == '1') {
      product = await productCollection.find({ price: { $gte: minamountValue, $lte: maxamountValue } }).sort({ price: -1 })

    }
    else if (sort == '-1') {
      product = await productCollection.find({ price: { $gte: minamountValue, $lte: maxamountValue } }).sort({ price: 1 })
    }
    else {
      if (minamountValue != '' && maxamountValue != '') {
        product = await productCollection.find({ price: { $gte: minamountValue, $lte: maxamountValue } })

      }
    }


    let numberOfItems;
    const category = await categorycollection.find()

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user }
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' }
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

    const shop = 'shop1'

    res.render('mainHome/shop', { username, user, googleuser, product, category, numberOfItems, shop })
  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const sortedprice = async (req, res) => {
  try {
    let product
    let minamountValue
    let maxamountValue

    if (req.session.minamountValue == undefined) {
      minamountValue = '200'
      maxamountValue = '2000'
    }
    else {
      minamountValue = req.session.minamountValue
      maxamountValue = req.session.maxamountValue
    }


    const sort = req.params.sort

    if (sort == '1') {
      product = await productCollection.find({ price: { $gte: minamountValue, $lte: maxamountValue } }).sort({ price: -1 })

    }
    else if (sort == '-1') {
      product = await productCollection.find({ price: { $gte: minamountValue, $lte: maxamountValue } }).sort({ price: 1 })
    }
    else {
      if (minamountValue != '' && maxamountValue != '') {
        product = await productCollection.find({ price: { $gte: minamountValue, $lte: maxamountValue } })

      }
    }


    let numberOfItems;
    const category = await categorycollection.find()

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user }
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' }
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
    const shop = 'shop1'

    res.render('mainHome/shop', { username, user, googleuser, product, category, numberOfItems, shop })
  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}



const filteredcategory = async (req, res) => {
  try {

    const id = req.session.category


    let product

    const minamountValue = req.params.min.replace('₹', '');
    const maxamountValue = req.params.max.replace('₹', '');

    if (minamountValue == undefined) {
      minamountValue = '200'
      maxamountValue = '2000'
    }

    req.session.minamountValue2 = minamountValue
    req.session.maxamountValue2 = maxamountValue

    const sort = req.params.sort

    if (sort == '1') {
      product = await productCollection.find({ category: id, price: { $gte: minamountValue, $lte: maxamountValue } }).sort({ price: -1 })

    }
    else if (sort == '-1') {
      product = await productCollection.find({ category: id, price: { $gte: minamountValue, $lte: maxamountValue } }).sort({ price: 1 })
    }
    else {
      product = await productCollection.find({ category: id, price: { $gte: minamountValue, $lte: maxamountValue } })
    }

    let numberOfItems;

    const category1 = await categorycollection.find()

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user }
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' }
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



const categorysortedprice = async (req, res) => {
  try {

    const id = req.session.category


    let product


    let minamountValue
    let maxamountValue

    if (req.session.minamountValue2 == undefined) {
      minamountValue = '200'
      maxamountValue = '2000'
    }
    else {
      minamountValue = req.session.minamountValue2
      maxamountValue = req.session.maxamountValue2
    }


    const sort = req.params.sort


    if (sort == '1') {
      product = await productCollection.find({ category: id, price: { $gte: minamountValue, $lte: maxamountValue } }).sort({ price: -1 })

    }
    else if (sort == '-1') {
      product = await productCollection.find({ category: id, price: { $gte: minamountValue, $lte: maxamountValue } }).sort({ price: 1 })
    }
    else {
      product = await productCollection.find({ category: id, price: { $gte: minamountValue, $lte: maxamountValue } })
    }

    let numberOfItems;

    const category1 = await categorycollection.find()

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user }
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' }
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


// -----------------------search---------------------------

const searchproduct = async (req, res) => {
  try {

    const productname = req.body.search

    const pagenum = 0;
    const a = 5 * pagenum;
    const b = 5 * (pagenum + 1)

    const product1 = await productCollection.find({ productname: productname });

    const length = product1.length
    const pages = Math.ceil(length / 5)


    let numberOfItems;

    const category = await categorycollection.find()
    const product2 = await productCollection.find({ productname: productname })
    const product = product2.slice(a, b);

    const user = req.session.user

    const total = await registercollection.aggregate([
      {
        $match: { email: user }
      },
      {
        $project: {
          numberOfItemsInCart: { $size: '$cart.items' }
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

    const shop = 'shop'

    res.render('mainHome/shop', { username, user, googleuser, product, category, numberOfItems, pagenum, pages, shop })
  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


// ---------------cancel order----------------


const returnproduct = async (req, res) => {
  const id = req.params.id
  const email = req.session.user

  const amount1 = req.query.amount
  const amount2 = parseFloat(amount1.replace(/[^\d.]/g, ''));

  const data = {
    productname: req.query.productname,
    payment: req.query.payment,
    amount: amount2,
    orderid: req.query.orderid,
    user: email
  }
  const orderidToCheck = req.query.orderid;

  const existingDocument = await returnproductCollection.findOne({ orderid: req.query.orderid });

  if (existingDocument) {
    console.log('A document with orderid already exists.');
  } else {
    try {
      const newDocument = await returnproductCollection.create(data);
      const status = 'Return Pending'

      const updatedUser = await registercollection.findOneAndUpdate(
        { email: email, 'orders._id': id },
        { $set: { 'orders.$.status': status } },
        {
          new: true,
        }
      );
      res.redirect('/home/orders')
    } catch (error) {
      console.error('Error inserting document:', error);
    }
  }
}





module.exports = {
  shop, home, getproductview, category, address, postaddress, updateaddress, deleteaddrress, cancelorder,
  editprofilepassword, getotp, postotp, otpgenerator, filterprice, viewfilerproduct, sortedprice,
  filteredcategory, categorysortedprice, paginationshop, searchproduct, returnproduct
}