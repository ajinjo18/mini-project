const registercollection = require('../model/registerSchema')
const productCollection = require('../model/productSchema')
const easyinvoice = require('easyinvoice')


// ------------------get my orders-------------------


const myorders = async (req, res) => {
  const email = req.session.user;

  try {
    const pagenum = 0;
    const a = 5 * pagenum;
    const b = 5 * (pagenum + 1)

    const email = req.session.user;
    const user = await registercollection.findOne({ email: email });

    const productsForFirstOrder = user.orders

    const length = productsForFirstOrder.length
    const pages = Math.ceil(length / 5)

    const limitedOrdersWithProducts = productsForFirstOrder.slice(a, b);

    res.render('mainHome/order', { orders: limitedOrdersWithProducts, pagenum, pages });
  }
  catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal Server Error');
  }

};



// ----------------my orders(pagenation)-------------------


const pagenationorders = async (req, res) => {
  try {
    const pagenum1 = req.query.page;
    const pagenum = parseInt(pagenum1);
    const a = 5 * pagenum;
    const b = 5 * (pagenum + 1)

    const email = req.session.user;
    const user = await registercollection.findOne({ email: email });

    const productsForFirstOrder = user.orders

    const length = productsForFirstOrder.length
    const pages = Math.ceil(length / 5)

    const limitedOrdersWithProducts = productsForFirstOrder.slice(a, b);

    res.render('mainHome/order', { orders: limitedOrdersWithProducts, pagenum, pages });


  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal Server Error');
  }
};



// ----------------my orders(search)-------------------

const search = async (req, res) => {
  const payload = req.body.payload.trim();
  try {
    const searchResult = await registercollection.aggregate([
      {
        $match: {
          'orders.productName': { $regex: new RegExp('^' + payload + '.*', 'i') }
        }
      },
      {
        $unwind: '$orders'
      },
      {
        $match: {
          'orders.productName': { $regex: new RegExp('^' + payload + '.*', 'i') }
        }
      },
      {
        $project: {
          date: '$orders.date',
          images: '$orders.images',
          _id: '$orders._id',
          productName: '$orders.productName'
        }
      }
    ]).exec();

    const searchResult1 = searchResult.slice(0, 5)

    res.send({ payload: searchResult1 });

  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).send({ error: 'An error occurred during the search.' });
  }
};


const ordersearchdetails = async (req, res) => {
  const id1 = req.params.id;
  const id = id1.replace(":", "");
  const email = req.session.user

  try {
    const data = await registercollection.findOne(
      { email: email, 'orders._id': id },
      { 'orders.$': 1 }
    );
    res.render('mainHome/orderssearch', { order: data });

  } catch (error) {
    console.error('Error searching for order:', error);
    return res.status(500).json({ error: 'An error occurred while searching for the order.' });
  }
};



// ---------------------invoice--------------------------


const myinvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    const email = req.session.user;

    const userdata = await registercollection.findOne({ email: email, });

    const username = userdata.name
    console.log(username);


    if (!userdata) {
      return res.status(404).json({ message: 'User not found' });
    }


    const order = await registercollection.findOne(
      {
        email: email,
        'orders._id': orderId
      },
      {
        'orders.$': 1 // This projection selects the first matching subdocument in the orders array
      }
    );  
    if (order) {
      // const address = order.orders[0].address; // Assuming there's only one address per order
      
      // console.log('Address:', address);
    } else {
      console.log('Order not found.');
    }


    // const order = userdata.orders.find((order) => order._id.equals(orderId));
    // if (!order) {
    //   return res.status(404).json({ message: 'Order not found' });
    // }

    // const address2 = userdata.Address.find((address2) => address2._id.equals(new ObjectId(address1)));

    // console.log('address',address2);
    // console.log('order',order)
    // const username = username;
    const address = order.orders[0].address.address1
    const pincode = order.orders[0].address.zip
    const city = order.orders[0].address.city
    const district = order.orders[0].address.city
    const productName = order.orders[0].productName;
    const quantity = order.orders[0].quantity;
    const total = order.orders[0].total
    const price1 = order.orders[0].totalprice
    const price = parseInt(price1.replace('₹', ''), 10)
    const grandtotal=  price*quantity

    console.log(grandtotal);
    
    
    console.log(price);
    const data={
      address,pincode,city,productName,quantity,price,username,grandtotal
    }

    res.json(data)

  }
  catch (err) {
    console.log('lllll');
    console.error('Error :', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}




module.exports = {
  myorders, pagenationorders, search, ordersearchdetails,myinvoice
}