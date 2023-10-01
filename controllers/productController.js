const productCollection = require('../model/productSchema')
const categorycollection = require('../model/categorySchema')



// -----------------get add product-------------------


const addproduct = async(req, res) => {
    const categories = await categorycollection.find({}, 'category');
    res.render('admin/addproduct',{ category: categories })
}



// -----------------------post add product--------------------


const postaddproduct = async (req, res) => {
    try {
        const data = {
            productname: req.body.productname,
            stock: req.body.stockquantity,
            price: req.body.price,
            description: req.body.description,
            images: req.files.map(file => file.filename),
            category: req.body.productcategory
        }
        await productCollection.insertMany([data])
        req.session.productadded = {
            message: "Successfully Added",
            type: 'success'
        }
        res.redirect('/admin/allproducts')
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// -----------------list all products---------------


const allproducts = async (req, res) => {
    try {
        const productupdated = req.session.productupdated
        req.session.productupdated = null

        const productdeleted = req.session.productdeleted
        req.session.productdeleted = null

        const productadded=req.session.productadded
        req.session.productadded=null

        const product = await productCollection.find()
        res.render('admin/allproduct', { product,productupdated,productdeleted,productadded})
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}



// -------------------get edit product------------------


const productupdate = async (req, res) => {
    try {
        const categories = await categorycollection.find({}, 'category');
        const id = req.params.id
        const product = await productCollection.findOne({ _id: id })
        res.render('admin/editproduct', { product,category: categories })
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}



// ----------------------post edit product--------------------


const postproductupdate = async (req, res) => {
    try {
        const id = req.body.id
        const files = req.files

        if (!files || Object.keys(files).length === 0) {
            const data = {
                productname: req.body.productname,
                stock: req.body.stockquantity,
                price: req.body.price,
                description: req.body.description,
                category: req.body.productcategory
            }
            await productCollection.updateOne({ _id: id }, { $set: data })
            req.session.productupdated = {
                message: "Successfully Updatd",
                type: 'success'
            }
            res.redirect('/admin/allproducts')
        }
        else{
            const image=req.files.map(file => file.filename)
            const data = {
                productname: req.body.productname,
                stock: req.body.stockquantity,
                price: req.body.price,
                description: req.body.description,
                category: req.body.productcategory
            }
            await productCollection.updateOne({ _id: id }, { $set: data })
            console.log(image);
            await productCollection.findByIdAndUpdate(
                id,
                { $push: { images: { $each: image } } },
                { new: true }
            );
            req.session.productupdated = {
                message: "Successfully Updatd",
                type: 'success'
            }
            res.redirect('/admin/allproducts')
        }
        
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// ------------------delete product----------------


const productdelete = async (req, res) => {
    try {
        const id = req.params.id
        await productCollection.deleteOne({ _id: id })
        req.session.productdeleted = {
            message: "Successfully Deleted",
            type: 'success'
        }
        res.redirect('/admin/allproducts')
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}



// ------------------delete product img----------------


const productimgdelete=async(req,res)=>{
    try {
        const element = req.params.element;
        const productId = req.params.productId;
        const updatedProduct = await productCollection.findByIdAndUpdate(
            productId,
            { $pull: { images: element } },
            { new: true }
        );
        console.log('Image removed successfully:', updatedProduct);
        res.redirect(`/admin/updateproduct/${productId}`);
    } catch (error) {
        console.error('Error removing image:', error);
        res.status(500).send('Error removing image');
    }

}


module.exports={
    addproduct,postaddproduct,allproducts,productupdate,postproductupdate,
    productdelete,productimgdelete
}