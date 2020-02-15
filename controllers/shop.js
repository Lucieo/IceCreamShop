const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/product-list',
      });
    });
  };

exports.getProductDetail=(req,res,next)=>{
  const prodId = req.params.productId;
  Product.findById(prodId, product=>{
    res.render('shop/product-detail', {
      pageTitle:'Product Detail',
      path:'/products',
      product
    });
  })
};

  exports.getCart=(req,res,next)=>{
    Cart.getCart(cart=>{
      Product.fetchAll(products=>{
        const cartItems = cart.products.map(
          item =>{
            const productData = products.find(prod =>prod.id === item.id);
            if (productData){
              return {
                qty: item.qty,
                productData
              }
            }
          }
        )
        res.render('shop/cart', {
          pageTitle:'Cart',
          path:'/cart',
          products: cartItems
        });
      })
    })
  };


  exports.postCart=(req,res,next)=>{
    const prodId = req.body.productId;
    Product.findById(prodId, (product)=>{
      Cart.addProduct(prodId, product.price);
    });
    res.redirect('/cart');
  };

  exports.postCartDeleteProduct = (req, res, next)=>{
    const prodId = req.body.productId;
    Product.findById(prodId, product=>{
      Cart.deleteProduct(prodId, product.price);
      res.redirect('/cart')
    })
  };

  exports.getOrders=(req,res,next)=>{
    res.render('shop/orders', {
      pageTitle:'Orders',
      path:'/orders'
    });
  };
  
  exports.getCheckout=(req,res,next)=>{
    res.render('shop/checkout', {
      pageTitle:'Checkout',
      path:'checkout'
    });
  };
  
  exports.getIndex=(req,res,next)=>{
    Product.fetchAll(products => {
        res.render('shop/product-list', {
          prods: products,
          pageTitle: 'Shop',
          path: '/',
        });
      });
  };
  

  