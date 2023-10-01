require('dotenv').config();

const registercollection = require('../model/registerSchema')


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

const gethome = (req, res) => {
    if (req.session.admin) {
        res.render('admin/adminhome')
    }
    else {
        res.redirect('/admin')
    }
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

        const user = await registercollection.findOne({},{ orders: 1 });
      
        const ordersWithProducts = user.orders.map((order) => ({
          id: order._id,
          address: order.address,
          total: order.total,
          payment: order.payment,
          products: order.product,
          productid: order.productid,
          images: order.images
        }));
        
    
        res.render('admin/orders', { orders: ordersWithProducts});
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
            { 'orders.product._id': orderid },
            { $set: { 'orders.$[i].product.$[j].status': status } },
            {
                new: true,
                arrayFilters: [
                    { 'i.product._id': orderid },
                    { 'j._id': orderid }
                ]
            }
        );
        
        res.status(200).json({ message: 'Status updated successfully', updatedUser });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
    getLogin, postLogin, allUsers, block, unblock, gethome, logout,getorders,orderstatus   
}