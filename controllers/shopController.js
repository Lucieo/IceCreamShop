const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');


exports.getIndex=(req,res,next)=>{
  Product.find()
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(
    err=> console.log(err)
  );
};

exports.getProducts = (req, res, next) => {
    Product.find()
    .then(products=>{
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/product-list',
        
      });
    })
    .catch(
      err=> console.log(err)
    );
  };

exports.getProductDetail=(req,res,next)=>{
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      console.log(product)
      res.render('shop/product-detail', {
        product,
        pageTitle: product.title,
        path: '/products',
        
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, next)=>{
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user=>{
    res.render('shop/cart', {
      products:user.cart.items,
      pageTitle: 'Cart',
      path: '/products',
      
    });
  })
}

exports.postCart = (req, res, next)=>{
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product=>{
    return req.user.addToCart(product);
  })
  .then(result=>{
    res.redirect('/cart');
  });
}

exports.postCartDeleteItem = (req, res, next)=>{
  const prodId = req.body.productId;
  req.user
  .removeFromCart(prodId)
  .then(result=>res.redirect('/cart'))
}

exports.getOrders = (req, res, next)=>{
  Order
  .find({'user.userId': req.user._id})
  .then(orders=>{
    console.log(orders)
    res.render('shop/orders', {
      orders,
      pageTitle: 'Orders',
      path: '/orders',
      
    });
  })
}

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email : req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.emptyCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getInvoice = (req, res, next)=>{
  const orderId = req.params.orderId;
  Order
  .findById(orderId)
  .then(order=>{
    if(!order){
      return next(new Error('No order found'));
    }
    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error('Unauthorized'));
    }

    const invoiceName = 'invoice-'+orderId+'.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type','application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="'+invoiceName+'"'
    )
    pdfDoc.pipe(fs.createWriteStream(invoicePath))
    pdfDoc.pipe(res);
    
    pdfDoc
    .fontSize(26)
    .text(`Invoice order ${order._id}`);
    pdfDoc.text('-------------------------');
    let totalPrice = 0;
    order.products.forEach(prod=>{
      totalPrice += prod.quantity*prod.product.price;
      pdfDoc
      .fontSize(14)
      .text(prod.product.title + ' - '+prod.quantity+ ' x '+'$'+prod.product.price)
    })
    pdfDoc
    .fontSize(26)
    .text('-------------------------');
    pdfDoc
    .fontSize(20)
    .text('Total Price: $'+totalPrice);
    pdfDoc.end();
  })
  .catch(err=>next(err))
};