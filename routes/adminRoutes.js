const express = require('express')
const router = express.Router()

const upload=require('../model/multerConfigure')

const admin=require('../controllers/adminController')
const product=require('../controllers/productController')
const category=require('../controllers/categoryController')
const banner=require('../controllers/bannerController')
const chart= require('../controllers/chart')

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

router.get('/bannerc',banner.getbannerC)
router.post('/editbannerc/:id',upload.single('productimage'),banner.editbannerc)

router.get('/offerbaner',banner.offerbaner)
router.post('/offersale/:id',banner.offersalepost)

router.get('/return',admin.returnorder)

router.get('/sales-data',chart.sales)
router.get('/revenue',chart.revenue)
router.get('/saleyearly',chart.saleyearly)

router.get('/report',admin.reports)

// --------------------sale pdf report----------------
router.post('/generate-excel',admin.excelreport)
router.post('/generate-pdf-report',admin.salepdfreport)
router.post('/month-pdf-report',admin.monthsalepdfreport)
router.post('/yearsalepdfreport',admin.yearalepdfreport)

// ----------------------sale excel report---------------
router.post('/daysaleexcellreport',admin.generateExcelReportDay)
router.post('/generate-excel-report-month',admin.generateExcelReportMonth)
router.post('/generate-excel-report-year',admin.yearaleexcellreport)


router.post('/stock-report-excel',admin.stockreportexcel)
router.post('/stock-report-pdf',admin.stockreportpdf)

router.post('/cancelledexcelreport',admin.cancelledexcelreport)
router.post('/salepdfreport',admin.cancelledpdfreport)

router.get('/approverefund/:id',admin.approverefund);
router.get('/rejectreturn/:id',admin.rejectreturn)

router.get('/logout',admin.logout)


module.exports=router