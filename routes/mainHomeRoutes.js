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
router.get('/paginationshop',mainHome.paginationshop)

router.get('/cart',user.isUserLogged,user.isUserBlocked,cart.getcart)
router.get('/addcart/:id',user.isUserLogged,user.isUserBlocked,addtocart.addtocart)

router.get('/profile',user.isUserLogged,user.isUserBlocked,profile.getprofile)
router.post('/editprofilepassword',mainHome.editprofilepassword)


router.post('/editprofile',profile.posteditprofile)
router.get('/2otp',profile.getotp)
router.post('/2otp',profile.postotp)
router.get('/resend2otp',profile.otpgenerator)

router.get('/otp',mainHome.getotp)
router.post('/otp',mainHome.postotp)
router.get('/resendotp',mainHome.otpgenerator)

router.post('/cart/:id',cart.postcart)

router.get('/checkout',user.isUserLogged,user.isUserBlocked,cart.getcheckout)
router.get('/deletecart/:id',user.isUserLogged,user.isUserBlocked,cart.getdeletecart)

router.get('/productview/:id',mainHome.getproductview)

router.get('/category/:id',mainHome.category)
router.post('/addaddress',cart.addaddress)
router.post('/placeorder',cart.placeorder)
router.post('/walletpayment',cart.walletpayment)
router.get('/thankyou',user.isUserLogged,user.isUserBlocked,cart.thankyou)

router.get('/orders',user.isUserLogged,user.isUserBlocked,myorders.myorders)
router.get('/orderspage',user.isUserLogged,user.isUserBlocked,myorders.pagenationorders)
router.post('/search',myorders.search)
router.get('/ordersearch/:id',user.isUserLogged,user.isUserBlocked,myorders.ordersearchdetails)

router.get('/address',user.isUserLogged,user.isUserBlocked,mainHome.address)
router.post('/addnewaddress',mainHome.postaddress)
router.post('/updateaddrress',mainHome.updateaddress)

router.post('/deleteaddrress',mainHome.deleteaddrress)

router.get('/cancelorder/:id',user.isUserLogged,user.isUserBlocked,mainHome.cancelorder)

router.post('/payorder',cart.razorpayorder)
router.post('/paymentdone',cart.paymentdone)

router.get('/wallet',profile.getwallet)

router.get('/viewfilerproduct/:min/:max/:sort',mainHome.viewfilerproduct)
router.post('/filterprice',mainHome.filterprice)

router.get('/sortedprice/:sort',mainHome.sortedprice)

router.get('/filteredcategory/:min/:max/:sort',mainHome.filteredcategory)
router.get('/categorysortedprice/:sort',mainHome.categorysortedprice)

router.post('/searchproduct',mainHome.searchproduct)

router.get('/return/:id',user.isUserLogged,user.isUserBlocked,mainHome.returnproduct)

router.get('/myinvoice/:id',myorders.myinvoice)


module.exports=router