const registercollection = require('../model/registerSchema')
const productCollection = require('../model/productSchema')
const easyinvoice = require('easyinvoice')
const PDFDocument = require('pdfkit');
const path = require('path')
const fs = require('fs');


// ------------------get my orders-------------------

const myorders = async (req, res) => {
  const email = req.session.user;

  try {
    const pagenum = 0;
    const a = 5 * pagenum;
    const b = 5 * (pagenum + 1);

    const email = req.session.user;
    const user = await registercollection.findOne({ email: email });

    user.orders.sort((a, b) => b.date - a.date);

    const productsForFirstOrder = user.orders;

    const length = productsForFirstOrder.length;
    const pages = Math.ceil(length / 5);

    const limitedOrdersWithProducts = productsForFirstOrder.slice(a, b);

    res.render('mainHome/order', { orders: limitedOrdersWithProducts, pagenum, pages });
  } catch (error) {
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
    const user = await registercollection.findOne({ email: email })
    user.orders.sort((a, b) => b.date - a.date);
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

    const userdata = await registercollection.findOne({ email: email });

    if (!userdata) {
        return res.status(404).json({ message: 'User not found' });
    }

    const order = await registercollection.findOne(
        {
            email: email,
            'orders._id': orderId
        },
        {
            'orders.$': 1
        }
    );

    const username = userdata.name;
    const address = order.orders[0].address.address1;
    const pincode = order.orders[0].address.zip;
    const city = order.orders[0].address.city;
    const productName = order.orders[0].productName;
    const quantity = order.orders[0].quantity;
    const price1 = order.orders[0].totalprice;
    const price = parseInt(price1.replace('₹', ''), 10);
    const grandtotal = price * quantity;

    // Create a PDF stream and set response headers
    const pdfStream = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    
    // Pipe the PDF stream to the response
    pdfStream.pipe(res);

    // PDF content generation
    pdfStream.font('Helvetica-Bold').fontSize(14).text('Invoice', { align: 'center' });
    pdfStream.moveDown();

    // Customer Details
    pdfStream.font('Helvetica').fontSize(12).text(`Customer Name: ${username}`);
    pdfStream.text(`Address: ${address}`);
    pdfStream.text(`Pincode: ${pincode}`);
    pdfStream.text(`City: ${city}`);

    // Order Details
    pdfStream.moveDown();
    pdfStream.font('Helvetica-Bold').fontSize(12).text('Order Details');
    pdfStream.font('Helvetica').fontSize(12).text(`Product Name: ${productName}`);
    pdfStream.text(`Quantity: ${quantity}`);
    pdfStream.text(`Price per unit: ₹${price}`);
    pdfStream.text(`Total: ₹${grandtotal}`);

    pdfStream.moveDown();
    pdfStream.font('Helvetica-Bold').fontSize(12).text('Payment Details');
    // Add any payment details you want to display

    // Footer
    pdfStream.moveDown();
    pdfStream.font('Helvetica').text('Thank you for your purchase!');

    // End the PDF stream
    pdfStream.end();
} catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
}

}



// const myinvoice = async (req, res) => {
//   try {
//     const orderId = req.params.id;
//     const email = req.session.user;

//     const userdata = await registercollection.findOne({ email: email, });

//     const username = userdata.name

//     if (!userdata) {
//       return res.status(404).json({ message: 'User not found' });
//     }


//     const order = await registercollection.findOne(
//       {
//         email: email,
//         'orders._id': orderId
//       },
//       {
//         'orders.$': 1
//       }
//     );

//     const address = order.orders[0].address.address1
//     const pincode = order.orders[0].address.zip
//     const city = order.orders[0].address.city
//     const district = order.orders[0].address.city
//     const productName = order.orders[0].productName;
//     const quantity = order.orders[0].quantity;
//     const total = order.orders[0].total
//     const price1 = order.orders[0].totalprice
//     const price = parseInt(price1.replace('₹', ''), 10)
//     const grandtotal = price * quantity

//     const data = {
//       address, pincode, city, productName, quantity, price, username, grandtotal
//     }

//     res.json(data)

//   }
//   catch (err) {
//     console.error('Error :', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }




module.exports = {
  myorders, pagenationorders, search, ordersearchdetails, myinvoice
}