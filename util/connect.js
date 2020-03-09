const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const stripe = require('stripe')(process.env.STRIPE_KEY);
const MONGDB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@icecreamshop-lkjt7.mongodb.net/${process.env.MONGO_DEFAULT_DB}`;
const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:process.env.SENDGRID_KEY
    }
}));

exports.MONGDB_URI = MONGDB_URI;
exports.stripeConnect = stripe;
exports.transporter = transporter;
