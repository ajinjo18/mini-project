const registercollection = require('../model/registerSchema')
const productCollection = require('../model/productSchema')

// const myorders=async (req,res)=>{
//     const email=req.session.user
//     const orders = await registercollection.findOne({email:email},{orders:1})
    
//     res.render('mainHome/order',{orders})
// }

const myorders = async (req, res) => {
    const email = req.session.user;
  
    try {
      const user = await registercollection.findOne({ email: email }, { orders: 1 });

        // console.log(user);
        // const dateTimeString = "2023-09-27T16:38:45.799+00:00";
        // const datePart = dateTimeString.substring(0, 10);
        // console.log('Date part:', datePart);

  
      const ordersWithProducts = user.orders.map((order) => ({
        // date: order.date.toLocaleDateString(),
        id: order._id,
        address: order.address,
        total: order.total,
        payment: order.payment,
        products: order.product, // Rename 'product' to 'products' for clarity
        productid: order.productid,
        images: order.images
      }));
      
  
      res.render('mainHome/order', { orders: ordersWithProducts});
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  

module.exports={
    myorders
}