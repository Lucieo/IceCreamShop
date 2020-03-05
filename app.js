const path = require('path');
const fs = require('fs');
const https= require('https');

const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/errorController');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const User = require('./models/user');
const MONGDB_URI = require('./util/connect').MONGDB_URI;
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

//APP INIT
const app = express();
const store = new MongoDBStore({
    uri: MONGDB_URI,
    collection: 'sessions'
});

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

//IMAGE STORAGE CONFIG
const fileStorage = multer.diskStorage({
    destination: (req, file, cb)=>{
        //Where to store
        cb(null, 'images');
    },
    filename:(req, file, cb)=>{
        //Change file name
        cb(null, new Date().toISOString()+'_'+file.originalname);
    }
})

const fileFilterConfig = (req, file, cb)=>{
    if(file.mimetype==='image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }else{
        cb(null, false);
    }
}

app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilterConfig
})
.fields([{
    name: 'image', maxCount: 1
  }, {
    name: 'productImage', maxCount: 1
  }])
)


//TEMPLATING AND SETUP
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
// use name of field in view with type file
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

//INIT SESSION
app.use(session({
    secret:'lolipopSecretLanguage',
    resave: false,
    saveUninitialized: false,
    store
}));




//INIT FLASH FOR FEEDBACK
app.use(flash());

//USER INIT IF CONNECTED
app.use((req, res, next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id )
    .then(user=>{
        if(!user){
            return next();
        }
        req.user = user;
        next();
    })
    .catch(err=>{
        next(new Error(err))
    });
})

//CSRF PROTECTION MIDDLEWARE
const csrfProtection = csrf();
app.use(csrfProtection);

app.use((req, res, next)=>{
    res.locals.isLoggedIn =req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    res.locals.isAdmin = (req.user? req.user.admin : false);
    res.locals.isSuperAdmin = (req.user? req.user.superAdmin : false);
    res.locals.userEmail = (req.user? req.user.email : '');
    next();
})

//ROUTES
const adminRoutes = require('./routes/adminRoutes');
const shopRoutes = require('./routes/shopRoutes');
const authRoutes = require('./routes/authRoutes');

//Secure headers
app.use(helmet());
//Compress 
app.use(compression());
//Logging request data
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    {flags: 'a'}//append at the end of a file
)
app.use(morgan('combined', {stream: accessLogStream}))

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use('/500', errorController.get500);
app.use(errorController.get404);

//ERROR HANDLING MIDDLEWARE - called using next(error)
app.use((error, req, res, next)=>{
    console.log(error)
    res.status(500)
    .render('500', {
        pageTitle: 'Error!', 
        path:'/500',
        isLoggedIn: req.isLoggedIn
    });
});


mongoose
.connect(MONGDB_URI)
.then(result=>{
    // https
    // .createServer({
    //     key: privateKey,
    //     cert: certificate
    // }, app)
    app
    .listen(process.env.PORT || 3000);
})
.catch(err=>console.log(err));