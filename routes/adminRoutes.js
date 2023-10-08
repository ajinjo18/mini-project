const express = require('express')
const router = express.Router()

const upload=require('../model/multerConfigure')

const admin=require('../controllers/adminController')
const product=require('../controllers/productController')
const category=require('../controllers/categoryController')

const isadminlogged=require('../middleware/admin')


router.get('/',admin.getLogin)
router.post('/home',admin.postLogin)

router.get('/home',isadminlogged,admin.gethome)

router.get('/users',isadminlogged,admin.allUsers)
router.get('/block/:_id',isadminlogged,admin.block)
router.get('/unblock/:_id',isadminlogged,admin.unblock)

router.get('/listcatagories',isadminlogged,category.listcatagories)

router.get('/addcategory',isadminlogged,category.addcatagories)
router.post('/addcategory',category.postcatagories)

router.get('/updatecategory/:id',isadminlogged,category.updatecategory)
router.post('/updatecategory',category.postupdatecategory)

router.get('/delete/:id',isadminlogged,category.deletecategory)

router.get('/addproduct',isadminlogged,product.addproduct)
router.post('/addproduct',upload.array('productimage'),product.postaddproduct)


router.get('/allproducts',isadminlogged,product.allproducts)
router.get('/updateproduct/:id',isadminlogged,product.productupdate)
router.post('/editproduct',upload.array('productimage'),product.postproductupdate)

router.get('/productdelete/:id',isadminlogged,product.productdelete)
router.get('/deleteproductimg/:element/:productId',isadminlogged,product.productimgdelete)

router.get('/orders',admin.getorders)
router.post('/orderstatus',admin.orderstatus)

router.get('/listcoupen',admin.listcoupen)
router.get('/addcoupen',admin.addcoupens)
router.post('/addcoupen',admin.postcoupens)
router.post('/updatecoupen',admin.updatecoupen)
router.get('/deletecoupen/:id',admin.deletecoupen)

router.get('/logout',admin.logout)


module.exports=router