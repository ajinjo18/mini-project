require('dotenv').config();

const registercollection = require('../model/registerSchema')
const coupencollection = require('../model/coupenSchema')


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

        const user1 = await registercollection.findOne({},{ orders: 1 });
        const user=user1.orders
 
        res.render('admin/orders', { orders: user});
      } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Internal Server Error');
      }
}


// ---------------post order status-------------

const orderstatus = async (req, res) => {
    const { orderid, status } = req.body;

    console.log(orderid);

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
    orderstatus,listcoupen,addcoupens,postcoupens,updatecoupen,deletecoupen   
}