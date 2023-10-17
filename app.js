const express= require('express')
const app=express()
const path=require('path')
const session=require('express-session')
const passport = require('./routes/passport-config')


const userRouter=require('./routes/userRoutes')
const adminRouter=require('./routes/adminRoutes')
const mainHomeRouter=require('./routes/mainHomeRoutes')
const { log } = require('util')



app.set('view engine','ejs')

app.use((req, res, next)=>{
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next()
})



app.use(session({
    secret:['gfhf','djhdhd','djdjdjj','jdhdh','dhdhd','jdjd','djdhfh',
    'jdjdj','ghg','wnbjb','gggd','dhdh','hghjk','jhhhh','hhj'],
    saveUninitialized:true,
    resave:false
}))


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

// app.use((req,res,next)=>{
//   console.log(req.body);
//   next()
// })


// app.get('/hello',(req,res)=>{
//   res.render('admin/bannercategory')
// })


app.use('/',mainHomeRouter)
app.use('/user',userRouter)
app.use('/admin',adminRouter)
app.use('/home',mainHomeRouter)




// Add a new route for Google OAuth login
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route after Google OAuth authentication
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/user/login',
  })
);




app.use((req, res) => {
  res.status(404).render('error404');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error500');
});




app.listen(3000,()=>{
    console.log('server running');
})
