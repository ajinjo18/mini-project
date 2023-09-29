const express = require('express')
const router = express.Router()


const mainHome = require('../controllers/mainHomeController')
const user = require('../middleware/user')
const cart =require('../controllers/cartController')
const addtocart=require('../controllers/addtocartController')
const profile=require('../controllers/userProfileController')
const { route } = require('./userRoutes')
const myorders=require('../controllers/ordersController')


router.get('/',user.isUserBlocked,mainHome.home)
router.get('/shop',mainHome.shop)
router.get('/cart',user.isUserLogged,user.isUserBlocked,cart.getcart)
router.get('/addcart/:id',user.isUserLogged,user.isUserBlocked,addtocart.addtocart)
router.get('/profile',profile.getprofile)
router.get('/editprofile',profile.geteditprofile)
router.post('/editprofile',profile.posteditprofile)
// router.get('/otp',profile.getotp)
// router.post('/otp',profile.postotp)
// router.get('/resendotp',profile.otpgenerator)

router.post('/cart/:id',cart.postcart)
// router.post('/cart',cart.postcart)

router.get('/checkout',user.isUserLogged,user.isUserBlocked,cart.getcheckout)
router.get('/deletecart/:id',user.isUserLogged,user.isUserBlocked,cart.getdeletecart)

router.get('/productview/:id',mainHome.getproductview)

router.get('/category/:id',mainHome.category)
router.post('/addaddress',cart.addaddress)
router.post('/placeorder',cart.placeorder)
router.get('/thankyou',cart.thankyou)

router.get('/orders',myorders.myorders)
router.get('/address',mainHome.address)
router.post('/addnewaddress',mainHome.postaddress)
router.post('/updateaddrress',mainHome.updateaddress)

router.post('/deleteaddrress',mainHome.deleteaddrress)

router.get('/cancelorder/:id',mainHome.cancelorder)

module.exports=router