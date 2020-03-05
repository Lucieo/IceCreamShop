const User = require('../models/user');

//PASSWORD
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

//EMAILS
const transporter = require('../util/connect').transporter;

//VALIDATION
const {validationResult} = require('express-validator/check')// will get all result from validation middlewares implemented

exports.getLogin = (req, res, next)=>{
    let message = req.flash('error');
    if(message.length>0){
        message = message[0];
    }else{
        message=null;
    }
    res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage:message,
    oldInput: {
        email: '',
        password: ''
      },
      validationErrors: []
    });
}

exports.postLogin = (req, res, next)=>{
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422)
        .render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput:{
                email,
                password
            },
            validationErrors: errors.array()
        })
    }
    User.findOne({email:email})
    .then(user=>{
        if(!user){
            return res.status(422)
            .render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: 'Invalid email or password.',
                oldInput: {
                  email: email,
                  password: password
                },
                validationErrors: []
            });
        }
        bcrypt.compare(password, user.password)
        .then(doMatch=>{
            console.log('doMatch', doMatch)
            if(doMatch){
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err=>{
                    //make sure session has been saved before redirecting
                    console.log(err);
                    res.redirect('/');
                });
            }
            return res.status(422)
            .render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: 'Invalid email or password.',
                oldInput: {
                  email: email,
                  password: password
                },
                validationErrors: []
            });
        })
        .catch(err=> res.redirect('/login'))
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postLogout = (req, res, next)=>{
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/');
    });
}

exports.getSignup = (req, res, next)=>{
    let message = req.flash('error');
    if(message.length>0){
        message = message[0];
    }else{
        message=null;
    }
    const errors = validationResult(req);

    res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    errorMessage:message,
    oldInput:{
        email:"",
        password:"",
        confirmPassword:""
    },
    validationErrors: errors.array()
    });
}

exports.postSignup = (req, res, next)=>{
    const email = req.body.email;
    const password = req.body.password;
    const requireAdmin = req.body.requireAdmin;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        //error status code - render same page again
        return res.status(422)
        .render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage:errors.array()[0].msg,
            oldInput: {
                email, 
                password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });
    }

    //second argument is the SALT = number of encrypting rounds => encrypting is aync task
    bcrypt
    .hash(password, 12)
    .then(hashedPassword=>{
        const user = new User({
            email, 
            password:hashedPassword,
            cart: {items: []}
        });
        return user.save()
    })
    .then(result=>{
        res.redirect('/login');
        //send email to new user
        return transporter.sendMail({
            to: email,
            from:'ice-cream-shop-lucieory@yopmail.com',
            subject:'WELCOME!',
            html:`
            <h1>Welcome on The Ice Cream Shop! </h1> 
            <p>Your account has been created.</p>`
        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
    })
}

exports.getReset = (req, res, next)=>{
    let message = req.flash('error');
    if(message.length>0){
        message = message[0];
    }else{
        message=null;
    }

    res.render('auth/reset-password', {
        path:'/reset-password',
        pageTitle:'Reset Password',
        errorMessage : message
    })
}

exports.postReset = (req, res, next)=>{
    crypto.randomBytes(32, (err, buffer)=>{
        if(err){
            console.log(err);
            return res.redirect('/reset-password');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
        .then(user=>{
            if(!user){
                req.flash('error', 'No account with that email found.')
                return res.redirect('/reset-password');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result=>{
            res.redirect('/');
            transporter.sendMail({
                to: req.body.email,
                from:'ice-cream-shop-lucieo@yopmail.com',
                subject:'Password Reset',
                html:`
                <p>You requested a password reset </p>
                <p>Click <a href="http://localhost:3000/reset-password/${token}">this link</a> to set a new password.</p>
                `
            })
        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
    })
}

exports.getNewPassword = (req, res, next)=>{
    const token = req.params.token;
    User.findOne({resetToken:token, resetTokenExpiration:{$gt: Date.now()}})
    .then(user=>{
        let message = req.flash('error');
        if(message.length>0){
            message = message[0];
        }else{
            message=null;
        }
    
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken : token 
        });
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
};

exports.postNewPassword = (req, res, next)=>{
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
    .then(user=>{
        resetUser=user;
        return bcrypt.hash(newPassword, 12)
    })
    .then(hashedPassword=>{
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        resetUser.save();
    })
    .then(result=>{
        res.redirect('/login');
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}