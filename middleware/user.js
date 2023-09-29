const registercollection = require('../model/registerSchema')



const isUserLogged = (req, res, next) => {
    try{
        if (req.session.user) {
            next()
        }
        else {
            res.redirect('/user/logout')
        }
    }
    catch (err) {
        console.error('Error :', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const isUserBlocked = async (req, res, next) => {
    try {
        const email = req.session.user
            const check = await registercollection.findOne({ email: email })
            if (check.blocked == 'false') {
                next()
            }
            else {
                res.redirect('/user/logout')
            }
    }
    catch {
        next()
    }
}

module.exports = { isUserBlocked,isUserLogged }