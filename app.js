const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');

//APP INIT
const app = express();

//TEMPLATING AND SETUP
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


//DB
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

//Store current user
app.use((req, res, next)=>{
    User.findByPk(1)
    .then(user=>{
        req.user = user;
        next();
    })
    .catch(err=>console.log(err))
})

//DB ASSOCIATIONS
Product.belongsTo(User, {constraints:true, onDelete:'CASCADE'});
User.hasMany(Product);//optional
User.hasOne(Cart);
Cart.belongsTo(User); // optional
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem});


//ROUTES
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);


//DB SYNC (sync({force:true}) will override db each reboot)
sequelize
.sync()
//.sync({force:true})
.then(result=>{
    return User.findByPk(1);
})
.then(user=>{
    //Create user if no one in db
    if(!user){
        return User.create({name:'Max', email:'test@mail.com'})
    }
    return user;
})
.then(user=>{
    return user.createCart();
})
.then(cart=>{
    app.listen(3000);
})
.catch(err=>{
    console.log(err);
});