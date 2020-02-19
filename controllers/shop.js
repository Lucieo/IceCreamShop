const Product = require('../models/product');


exports.getIndex=(req,res,next)=>{
  Product.fetchAll()
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    });
  })
  .catch(
    err=> console.log(err)
  );
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
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
  .then(product=>{
    res.render('shop/product-detail', {
      pageTitle:'Product Detail',
      path:'/products',
      product:product
    });
  })
  .catch(err=>console.log(err))
};

exports.getCart=(req,res,next)=>{
  req.user
  .getCart()
  .then(products=>{
    res.render('shop/cart', {
      pageTitle:'Cart',
      path:'/cart',
      products
      });
  })
  .catch(err=>console.log(err));
};


exports.postCart=(req,res,next)=>{
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product =>{
    return req.user.addToCart(product);
  })
  .then(result=>{
    res.redirect('/cart');
  })
  .catch(err=>console.log(err));
};

exports.postCartDeleteProduct = (req, res, next)=>{
  const prodId = req.body.productId;
  req.user
  .removeFromCart(prodId)
  .then(result=>{
    res.redirect('/cart');
  })
  .catch(err=>console.log(err))
};

exports.getOrders=(req,res,next)=>{
  req.user
  .getOrders()
  .then(orders=>{
    console.log(orders)
    res.render('shop/orders', {
      pageTitle:'Orders',
      path:'/orders',
      orders
    });
  })
  .catch(err=>console.log(err));
};
  
exports.postOrder = (req, res, next) =>{
  req.user
  .addOrder()
  .then(result=>{
    res.redirect('/orders');
  })
  .catch(err=>console.log(err));
}


exports.getCheckout=(req,res,next)=>{
  res.render('shop/checkout', {
    pageTitle:'Checkout',
    path:'checkout'
  });
};