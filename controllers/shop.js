const Product = require('../models/product');
const Cart = require('../models/cart');


exports.getIndex=(req,res,next)=>{
  Product.fetchAll()
  .then(([rows, fieldData])=>{
    res.render('shop/product-list', {
      prods: rows,
      pageTitle: 'Shop',
      path: '/',
    });
  })
  .catch(err=>console.log(err));
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
    .then(([rows, fieldData])=>{
      res.render('shop/product-list', {
        prods: rows,
        pageTitle: 'Products',
        path: '/product-list',
      });
    })
    .catch(err=>console.log(err));
  };

exports.getProductDetail=(req,res,next)=>{
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(([product])=>{
    res.render('shop/product-detail', {
      pageTitle:'Product Detail',
      path:'/products',
      product:product[0]
    });
  })
  .catch(err=>console.log(err))
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
  

  