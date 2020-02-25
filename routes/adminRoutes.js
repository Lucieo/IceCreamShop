const path = require('path');

const express = require('express');

const adminController = require('../controllers/adminController');
const isAuth = require('../middleware/is-auth');
const {check, body} = require('express-validator/check');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product', [
    body('title', 'Title must be at least 3 characters long and no special characters allowed.')
        .isString()
        .isLength({min: 3})
        .trim(),
    body('imageUrl', 'Please provide a valid url for product image.')
        .trim(),
    body('price', 'Price must be a float.')
        .isNumeric(),
    body('description', 'Product description must be at least 5 characters long maximum 400.')
        .isLength({min: 5, max:400})
        .trim()
] ,adminController.postAddProduct);
router.get('/products', adminController.getAdminProducts)

router.get('/edit-product/:productId', adminController.getEditProduct);
router.post('/edit-product', [
    body('title', 'Title must be at least 3 characters long and no special characters allowed.')
        .isString()
        .isLength({min: 3})
        .trim(),
    body('price', 'Price must be a float.')
        .isNumeric(),
    body('description', 'Product description must be at least 5 characters long maximum 400.')
        .isLength({min: 5, max:400})
        .trim()
], adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;