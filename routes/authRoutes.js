const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {check, body} = require('express-validator');
const User = require('../models/user');

//LOGIN
router.get('/login', authController.getLogin);
router.post('/login', 
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address.')
            .normalizeEmail(),
        body('password', 'Password has to be valid.')
            .isLength({ min: 8, max: 100})
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, 'i')
            .trim(),
    ]
, authController.postLogin);
router.post('/logout', authController.postLogout);

//SIGNUP
router.get('/signup', authController.getSignup);
router.post('/signup', 
[
    check('email')
    .isEmail()
    .withMessage('Invalid email provided')
    .custom((value, {req})=>{
        return User.findOne({email: value})
        .then(existingUser=>{
            if(existingUser){
                //custom asynchronous validation
                return Promise.reject('An account with same email already exists. Please pick a different one or click or reset password in login section.')
            } 
        })
    })
    .normalizeEmail(),
    body(
        'password',
        'Password must be at least 8 characters long, include one lowercase character, one uppercase character, a number, and a special character.'
    )
        .isLength({ min: 8, max: 100})
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, 'i')
        .trim(),
    body(
        'confirmPassword'
    )
        .custom((value, {req})=>{
        if(value!==req.body.password){
            throw new Error('Passwords have to match!')
        }
        return true;
        })
        .trim(),
]
,authController.postSignup);

//PASSWORD
router.get('/reset-password', authController.getReset);
router.post('/reset-password', authController.postReset);
router.get('/reset-password/:token', authController.getNewPassword)
router.post('/new-password', authController.postNewPassword)

module.exports = router;
