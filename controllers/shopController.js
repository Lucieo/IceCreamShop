const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const stripe = require('../util/connect').stripeConnect;
const PDFDocument = require('pdfkit');
const ITEMS_PER_PAGE = 2;


exports.getIndex=(req,res,next)=>{
  const page = +req.query.page || 1;
  let totalItems;

  Product
  .find()
  .countDocuments()
  .then(numProducts=>{
    totalItems = numProducts;
    return Product.find()
    .skip((page-1)*ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  })
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      totalItems,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      currentPage:page,
      previousPage:page-1,
      hasPreviousPage: page > 1,
      nextPage : page + 1,
      hasPreviousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(
    err=> console.log(err)
  );
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product
  .find()
  .countDocuments()
  .then(numProducts=>{
    totalItems = numProducts;
    return Product.find()
    .skip((page-1)*ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  })
  .then(products=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products',
      totalItems,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      currentPage:page,
      previousPage:page-1,
      hasPreviousPage: page > 1,
      nextPage : page + 1,
      hasPreviousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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

exports.getCheckout = (req, res, next)=>{
  let products;
  let total=0;
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user=>{
    products = user.cart.items;
    totalSum = products.reduce(function(prev, curr) {return prev+ (curr.quantity * curr.productId.price)}, 0)

    return stripe.checkout.sessions.create({
      payment_method_types : ['card'],
      line_items: products.map(p=>{
        return {
          name: p.productId.title,
          description: p.productId.description,
          amount: p.productId.price * 100,
          currency: 'usd',
          quantity: p.quantity
        }
      }),
      success_url: req.protocol+'://'+req.get('host')+'/checkout/success',
      cancel_url: req.protocol+'://'+req.get('host')+'/checkout/success',
    });
  })
  .then(session=>{
    res.render('shop/checkout', {
      products,
      pageTitle: 'Checkout',
      path: '/checkout',
      totalSum,
      sessionId: session.id
    });
  }
  )
  .catch(err=>{
    next(err)
  })
}

exports.getCheckoutSuccess = (req, res, next) => {
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