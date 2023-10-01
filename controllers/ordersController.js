const registercollection = require('../model/registerSchema')
const productCollection = require('../model/productSchema')



// ------------------my orders-------------------


const myorders = async (req, res) => {
  const email = req.session.user;
  
  try {
    const user = await registercollection.findOne({ email: email }, { orders: 1 });

    const ordersWithProducts = user.orders.map((order) => ({
      id: order._id,
      address: order.address,
      total: order.total,
      payment: order.payment,
      products: order.product, 
      productid: order.productid,
      images: order.images
    }));
    res.render('mainHome/order', { orders: ordersWithProducts});
  }
  catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal Server Error');
  }
      
};
  

module.exports={
    myorders
}