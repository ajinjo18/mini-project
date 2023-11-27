const registercollection = require('../model/registerSchema')
const coupencollection = require('../model/coupenSchema')
const tempRegisterCollection = require('../model/tempRegisterSchema')

const bcrypt = require('bcrypt')
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


// ===================================register========================================


// -----------------get register----------------


const register = (req, res) => {

    const alertmessage = req.session.alertmessage
    req.session.alertmessage = null

    res.render('user/signup', {alertmessage})
}



// ----------------get register otp--------------------


const getregiserotp = (req, res) => {
    res.render('user/registerotp')
}



// ---------------------post register otp--------------------


const postregisterotp = async (req, res) => {
    try{
        const registeremail = req.session.registeremail

        const tempregister = await tempRegisterCollection.findOne({email:registeremail},{otp:1})
        if (tempregister === null || tempregister === undefined || tempregister.otp === null) {
            return res.status(400).json({ message: 'errorotp' });
        }
        const registerotp = tempregister.otp
        const otp = req.body.otp

        if (otp == registerotp) {
            const data1 = await tempRegisterCollection.findOne({email:registeremail})
            const data={
                name: data1.name,
                email: data1.email,
                password: data1.password,
                blocked: data1.blocked
            }
           
            await registercollection.insertMany([data])
              
            req.session.alertmessage={
                message: 'Successfully Registered',
                type: 'success'
            }
            req.session.registeremail = null
            await tempRegisterCollection.findOneAndDelete({ email:registeremail });
            return res.status(200).json({message: 'success' });
        }
        else {
            return res.status(400).json({message: 'errorotp' });
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
        if(check === null){
            req.session.registeremail = req.body.email
            const data = {
                name: req.body.name,
                email: req.body.email,
                password: await bcrypt.hash(req.body.password, 10),
                blocked: req.body.isblocked
            }
            await tempRegisterCollection.findOneAndDelete({ email:req.body.email });
            await tempRegisterCollection.insertMany([data])

            const otp = generateOTP.generate(6, { digits: true, alphabets: false, specialChars: false });

            await tempRegisterCollection.findOneAndUpdate({email:req.body.email},{$set:{otp:otp}})

            const mailOptions = {
                from: 'testtdemoo11111@gmail.com',
                to: `${req.body.email}`,
                subject: 'Your OTP Code',
                text: `Your OTP code is: ${otp}`,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email: ' + error);
                }
                else {
                    console.log('Email sent: ' + info.response);
                    setTimeout(async () => {
                        try {
                            await tempRegisterCollection.updateOne({ email: req.body.email }, { $unset: { otp: 1 } });
                        } catch (error) {
                            console.error('Error removing OTP:', error.message);
                        }
                    }, 60000);
                }
                setTimeout(async () => {
                    await tempRegisterCollection.findOneAndDelete({ email:req.body.email });
                }, 900000);
                
                res.redirect('/user/getotp')
            });

        }
        else{
            req.session.alertmessage = {
                message: 'User Already Exist',
                type: 'danger'
            }
            res.redirect('/user/register')
        }
    }
    catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }

}


// -----------------resend otp-------------


const registerotpgenerator = async(req, res) => {

    const registeremail = req.session.registeremail

    const otp = generateOTP.generate(6, { digits: true, alphabets: false, specialChars: false });

    await tempRegisterCollection.findOneAndUpdate({email:registeremail},{$set:{otp:otp}})

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
            setTimeout(async () => {
                try {
                    await tempRegisterCollection.updateOne({ email: registeremail }, { $unset: { otp: 1 } });
                } catch (error) {
                    console.error('Error removing OTP:', error.message);
                }
            }, 60000);
        }
        
        res.redirect('/user/getotp')
    });

}






// =========================================Login======================================


// ---------------get login-------------------


const login = (req, res) => {
    const alertmessage = req.session.alertmessage
    req.session.alertmessage = null

    if (req.session.user) {
        res.redirect('/')
    }
    else {
        res.render('user/login', { alertmessage })
    }

}


// ----------------post login---------------------



const userlogin = async (req, res) => {

    try {
        const check = await registercollection.findOne({ email: req.body.email })

        if(check != null){
            const providedpass = req.body.password
            const storedhash = check.password
            const blocked = check.blocked
            req.session.username = check.name

            bcrypt.compare(providedpass, storedhash, (err, result) => {
                if (result == false) {
                    req.session.alertmessage = {
                        message: 'Invalid Password',
                        type: 'danger'
                    }
                    res.redirect('/user/login')
                }
        
                else if (result === true && blocked == 'false') {
                    req.session.user = req.body.email
                    req.session.userid = check._id
                    res.redirect('/')
                }
                else if (result === true && blocked == 'true') {
                    req.session.alertmessage = {
                        message: 'Account Blocked',
                        type: 'danger'
                    }
                    res.redirect('/user/login')
                }
            })
        }
        else{
            req.session.alertmessage = {
                message: 'Invaliduser',
                type: 'danger'
            }
            res.redirect('/user/login')
        }
    }
    catch (err) {
        console.error('Error :', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}





// ========================================forgetpassword=================================




// ---------------get forgetpage(email)--------------

const userforget = (req, res) => {
    const alertmessage = req.session.alertmessage
    req.session.alertmessage = null

    res.render('user/forgetpassword', { alertmessage })
}


// -----------post forgetpage(email)----------

const verifyForgetUser = async (req, res) => {
    req.session.updateemail = req.body.email
    const verifyuser = await registercollection.findOne({ email: req.body.email })

    if (verifyuser) {
        res.redirect('/user/newpassword')
    }
    else {
        req.session.alertmessage = {
            message: 'User Not Found',
            type: 'danger'
        }
        res.redirect('/user/forget')
    }

}



// ------------------get newpassword----------------

const getnewpassword = (req, res) => {
    res.render('user/newpassword')
}


// -----------post newpassword--------------

const resetPassword = async(req, res) => {

    const updateemail = req.session.updateemail
    
    const newPassword = await bcrypt.hash(req.body.password, 10)

    await registercollection.findOneAndUpdate({ email: updateemail }, { $unset: { temppassword: 1 } });
    await registercollection.findOneAndUpdate({email:updateemail},{$set:{temppassword:newPassword}})


    const newpasswordotp = generateOTP.generate(6, { digits: true, alphabets: false, specialChars: false });
    await registercollection.findOneAndUpdate({email:updateemail},{$set:{otp:newpasswordotp}})

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
            setTimeout(async () => {
                try {
                    await registercollection.findOneAndUpdate({ email: updateemail }, { $unset: { otp: 1 } });
                } catch (error) {
                    console.error('Error removing OTP:', error.message);
                }
            }, 60000);
        }
    });
    res.redirect('/user/forgetotp')

}



// ----------get forget OTP page--------

const getforgetotp = (req, res) => {
    const user = req.session.updateemail
    res.render('user/forgetOTP', { user })
}



// ----------forget password resend OTP----------


const otpgenerator = async(req, res) => {
    const updateemail = req.session.updateemail

    const newpasswordotp = generateOTP.generate(6, { digits: true, alphabets: false, specialChars: false });
    await registercollection.findOneAndUpdate({email:updateemail},{$set:{otp:newpasswordotp}})

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
            setTimeout(async () => {
                try {
                    await registercollection.findOneAndUpdate({ email: updateemail }, { $unset: { otp: 1 } });
                } catch (error) {
                    console.error('Error removing OTP:', error.message);
                }
            }, 60000);
        }
    });
    res.redirect('/user/forgetotp')

}




// --------------update password(post otp)--------------

const updatepassword = async (req, res) => {

    const updateemail = req.session.updateemail
    const enteredOtp = req.body.otp

    const check = await registercollection.findOne({email:updateemail},{otp:1})
        if (check.otp === null) {
            return res.status(400).json({ message: 'errorotp' });
        }
        const sendOtp = check.otp
    
    if (enteredOtp == sendOtp) {

        const newPassword = await registercollection.findOne({email:updateemail},{temppassword:1})

        await registercollection.updateOne({ email: updateemail }, { $set: { password: newPassword.temppassword } })
        await registercollection.findOneAndUpdate({ email: updateemail }, { $unset: { temppassword: 1 } });

        req.session.alertmessage = {
            message: 'Password Updated',
            type: 'success'
        }
        return res.status(400).json({ message: 'PasswordUpdatd' });
    }
    else {
        return res.status(400).json({ message: 'errorotp' });
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

        if (coupendb) {
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
