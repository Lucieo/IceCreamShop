const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');

//DB
const mongoConnect = require('./util/database').mongoConnect;

//APP INIT
const app = express();

//TEMPLATING AND SETUP
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//USER SETUP
const User = require('./models/user');
app.use((req, res, next)=>{
    User.findById('5e4c84f3b6c5fc7ebd09e7d7')
    .then(user=>{
        req.user = new User(user.name, user.email, user.cart, user._id);
        next();
    })
    .catch(err=>console.log(err))
})

//ROUTES
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongoConnect(()=>{
    app.listen(3000);
})