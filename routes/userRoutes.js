const express = require('express')
const router = express.Router()
const path = require('path')


const user=require('../controllers/userController')



router.get('/login',user.login)
router.post('/login',user.userlogin)

router.get('/register',user.register)
router.post('/register',user.postregisteration)

router.get('/registerotp',user.registerotpgenerator)
router.get('/getotp',user.getregiserotp)
router.post('/otp',user.postregisterotp)


router.get('/forget',user.userforget)
router.post('/verify',user.verifyForgetUser)
router.post('/resetpassword',user.resetPassword)
router.get('/forgetotp',user.getforgetotp)
router.get('/newpassword',user.getnewpassword)
router.get('/otpgenerator',user.otpgenerator)
router.post('/updatepassword',user.updatepassword)

router.get('/logout',user.logout)



module.exports=router