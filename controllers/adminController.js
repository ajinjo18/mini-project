require('dotenv').config();

const registercollection = require('../model/registerSchema')
const coupencollection = require('../model/coupenSchema')
const returnproductCollection = require('../model/returnproductSchema')

const excel = require('exceljs')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const categorycollection = require('../model/categorySchema');
const productCollection = require('../model/productSchema');


const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD


// -----------get login------------

const getLogin = (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin/home')
    }
    else {
        res.render('admin/login')
    }
}


// -----------------post login---------------

const postLogin = (req, res) => {
    if (req.body.email == email && req.body.password == password) {
        req.session.admin = email
        res.redirect('/admin/home')
    }
    else {
        res.redirect('/admin')
    }
}


// ---------------get home-----------

const gethome = async(req, res) => {

    let result1
    let totalOrdersCount = 0;
    let ordersbymonth
    let orderCountsArray

    await registercollection.aggregate([
        {
          $project: {
            _id: 1,
            ordersCount: { $size: '$orders' } // Count the number of orders for each user
          }
        }
      ])
      .exec()
      .then(result => {
        result1 = result
      })
      .catch(error => {
        console.error('Error:', error);
    });

    for (const item of result1) {
    totalOrdersCount += item.ordersCount;
    }

    console.log(totalOrdersCount);
      



    // const desiredMonth = 10; // October

    // const pipeline = [
    //   {
    //     $unwind: '$orders' // Flatten the orders array
    //   },
    //   {
    //     $project: {
    //       address: '$orders.address',
    //       razorpay_order_Payment_Id: '$orders.razorpay_order_Payment_Id',
    //       total: '$orders.total',
    //       payment: '$orders.payment',
    //       date: '$orders.date',
    //       productName: '$orders.productName',
    //       quantity: '$orders.quantity',
    //       productid: '$orders.productid',
    //       totalprice: '$orders.totalprice',
    //       images: '$orders.images',
    //       status: '$orders.status',
    //       coupendiscount: '$orders.coupendiscount'
    //     }
    //   },
    //   {
    //     $addFields: {
    //       month: { $month: '$date' } // Extract the month from the date
    //     }
    //   },
    //   {
    //     $match: {
    //       month: desiredMonth
    //     }
    //   }
    // ];
    
    // registercollection.aggregate(pipeline)
    //   .then(result => {
    //     console.log('Orders in the desired month:', result);
    //     ordersbymonth = result.length
    //   })
    //   .catch(error => {
    //     console.error('Error:', error);
    //   });
    


    const pipeline = [
        {
          $unwind: '$orders' // Flatten the orders array
        },
        {
          $project: {
            month: { $month: '$orders.date' } // Extract the month from the date
          }
        },
        {
          $group: {
            _id: '$month', // Group by month
            ordersCount: { $sum: 1 } // Count the number of orders for each month
          }
        }
      ];
      
      registercollection.aggregate(pipeline)
        .then(result => {
            ordersbymonth = result
        //   console.log('Orders count for each month:', result);
        })
        .catch(error => {
          console.error('Error:', error);
        });

        // req.session.ttl=result
        // resultArray.push(result);

        setTimeout(() => {
            // console.log('Accessing result after a delay:', ordersbymonth);
            orderCountsArray = Array(12).fill(0);
          
            // Iterate over the result array and update the order counts in the correct positions
            ordersbymonth.forEach(monthData => {
              const monthIndex = monthData._id - 1; // Months are 1-indexed, adjust to 0-indexed
              orderCountsArray[monthIndex] = monthData.ordersCount;
            });
            
            // console.log('Order counts for each month:', orderCountsArray);

            if (req.session.admin) {
                res.render('admin/adminhome',{totalOrdersCount})
            }
            else {
                res.redirect('/admin')
            }
          }, 2000);

        // const result = [
        //     { _id: 10, ordersCount: 3 },
        //     // ... other months
        //   ]; // Result from the aggregation
          
          // Initialize an array to hold order counts for each month (January to December)
         
          
      




    // const dateString = "2023-10-16T11:50:32.512+00:00";
    // const dateObject = new Date(dateString);

    // // Extract the month (0-indexed, so January is 0 and October is 9)
    // const month = dateObject.getUTCMonth() + 1; // Adding 1 to match human-readable month (1-12)

    // console.log('Month:', month);




    
}


// --------------all users--------------


const allUsers = async (req, res) => {
    try {
        const users = await registercollection.find({}, { name: 1, email: 1, _id: 1, blocked: 1 })
        if (req.session.admin) {
            res.render('admin/allusers', { users })
        }
        else {
            res.redirect('/')
        }
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}



// --------------block--------------


const block = async (req, res) => {
    try {
        const id = req.params._id
        const updatedata = {
            blocked: 'true',
        }
        await registercollection.updateOne({ _id: id }, { $set: updatedata })
        res.redirect('/admin/users')
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// -------------------unblock--------------


const unblock = async (req, res) => {
    try {
        const id = req.params._id
        const updatedata = {
            blocked: 'false',
        }
        await registercollection.updateOne({ _id: id }, { $set: updatedata })
        res.redirect('/admin/users')
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// --------------------get order-----------------


const getorders=async(req,res)=>{
    try {

        const users = await registercollection.find({}, { orders: 1 })

        res.render('admin/orders', { orders: users});
      } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Internal Server Error');
      }
}


// ---------------post order status-------------

const orderstatus = async (req, res) => {
    const { orderid, status } = req.body;


    try {
        const updatedUser = await registercollection.findOneAndUpdate(
            { 'orders._id': orderid },
            { $set: { 'orders.$.status': status } },
            { new: true } 
          );
        
        res.status(200).json({ message: 'Status updated successfully', updatedUser });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// ---------------------list coupen-----------------

const listcoupen = async(req,res)=>{
    const coupens = await coupencollection.find()
    res.render('admin/listcoupens',{coupens})
}


// ----------------------add coupens(get)--------------------

const addcoupens = (req,res)=>{
    res.render('admin/addcoupen')
}

// ----------------------add coupens(post)--------------------

const postcoupens = async(req,res)=>{
    try{
        const data={
            code: req.body.code,
            discount: req.body.discount,
            minvalue: req.body.minvalue,
            expirydate: req.body.expirydate,
            discription: req.body.description
        }
        await coupencollection.insertMany(data)
        res.redirect('/admin/listcoupen')
    }
    catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// ------------------------updatecoupen(post)------------------


const updatecoupen = async(req,res)=>{
    try{
        const id = req.body.id
        const data={
            code: req.body.code,
            discount: req.body.discount,
            minvalue: req.body.minvalue,
            expirydate: req.body.expirydate,
            discription: req.body.discription
        }
        await coupencollection.updateOne({_id:id},{$set : data})
        res.redirect('/admin/listcoupen')
    }
    catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Internal server error' });
      } 
}


// ----------------------deletecoupen---------------------

const deletecoupen = async(req,res)=>{
    const id = req.params.id
    try {
        await coupencollection.deleteOne( {_id:id});     
        res.redirect('/admin/listcoupen')        
      }
      catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Internal server error' });
      } 
}


// ----------------------return orders---------------------

const returnorder = async (req,res)=>{ 
    const returnproduct = await returnproductCollection.find()
    res.render('admin/returnorders',{returnproduct})
}

// -----------------approve return request--------------

const approverefund = async (req,res)=>{
    const id = req.params.id
    const orderid1 = await returnproductCollection.findOne({_id:id})
    const orderid = orderid1.orderid
    const email = orderid1.user

    const order1 = await registercollection.findOne(
        { 'orders._id': orderid },
        { 'orders.$': 1, _id: 0 } 
      );

      console.log(order1);
    const amount1 = order1.orders[0].totalprice
    const amount2 = parseFloat(amount1.replace(/[^\d.]/g, ''));

    console.log(amount2);

    await returnproductCollection.findByIdAndUpdate(id, { status: 'Return approved' }, { new: true })
    .then(updatedReturn => {
        if (updatedReturn) {
            console.log('Return status updated successfully:', updatedReturn);
        } else {
            console.log('No return found with the provided ID.');
        }
    })
    .catch(error => {
        console.error('Error updating return status:', error);
    });

    const updatedUser = await registercollection.findOneAndUpdate(
        { 'orders._id': orderid },
        { $set: { 'orders.$.status': 'Return successfully' } },
        {
          new: true,
        }
    );

    const order = await registercollection.findOne(
        { 'orders._id': orderid },
        { 'orders.$': 1, _id: 0 } 
      );
      
      const coupendiscount = order && order.orders[0] ? order.orders[0].coupendiscount : null;
      
      console.log('Coupon Discount for order:', coupendiscount);
      
      let newtotal
      let data1
  
        if(coupendiscount != null){
          newtotal =+ amount2-coupendiscount
          data1 = {
            productname : order1.orders[0].productname,
            payment : order1.orders[0].payment,
            amount : amount2-coupendiscount,
            orderid : order1.orders[0].orderid,
            status : 'credited'
          }
          await registercollection.findOneAndUpdate(
            {email:email},
            {$inc:{'wallet.total':newtotal}}
          )
        }else{
          newtotal =+ amount2
          data1 = {
            productname : order1.orders[0].productname,
            payment : order1.orders[0].payment,
            amount : amount2,
            orderid : order1.orders[0].orderid,
            status : 'credited'
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

    res.redirect('/admin/return')

}



// -----------------reject return request----------------


const rejectreturn = async (req,res)=>{
    const id = req.params.id

    const orderid1 = await returnproductCollection.findOne({_id:id})
    const orderid = orderid1.orderid


    await returnproductCollection.findByIdAndUpdate(id, { status: 'Return rejected' }, { new: true })
    .then(updatedReturn => {
        if (updatedReturn) {
            console.log('Return status updated successfully:', updatedReturn);
        } else {
            console.log('No return found with the provided ID.');
        }
    })
    .catch(error => {
        console.error('Error updating return status:', error);
    });

    const updatedUser = await registercollection.findOneAndUpdate(
        { 'orders._id': orderid },
        { $set: { 'orders.$.status': 'Return rejected' } },
        {
          new: true,
        }
    );

    res.redirect('/admin/return')

}



// ------------------------reports----------------------

const reports = async(req,res)=>{
    res.render('admin/report')
}



// ------------------------sales excel download----------------------


const excelreport = async(req, res) => {

    const date1 = req.body.selectedDate

    if(date1==''){
        return;
    }

    const selectedDate = new Date(date1); // Replace with the desired selected date

    const pipeline = [
        {
            $unwind: '$orders' // Flatten the orders array
        },
        {
            $match: {
                'orders.date': {
                    $gte: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()),
                    $lt: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1)
                }
            }
        }
    ];

    try {
        const result = await registercollection.aggregate(pipeline)

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.addRow(['date', 'Product', 'Quantity', 'Price']);

        if(result==''){
            return;
        }

        result.forEach(order => {
            const productName = order.orders.productName;
            const quantity = order.orders.quantity;
            const totalprice = order.orders.totalprice;
            const date = order.orders.date

            const dateObject = new Date(date);
            const year = dateObject.getFullYear();
            const month = ('0' + (dateObject.getMonth() + 1)).slice(-2); // Adding 1 as months are zero-based
            const day = ('0' + dateObject.getDate()).slice(-2);

            const extractedDate = `${year}-${month}-${day}`;
          
            // Use the extracted information as needed
            console.log('Date:', extractedDate);
            console.log('Product Name:', productName);
            console.log('Quantity:', quantity);
            console.log('Total Price:', totalprice);

            worksheet.addRow([extractedDate, productName, quantity, totalprice]);

          });

        
    
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');


            workbook.xlsx.write(res)
            .then(() => {
            res.status(200).end();
            })
            .catch(error => {
            console.error('Error generating Excel:', error);
            res.status(500).send('Internal Server Error');
            });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




  


// ---------------------------stock excel report--------------------------



const stockreportexcel = async (req, res) => {
    try {
      const getCategoryProductStocks = async () => {
        // Aggregate the Product collection to group by category and sum the stock
        const aggregateResult = await productCollection.aggregate([
        {
            $group: {
            _id: '$category',
            totalStock: { $sum: '$stock' }
            }
        }
        ]);
    
        // Fetch the category details for each aggregated category
        const productsByCategory = await Promise.all(
        aggregateResult.map(async (result) => {
            const category = await categorycollection.findOne({ category: result._id });
            return { category: category, totalStock: result.totalStock };
        })
        );
  
        return productsByCategory;
      };
  
      const productsByCategory = await getCategoryProductStocks();
  
      const categories = productsByCategory.map(categoryProducts => categoryProducts.category.category);
      const totalStocks = productsByCategory.map(categoryProducts => categoryProducts.totalStock);
  
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('Stock Report');
  
      worksheet.addRow(['Category', 'Total Stock']);
  
      // Iterate through categories and totalStocks and add to the worksheet
      for (let i = 0; i < categories.length; i++) {
        worksheet.addRow([categories[i], totalStocks[i]]);
      }
  
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=stock_report.xlsx');
  
      workbook.xlsx.write(res)
        .then(() => {
          res.status(200).end();
        })
        .catch((error) => {
          console.error('Error generating Excel:', error);
          res.status(500).send('Internal Server Error');
        });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

        
// ---------------------------stock pdf report-------------------------------


const stockreportpdf = async (req, res) => {
    try {
      const getCategoryProductStocks = async () => {
        const aggregateResult = await productCollection.aggregate([
            {
                $group: {
                _id: '$category',
                totalStock: { $sum: '$stock' }
                }
            }
            ]);
        
            // Fetch the category details for each aggregated category
            const productsByCategory = await Promise.all(
            aggregateResult.map(async (result) => {
                const category = await categorycollection.findOne({ category: result._id });
                return { category: category, totalStock: result.totalStock };
            })
            );
  
        return productsByCategory;
      };
  
      const productsByCategory = await getCategoryProductStocks();
  
      const categories = productsByCategory.map(categoryProducts => categoryProducts.category.category);
      const totalStocks = productsByCategory.map(categoryProducts => categoryProducts.totalStock);
  
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=stock_report.pdf');
  
      // Pipe the PDF content to the response for download
      doc.pipe(res);
  
      // Add content to the PDF
      doc.font('Helvetica').fontSize(16).text('Stock Report', { align: 'center' });
      doc.moveDown();
      for (let i = 0; i < categories.length; i++) {
        doc.font('Helvetica').fontSize(12).text(`Category: ${categories[i]}, Total Stock: ${totalStocks[i]}`);
        doc.moveDown();
      }
  
      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  




// --------------------------cancelled orders report excell---------------------


const cancelledexcelreport = async (req, res) => {
    
    const date1 = req.body.selectedDate    

    console.log(date1);
    if (!date1) {
        return;
    }

    const selectedDate = new Date(date1);

    const pipeline = [
        {
            $unwind: '$orders'
        },
        {
            $match: {
                'orders.date': {
                    $gte: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()),
                    $lt: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1)
                },
                'orders.status': 'Cancelled' // Include only orders with status "Cancelled"
            }
        }
    ];

    try {
        const result = await registercollection.aggregate(pipeline);

        if (!result.length) {
            return;
        }

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Cancelled Sales Report');

        // Define columns
        worksheet.columns = [
            { header: 'Product Name', key: 'productName', width: 30 },
            { header: 'Quantity', key: 'quantity', width: 15 },
            { header: 'Total Price', key: 'totalPrice', width: 20 }
        ];

        // Add rows for each cancelled order
        result.forEach(order => {
            const productName = order.orders.productName;
            const quantity = order.orders.quantity;
            const totalprice = order.orders.totalprice;

            worksheet.addRow({
                productName: productName || 'N/A',
                quantity: quantity || 0,
                totalPrice: totalprice || 'N/A'
            });
        });

        const fileName = `cancelled_sales_report_${selectedDate}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// --------------------------cancelled order pdf------------------------


const cancelledpdfreport = async (req, res) => {
    const date1 = req.body.selectedDate;

    if (!date1) {
        return;
    }

    const selectedDate = new Date(date1);

    const pipeline = [
        {
            $unwind: '$orders'
        },
        {
            $match: {
                'orders.date': {
                    $gte: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()),
                    $lt: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1)
                },
                'orders.status': 'Cancelled' // Include only orders with status "Cancelled"
            }
        }
    ];

    try {
        const result = await registercollection.aggregate(pipeline);

        if(result==''){
            return;
        }

        const doc = new PDFDocument();
        const fileName = `sales_report_${selectedDate}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        doc.pipe(res);

        doc.fontSize(16).text('Cancelled Sales Report', { align: 'center' });

        result.forEach(order => {
            const productName = order.orders.productName;
            const quantity = order.orders.quantity;
            const totalprice = order.orders.totalprice;

            doc.font('Helvetica').fontSize(12).text(`Product: ${productName}, Quantity: ${quantity}, Total Price: ${totalprice}, Status: Cancelled`);
        });

        doc.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};








// ------------------------sales day pdf----------------------


const salepdfreport = async(req,res)=>{
    const date1 = req.body.selectedDate

    if(date1==''){
        return;
    }

    const selectedDate = new Date(date1); // Replace with the desired selected date

    const pipeline = [
        {
            $unwind: '$orders' // Flatten the orders array
        },
        {
            $match: {
                'orders.date': {
                    $gte: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()),
                    $lt: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1)
                }
            }
        }
    ];

    try {
        const result = await registercollection.aggregate(pipeline)

        const doc = new PDFDocument();
        const fileName = `sales_report_${selectedDate}.pdf`;

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Pipe the PDF content to the response for download
        doc.pipe(res);

        doc.fontSize(16).text('Sales Report', { align: 'center' });

        // Add data to the PDF
        result.forEach(order => {
        const productName = order.orders.productName;
        const quantity = order.orders.quantity;
        const totalprice = order.orders.totalprice;

        doc.font('Helvetica').fontSize(12).text(`Product: ${productName}, Quantity: ${quantity}, Total Price: ${totalprice}`);
        });

        // Finalize the PDF
        doc.end();
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}




// ----------------------------sales month pdf-----------------------------



const monthsalepdfreport = async (req, res) => {
    const { selectedDate } = req.body;

    if (!selectedDate) {
        return res.status(400).json({ error: 'Selected date is required.' });
    }

    // Get the month (zero-based) for the selected date
    const selectedMonth = new Date(selectedDate).getMonth();

    // Handle the case when the month is 9 (October)
    const matchCondition = selectedMonth === 9 ? 
        { $or: [{ orderMonth: 9 }, { orderMonth: 10 }] } : 
        { orderMonth: selectedMonth };

    const pipeline = [
        {
            $unwind: '$orders'
        },
        {
            $addFields: {
                orderMonth: { $month: '$orders.date' }  // Extract the month from the order date
            }
        },
        {
            $match: matchCondition
        }
    ];

    try {
        const result = await registercollection.aggregate(pipeline)
        if(result==''){
            return;
        }

        const doc = new PDFDocument();
        const fileName = `sales_report_${selectedDate}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        doc.pipe(res);

        doc.fontSize(16).text('Sales Report', { align: 'center' });

        result.forEach(order => {
            const productName = order.orders.productName;
            const quantity = order.orders.quantity;
            const totalprice = order.orders.totalprice;

            doc.font('Helvetica').fontSize(12).text(`Product: ${productName}, Quantity: ${quantity}, Total Price: ${totalprice}`);
        });

        doc.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// -----------------------------sale year pdf-------------------------------


const yearalepdfreport = async (req, res) => {
    const { selectedDate } = req.body;

    if (!selectedDate) {
        return res.status(400).json({ error: 'Selected date is required.' });
    }

    const selectedYear = new Date(selectedDate).getFullYear(); // Get the year from the selected date

    const pipeline = [
        {
            $unwind: '$orders'
        },
        {
            $addFields: {
                orderYear: { $year: '$orders.date' }  // Extract the year from the order date
            }
        },
        {
            $match: { orderYear: selectedYear }  // Match the extracted year with the selected year
        }
    ];

    try {
        const result = await registercollection.aggregate(pipeline);

        if (result.length === 0) {
            return res.status(404).json({ error: 'No orders found for the selected year.' });
        }

        const doc = new PDFDocument();
        const fileName = `sales_report_${selectedYear}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        doc.pipe(res);

        doc.fontSize(16).text(`Sales Report for ${selectedYear}`, { align: 'center' });

        result.forEach(order => {
            const productName = order.orders.productName;
            const quantity = order.orders.quantity;
            const totalprice = order.orders.totalprice;

            doc.font('Helvetica').fontSize(12).text(`Product: ${productName}, Quantity: ${quantity}, Total Price: ${totalprice}`);
        });

        doc.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




// --------------------------sales day excel------------------------------



const generateExcelReportDay = async (req, res) => {
    const { selectedDate } = req.body;

    if (!selectedDate) {
        return res.status(400).json({ error: 'Selected date is required.' });
    }

    const selectedDateTime = new Date(selectedDate);
    const startDate = new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), selectedDateTime.getDate());
    const endDate = new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), selectedDateTime.getDate() + 1);

    const pipeline = [
        {
            $unwind: '$orders'
        },
        {
            $match: {
                'orders.date': {
                    $gte: startDate,
                    $lt: endDate
                }
            }
        }
    ];

    try {
        const result = await registercollection.aggregate(pipeline);

        if(result ==''){
            return;
        }

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Product Name', key: 'productName', width: 30 },
            { header: 'Quantity', key: 'quantity', width: 15 },
            { header: 'Total Price', key: 'totalPrice', width: 20 },
        ];

        result.forEach(order => {
            const productName = order.orders.productName;
            const quantity = order.orders.quantity;
            const totalprice = order.orders.totalprice;

            worksheet.addRow({ productName, quantity, totalPrice: totalprice });
        });

        const fileName = `sales_report_${selectedDate}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// ------------------------sales month excell-------------------------


const generateExcelReportMonth = async (req, res) => {
   
    const { selectedDate } = req.body;

    if (!selectedDate) {
        return res.status(400).json({ error: 'Selected date is required.' });
    }

    // Get the month (zero-based) for the selected date
    const selectedMonth = new Date(selectedDate).getMonth();

    // Handle the case when the month is 9 (October)
    const matchCondition = selectedMonth === 9 ? 
        { $or: [{ orderMonth: 9 }, { orderMonth: 10 }] } : 
        { orderMonth: selectedMonth };

    const pipeline = [
        {
            $unwind: '$orders'
        },
        {
            $addFields: {
                orderMonth: { $month: '$orders.date' }  // Extract the month from the order date
            }
        },
        {
            $match: matchCondition
        }
    ];

    try {
        const result = await registercollection.aggregate(pipeline)
        if(result==''){
            return;
        }

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Product Name', key: 'productName', width: 30 },
            { header: 'Quantity', key: 'quantity', width: 15 },
            { header: 'Total Price', key: 'totalPrice', width: 20 },
        ];

        result.forEach(order => {
            const productName = order.orders.productName;
            const quantity = order.orders.quantity;
            const totalprice = order.orders.totalprice;

            worksheet.addRow({ productName, quantity, totalPrice: totalprice });
        });

        const fileName = `sales_report_${selectedDate}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// ---------------------------sales year excell---------------------------


const yearaleexcellreport = async (req, res) => {
    const { selectedDate } = req.body;

    if (!selectedDate) {
        return res.status(400).json({ error: 'Selected date is required.' });
    }

    const selectedYear = new Date(selectedDate).getFullYear(); // Get the year from the selected date

    const pipeline = [
        {
            $unwind: '$orders'
        },
        {
            $addFields: {
                orderYear: { $year: '$orders.date' }  // Extract the year from the order date
            }
        },
        {
            $match: { orderYear: selectedYear }  // Match the extracted year with the selected year
        }
    ];

    try {
        const result = await registercollection.aggregate(pipeline);
        if(result==''){
            return;
        }

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Product Name', key: 'productName', width: 30 },
            { header: 'Quantity', key: 'quantity', width: 15 },
            { header: 'Total Price', key: 'totalPrice', width: 20 },
        ];

        result.forEach(order => {
            const productName = order.orders.productName;
            const quantity = order.orders.quantity;
            const totalprice = order.orders.totalprice;

            worksheet.addRow({ productName, quantity, totalPrice: totalprice });
        });

        const fileName = `sales_report_${selectedDate}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// ----------------logout------------------

const logout = (req, res) => {
    try{
        if(req.session.admin){
            req.session.admin=null
            res.redirect('/admin')
        }
        else{
            res.redirect('/')
        }
    // req.session.destroy((err) => {
    //     if (err) {
    //         res.send(err.message)
    //     } else {
    //         res.redirect('/')
    //     }
    // })
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = {
    getLogin, postLogin, allUsers, block, unblock, gethome, logout,getorders,
    orderstatus,listcoupen,addcoupens,postcoupens,updatecoupen,deletecoupen,returnorder,
    excelreport,reports,salepdfreport,stockreportexcel,stockreportpdf,cancelledexcelreport,
    cancelledpdfreport,monthsalepdfreport,yearalepdfreport,generateExcelReportDay,
    generateExcelReportMonth,yearaleexcellreport,approverefund,rejectreturn
}