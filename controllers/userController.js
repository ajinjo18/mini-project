const registercollection = require('../model/registerSchema')
const coupencollection = require('../model/coupenSchema')

const nodemailer = require('nodemailer');
const generateOTP = require('generate-otp');
require('dotenv').config();


// ---------------node mailer--------------

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    },
});


// ---------------get login-------------------


const login = (req, res) => {
    const invaliduser = req.session.invaliduser
    req.session.invaliduser = null
    const passwordupdated = req.session.passwordupdated
    req.session.passwordupdated = null

    if (req.session.user) {
        res.redirect('/')
    }
    else {
        res.render('user/login', { invaliduser, passwordupdated })
    }

}


// ----------------post login---------------------


const userlogin = async (req, res) => {

    try {
        const check = await registercollection.findOne({ email: req.body.email })

        req.session.username = check.name
        const blocked = check.blocked
        if (check.password === req.body.password && blocked == 'false') {
            req.session.user = req.body.email
            req.session.userid = check._id
            res.redirect('/')
        }
        else {
            if (blocked == 'true') {
                req.session.invaliduser = {
                    message: 'Account Blocked',
                    type: 'danger'
                }
                res.redirect('/user/login')
            }
            else {
                req.session.invaliduser = {
                    message: 'Invaliduser',
                    type: 'danger'
                }
                res.redirect('/user/login')
            }
        }
    }
    catch {
        req.session.invaliduser = {
            message: 'Invaliduser',
            type: 'danger'
        }
        res.redirect('/user/login')
    }
}



// -----------------get register----------------


const register = (req, res) => {

    const userexist = req.session.userexist
    req.session.userexist = null

    const registered = req.query.success

    res.render('user/signup', { userexist, registered })
}



// ----------------post register otp--------------------


const getregiserotp = (req, res) => {

    const invalidregisterotp = req.query.message

    res.render('user/registerotp', { invalidregisterotp })
}



// ---------------------generate OTP--------------------


const postregisterotp = async (req, res) => {
    try{
        const registerotp = req.session.registerotp
        const otp = req.body.otp

        if (otp == registerotp) {
            const data = req.session.data
            const successMessage = 'Successfully Registered'
            await registercollection.insertMany([data])
            res.redirect(`/user/register?success=${encodeURIComponent(successMessage)}`)
        }
        else {
            invalidregisterotp = 'Invalid OTP'
            res.redirect(`/user/getotp?message=${encodeURIComponent(invalidregisterotp)}`)
        }
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}




// -------------------post register-------------------


const postregisteration = async (req, res) => {
    try {
        const check = await registercollection.findOne({ email: req.body.email })
        if (check.email === req.body.email) {
            req.session.userexist = {
                message: 'User Already Exist',
                type: 'danger'
            }
            res.redirect('/user/register')
        }
    }
    catch {
        req.session.registeremail = req.body.email
        req.session.data = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            blocked: req.body.isblocked
        }
        res.redirect('/user/registerotp')
    }

}


// -----------------register otp generator-------------


const registerotpgenerator = (req, res) => {

    const registeremail = req.session.registeremail

    req.session.trueregister = true
    const flag = req.session.trueregister

    if (flag) {
        const otp = generateOTP.generate(6, { digits: true, alphabets: false, specialChars: false });
        req.session.registerotp = otp

        const mailOptions = {
            from: 'testtdemoo11111@gmail.com',
            to: `${registeremail}`,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${otp}`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ' + error);
            }
            else {
                console.log('Email sent: ' + info.response);
                setTimeout(() => {
                    req.session.registerotp = null
                    req.session.trueregister = false
                }, 30000);

                setTimeout(() => {
                    req.session.newpasswordotp = null
                }, 30000);
            }
            res.redirect('/user/getotp')
        });

    }
    else {
        res.redirect('/user/getotp')
    }

}




// -------------------------------------Login---------------------------------



// ---------------get forgetpage--------------

const userforget = (req, res) => {
    const forgetinvaliduser = req.session.forgetinvaliduser
    req.session.forgetinvaliduser = null

    res.render('user/forgetpassword', { forgetinvaliduser })
}


// ------------------get newpassword----------------

const getnewpassword = (req, res) => {
    const passwordnotmatch = req.session.passwordnotmatch
    req.session.passwordnotmatch = null
    res.render('user/newpassword', { passwordnotmatch })
}


// -----------post verify new password user----------

const verifyForgetUser = async (req, res) => {
    req.session.updateemail = req.body.email
    const verifyuser = await registercollection.findOne({ email: req.body.email })

    if (verifyuser) {
        res.redirect('/user/newpassword')
    }
    else {
        req.session.forgetinvaliduser = {
            message: 'User Not Found',
            type: 'danger'
        }
        res.redirect('/user/forget')
    }

}


// ----------get forget OTP page--------

const getforgetotp = (req, res) => {
    const user = req.session.updateemail
    const invalidforgetotp = req.session.invalidforgetotp
    req.session.invalidforgetotp = null
    res.render('user/forgetOTP', { invalidforgetotp, user })
}



// ----------forget password OTP gnerator----------


const otpgenerator = (req, res) => {
    req.session.true = true
    const flag = req.session.true
    if (flag) {
        const updateemail = req.session.updateemail
        const newpasswordotp = generateOTP.generate(6, { digits: true, alphabets: false, specialChars: false });

        req.session.newpasswordotp = newpasswordotp

        const mailOptions = {
            from: 'testtdemoo11111@gmail.com',
            to: `${updateemail}`,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${newpasswordotp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ' + error);
            }
            else {
                console.log('Email sent: ' + info.response);
                setTimeout(() => {
                    req.session.newpasswordotp = null
                    req.session.true = false
                }, 30000);

                setTimeout(() => {
                    req.session.newpasswordotp = null
                }, 40000);
            }
        });
        res.redirect('/user/forgetotp')
    }
    else {
        res.redirect('/user/forgetotp')
    }

}


// -----------get reset password--------------

const resetPassword = (req, res) => {
    if (req.body.password == req.body.confirmpassword) {
        req.session.newpassword = req.body.password

        res.redirect('/user/otpgenerator')

    }
    else {
        req.session.passwordnotmatch = {
            message: 'Password Not Matching',
            type: 'danger'
        }
        res.redirect('/user/newpassword')
    }
}



// --------------update password--------------

const updatepassword = async (req, res) => {
    const newpasswordotp = req.session.newpasswordotp
    const enteredpassword = req.body.otp

    if (enteredpassword == newpasswordotp) {

        const updateemail = req.session.updateemail
        const newpassword = req.session.newpassword

        await registercollection.updateOne({ email: updateemail }, { $set: { password: newpassword } })
        req.session.passwordupdated = {
            message: 'Password Updatd',
            type: 'success'
        }
        res.redirect('/user/login')
    }
    else {
        req.session.invalidforgetotp = {
            message: 'otp not valid',
            type: 'danger'
        }
        res.redirect('/user/forgetotp')
    }
}


// ------------------------coupen-------------------

const verifycoupen = async (req, res) => {
    try {

        const coupenvalue = req.body.coupenvalue
        const grandtotal = req.body.grandtotal
        const email = req.session.user

        let newtotal1
        let newtotal

        let discount
        let coupenid
        let minvalue


        const coupendb = await coupencollection.findOne({ code: coupenvalue });

        if (coupendb != null) {
            discount = coupendb.discount;
            coupenid = coupendb._id
            minvalue = coupendb.minvalue
            newtotal1 = (discount / 100) * grandtotal
            newtotal = grandtotal - newtotal1
        }
        else if (coupendb == null) {
            req.session.coupen = ''
            res.status(400).json({ message: 'invalid coupon', discount, grandtotal });
            return;
        }
        else if (req.session.coupen == coupenvalue) {
            res.status(400).json({ message: 'alredy in input', discount, newtotal });
            return;
        }


        const data = {
            isused: 'false',
            code: coupendb.code,
            discount: coupendb.discount,
            minvalue: coupendb.minvalue,
            coupenid: coupendb._id,
            expirydate: coupendb.expirydate,
            discription: coupendb.discription
        }




        const coupenExists = await registercollection.findOne({
            email: email,
            'usedcoupens.coupenid': coupenid
        });


        if (coupenExists) {
            req.session.coupen = ''
            res.status(400).json({ message: 'invalid coupon', discount, grandtotal });
            return
        }
        else if (grandtotal < minvalue) {
            res.status(400).json({ message: 'minimum 2000', discount, minvalue });
            return
        }
        else {
            await registercollection.findOneAndUpdate(
                { email: email },
                { $push: { coupens: data } },
                { new: true }
            );

            req.session.coupen == coupenvalue

            res.status(200).json({ message: 'coupon matching', discount, coupenid, newtotal });
        }

    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// -------------------clear coupen---------------------

const clearcoupen = async (req, res) => {
    req.session.coupen = ''
    const coupenid = req.body.coupenid
    const email = req.session.user
    await registercollection.updateOne(
        { email: email },
        { $pull: { coupens: { coupenid: coupenid } } }
    );
    res.status(200).json({ message: 'removed' })
}


// ---------logout user------------

const logout = (req, res) => {
    try {
        req.session.user = null
        res.redirect('/')
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }

}




module.exports = {
    login, register, userlogin, logout, userforget, verifyForgetUser,
    getforgetotp, getnewpassword, resetPassword, otpgenerator, updatepassword,
    postregisteration, registerotpgenerator, getregiserotp, postregisterotp,
    verifycoupen, clearcoupen
}
