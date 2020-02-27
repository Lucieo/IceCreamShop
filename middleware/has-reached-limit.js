const Product = require('../models/product');

module.exports = (req, res, next)=>{
    Product
    .find({userId: req.user._id})
    .countDocuments()
    .then(productNumber=>{
        if(!req.user.superAdmin || productNumber>5){
            res.redirect('/');
        }
        next();
    })
}