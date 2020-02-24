const Product = require('../models/product');
const Order = require('../models/order');

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