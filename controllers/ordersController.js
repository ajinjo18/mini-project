const registercollection = require('../model/registerSchema')
const productCollection = require('../model/productSchema')



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




module.exports = {
  myorders, pagenationorders, search, ordersearchdetails
}