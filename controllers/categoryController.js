const categorycollection = require('../model/categorySchema')


// -----------------------add category(get)--------------------


const addcatagories = (req, res) => {
    const categoryidmatching=req.session.categoryidmatching
    req.session.categoryidmatching=null

    res.render('admin/addcategory',{categoryidmatching})
}


// -----------------------add category(post)--------------------

const postcatagories = async (req, res) => {
    try {
        const data = {
            discription: req.body.description,
            category: req.body.Category
        }
        await categorycollection.insertMany([data])
        req.session.categoryadded = {
            message: "Successfully Added",
            type: 'success'
        }
        res.redirect('/admin/listcatagories')    
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// -------------------list category-----------------


const listcatagories = async (req, res) => {
    try {
        const categoryadded=req.session.categoryadded
        req.session.categoryadded=null

        const categorydeleted=req.session.categorydeleted
        req.session.categorydeleted=null

        const categoryupdated=req.session.categoryupdated
        req.session.categoryupdated=null

        const catagorieslist = await categorycollection.find()
        res.render('admin/listcategory', { catagorieslist,categoryadded,categorydeleted,categoryupdated})
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}



// -----------------edit category(get)----------------------


const updatecategory = async (req, res) => {
    try {
        const id = req.params.id
        const category = await categorycollection.findOne({ _id: id })
        res.render('admin/editcategory', { category})
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// -----------------edit category(post)----------------------

const postupdatecategory = async (req, res) => {
    const id = req.body.id
    const check = await categorycollection.findOne({ _id: id })
    try {
        const data = {
            categoryID: req.body.categoryid,
            discription: req.body.description,
            product: req.body.productname,
            category: req.body.Category
        }
        await categorycollection.updateOne({ _id: id }, { $set: data })
        req.session.categoryupdated = {
            message: "Successfully Updated",
            type: 'success'
        }
        res.redirect('/admin/listcatagories')
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}



// ----------------delete category--------------


const deletecategory = async (req, res) => {
    const id = req.params.id
    try {
        await categorycollection.deleteOne({ _id: id })
        req.session.categorydeleted = {
            message: "Successfully Deleted",
            type: 'success'
        }
        res.redirect('/admin/listcatagories')
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }

}

module.exports={
    addcatagories,postcatagories,listcatagories,updatecategory,
    postupdatecategory,deletecategory
}