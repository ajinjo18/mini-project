const bannercategorycollection = require('../model/bannercategorySchema')
const categorycollection = require('../model/categorySchema')
const offersalecollection = require('../model/offerbannerSchema')
const { login } = require('./userController')


const getbannerC = async(req,res)=>{
    const bannerC = await bannercategorycollection.find()
    const category = await categorycollection.find()
    res.render('admin/bannercategory',{category ,bannerC})
}

const editbannerc = async(req,res)=>{
    try{
        const id = req.params.id
        const data = {
            category : req.body.category,
            description : req.body.description,
            image : req.file.filename
        }
        await bannercategorycollection.findByIdAndUpdate(id,{$set:data})
        res.redirect('/admin/bannerc')
    }
    catch{
        res.redirect('/admin/bannerc')
    }
}

const offerbaner = async(req,res)=>{
    const offerbaner = await offersalecollection.find()
    res.render('admin/offersalebanner',{offerbaner})
}

const offersalepost = async (req, res) => {
    const id = req.params.id
    console.log(id);
    const data = {
        sale: req.body.sale,
        discount: req.body.discount,
        day: req.body.day,
        hour: req.body.hour,
        min: req.body.min,
        sec: req.body.sec,
    };

    try {
        await offersalecollection.findByIdAndUpdate(id, data, { new: true });
        res.redirect('/admin/offerbaner');
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports = {
    getbannerC , editbannerc,offerbaner,offersalepost
}