const registercollection = require('../model/registerSchema')
const productCollection = require('../model/productSchema')
const coupencollection = require('../model/coupenSchema')

const { Collection } = require('mongoose')
const Razorpay = require('razorpay')



// --------------------razorpay-------------

const razorpay = new Razorpay({
  key_id: 'rzp_test_ZSmWOk8dY0kcdl',
  key_secret: 'HNCM8U5mERk9Pf1nhy6hL8r6'
})



// -----------------get cart-----------------


const getcart = async (req, res) => {
  const username = req.session.username
  const user = req.session.user

  const coupens = await coupencollection.find()
  let numberOfItems;
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
      return { product: productData, quantity: cartItem.quantity, id: cartItem.productId };
    })
  );

  res.render('mainHome/cart', { user, googleuser, username, totalValue, cartItems: cartProductData,numberOfItems,coupens})
}



// -----------------post cart(quantity updation)---------------------


const postcart = async (req, res) => {
  const userId = req.session.user;
  const id = req.params.id;
  const newQuantity = req.body.quantity;
  const images = req.body.imageUrl

  try {
    const productprice1 = await productCollection.findOne({ _id: id }, { _id: 0, price: 1, stock: 1 })
    const stock = productprice1.stock

    if (newQuantity <= stock) {
      const productprice = productprice1.price
      const totalprice = productprice * newQuantity

      const data = await registercollection.findOne({ email: userId })
      const updatedUser = await registercollection.findOneAndUpdate(
        { email: userId, 'cart.items.productId': id },
        { $set: { 'cart.items.$.quantity': newQuantity, 'cart.items.$.price': productprice, 'cart.items.$.totalprice': totalprice, 'cart.items.$.images': images } },
        { new: true }
      );

      const grandtotal = await registercollection.aggregate([
        { $match: { email: userId } },
        { $unwind: '$cart.items' },
        { $group: { _id: null, total: { $sum: '$cart.items.totalprice' } } }
      ])

      if (grandtotal.length > 0) {
        const totalSum = grandtotal[0].total;
        req.session.grandtotal = totalSum
      }

      const totalSum = req.session.grandtotal
      await registercollection.findOneAndUpdate(
        { email: userId },
        { $set: { 'cart.grandtotal': totalSum } }
      );

      const data1 = await registercollection.findOne(
        { email: userId, 'cart.items': { $elemMatch: { productId: id } } },
        { 'cart.items.$': 1 }
      );

      const data2 = await registercollection.findOne(
        { email: userId },
        { 'cart.grandtotal.$': 1 }
      );

      // Assuming data1 contains the matched document
      let matchedItem;
      if (data1 && data1.cart && data1.cart.items && data1.cart.items.length > 0) {
        matchedItem = data1.cart.items[0]; // Access the matched item
      } else {
        console.log('No matching item found.');
      }

      if (updatedUser) {
        return res.status(200).json({ matchedItem, data2, success: true, message: 'Quantity updated successfully.' });
      }
      else {
        return res.status(404).json({ success: false, message: 'Product not found in the cart.' });
      }
    }
    else {
      return res.status(404).json({ success: false, message: 'Out Of Stock.' });
    }
  }

  catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



// ---------------------get checkout------------------------


const getcheckout = async (req, res) => {
  try {
    const coupens = await coupencollection.find()

    const discount = req.query.discount;
    const newtotal = req.query.newtotal;
    const coupenid = req.query.coupenid;
    const user = req.session.user
    const data1 = await registercollection.findOne({ email: user })

    let numberOfItems;
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

    const address = data1.address
    const data = data1.cart.items;
    const grandtotal = data1.cart.grandtotal

    // let coupentotal;
    // if(discount && newtotal){
    //   coupentotal = grandtotal-newtotal
    // }

    if (req.session.user) {
      const d1 = await registercollection.findOne({ email: user })
      req.session.username = d1.name
    }

    if (req.user) {
      req.session.googleuser = req.user.name
    }
    const username = req.session.username
    const googleuser = req.session.googleuser
    res.render('mainHome/checkout', { username, user, googleuser, data, grandtotal, address,numberOfItems,discount,newtotal,coupenid,coupens })
  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}




// -------------------delete cart---------------------


const getdeletecart = async (req, res) => {
  const id = req.params.id
  const user = req.session.user
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


const addaddress = async (req, res) => {

  const address = {
    address1: req.body.inputAddress,
    city: req.body.inputCity,
    state: req.body.inputState,
    zip: req.body.inputZip
  }

  const user = req.session.user

  if (address != '') {
    await registercollection.updateOne(
      { email: user },
      { $push: { address: address } }
    );
    res.redirect('/home/checkout')
  }
  else {
    res.redirect('/home/checkout')
  }
}



// -------------------place order(COD)------------------


const placeorder = async (req, res) => {
  try {
    const user = req.session.user
    const { payment } = req.body.data;
    const data1 = req.body.data1;
    const grandtotal = req.body.grandtotal.replace(/\s+/g, '');
    const coupenid = req.body.coupenid
    const coupendiscount = req.body.discount
    const { data } = req.body;

    const { address1, city, state, zip } = data;

    if (address1 && payment) {

      const productOrders = data1.map(product => ({
        productName: product.productName,
        quantity: product.quantity,
        productid: product.productid,
        totalprice: product.totalPrice,
        images: product.images,
        total: grandtotal,
        address: {
          address1, city, state, zip
        },
        payment,
        coupendiscount
      }));



      for (const product of productOrders) {
        const { quantity, productid } = product;
      
        // Retrieve the current stock for the product
        const existingProduct = await productCollection.findOne({ _id: productid });
        if (!existingProduct) {
          console.log(`Product with ID ${productid} not found.`);
          continue;
        }

        const currentStock = existingProduct.stock;
      
        // Calculate the new stock after subtracting the quantity
        const newStock = currentStock - quantity;

        // Update the stock in the database
        if(existingProduct.stock!=0 && quantity <= existingProduct.stock){
          await productCollection.updateOne(
            { _id: productid },
            { $set: { stock: newStock } }
          );
        }
        else{
          res.status(400).json({ message: "out of stock", type: 'danger' });
          return
        }

        console.log(`Stock for product with ID ${productid} updated to ${newStock}.`);
      }
      

      await registercollection.updateOne(
        { email: user },
        { $push: { 'orders': productOrders } }
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

      if(coupenid != null) {
        await registercollection.updateOne(
          { email:user },
          { $push: { usedcoupens: { coupenid: coupenid } } }
        );
      }
      
      if(coupenid != null) {
        await registercollection.updateOne(
          { email:user },
          { $unset: { coupens: 1 } }
        );
      }

      res.status(200).json({ message: "logined", type: 'success' })
    }
    else {
      console.log('errrr');

      res.status(400).json({ message: "choose your option", type: 'danger' })
    }
  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }

};


// -------------order confirmed(thankyou)--------------------


const thankyou = async (req, res) => {
  try {

    const user = req.session.user

    let numberOfItems;
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
    res.render('mainHome/thankyou', { username, user, googleuser,numberOfItems })
  }
  catch (err) {
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


// -----------------------------place order(online payment)--------------------------


const razorpayorder = async(req,res)=>{
  const email = req.session.user
  const name = await registercollection.findOne({email:email},{_id:0 , name:1})
  const totalamount=req.body.totalamount

  const data1 = req.body.data1;


  const productOrders = data1.map(product => ({
    productName: product.productName,
    quantity: product.quantity,
    productid: product.productid,
    totalprice: product.totalPrice,
  }));



  for (const product of productOrders) {
    const { quantity, productid } = product;
  
    const existingProduct = await productCollection.findOne({ _id: productid });
    if (!existingProduct) {
      console.log(`Product with ID ${productid} not found.`);
      continue;
    }

    const currentStock = existingProduct.stock;
  
    const newStock = currentStock - quantity;

    if(existingProduct.stock!=0 && quantity <= existingProduct.stock){
      continue;
    }
    else{
      res.status(400).json({ message: "out of stock", type: 'danger' });
      return;
    }

    console.log(`Stock for product with ID ${productid} updated to ${newStock}.`);
  }


  let options = {
    amount : totalamount*100,
    currency : 'INR',
  };

    razorpay.orders.create(options, function(err,order){
      res.json({order,name})
    })
}


// -------------------------payment done--------------------------


const paymentdone = async (req,res)=>{
  const user = req.session.user
  const { razorpay_payment_id } = req.body;
  console.log(razorpay_payment_id);
  const paymentDocument = await razorpay.payments.fetch(razorpay_payment_id);
  if(paymentDocument.status=='captured'){
      try {

        const data = JSON.parse(req.query.data);
        const data1 = JSON.parse(req.query.data1);
        const grandtotal = req.query.grandtotal
        const coupenid = req.query.coupenid
        const coupendiscount = req.query.discount

        const payment='Online'

        console.log(data,data1,grandtotal);
    
        const { address1, city, state, zip } = data;

    
          const productOrders = data1.map(product => ({
            razorpay_order_Payment_Id: razorpay_payment_id,
            productName: product.productName,
            quantity: product.quantity,
            productid: product.productid,
            totalprice: product.totalPrice,
            images: product.images,
            total: grandtotal,
            address: {
              address1, city, state, zip
            },
            payment,
            coupendiscount
          }));


          
          

    
          for (const product of productOrders) {
            const { quantity, productid } = product;
          
            // Retrieve the current stock for the product
            const existingProduct = await productCollection.findOne({ _id: productid });
            // console.log(existingProduct);
            if (!existingProduct) {
              console.log(`Product with ID ${productid} not found.`);
              continue;
            }
          
            const currentStock = existingProduct.stock;
          
            // Calculate the new stock after subtracting the quantity
            const newStock = currentStock - quantity;
          
            // Update the stock in the database
            if(existingProduct.stock!=0 && quantity <= existingProduct.stock){
              await productCollection.updateOne(
                { _id: productid },
                { $set: { stock: newStock } }
              );
              // res.redirect('/home/thankyoul')
            }
            // else{
            //   res.status(400).json({ message: "out of stock", type: 'danger' });
            //   return
            // }
          
            console.log(`Stock for product with ID ${productid} updated to ${newStock}.`);
          }

          await registercollection.updateOne(
            { email: user },
            { $push: { 'orders': productOrders } }
          )
          const updatedUser = await registercollection.findOneAndUpdate(
            { email: user },
            { $set: { "cart.items": [] } },
            { new: true }
          );

          if(coupenid != null) {
            await registercollection.updateOne(
              { email:user },
              { $push: { usedcoupens: { coupenid: coupenid } } }
            );
          }

    
          if(coupenid != null) {
            await registercollection.updateOne(
              { email:user },
              { $unset: { coupens: 1 } }
            );
          }
    
          const updatedUser1 = await registercollection.findOneAndUpdate(
            { email: user },
            { $unset: { "cart.grandtotal": 0 } },
            { new: true }
          );
          res.redirect('/home/thankyou')
          // res.status(200).json({ message: "logined", type: 'success' })
        // }
        // else {
        //   console.log('failll');
        //   res.status(400).json({ message: "choose your option", type: 'danger' })
        // }
      }
      catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
    else{
      res.send('payment failed')
    }
}


module.exports = {
  getcart, postcart, getcheckout, getdeletecart, addaddress, placeorder, 
  thankyou,razorpayorder,paymentdone
}