const path = require('path');

const express = require('express');

const adminController = require('../controllers/adminController');
const isAdmin = require('../middleware/is-admin');
const hasReachedLimit = require('../middleware/has-reached-limit');
const {body} = require('express-validator');

const router = express.Router();

router.get('/add-product', isAdmin, hasReachedLimit, adminController.getAddProduct);
router.post('/add-product', [
    body('title', 'Title must be at least 3 characters long and no special characters allowed.')
        .isString()
        .isLength({min: 3})
        .trim(),
    body('price', 'Price must be a float.')
        .isNumeric(),
    body('description', 'Product description must be at least 5 characters long maximum 400.')
        .isLength({min: 5, max:400})
        .trim(),
    body('ingredients', 'Ingredients must be at least 5 characters long maximum 400.')
        .isLength({min: 5, max:400})
        .trim()
], isAdmin, hasReachedLimit, adminController.postAddProduct);
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
],isAdmin, adminController.postEditProduct);

router.delete('/product/:productId', isAdmin, adminController.deleteProduct);

module.exports = router;