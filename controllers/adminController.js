const Product = require('../models/product');

//VALIDATION
const {validationResult} = require('express-validator/check')

exports.getAdminProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
  //.populate('userId')
  .then(products=>{
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true,
      
    });
  })
  .catch(err=>{
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });

};

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.body.image;
  const description = req.body.description;
  const price = req.body.price;
  const userId = req.user;//mongoose will look for id only
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res
    .status(422)
    .render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing:false,
      hasError:true,
      product: {
        title,
        imageUrl, 
        price,
        description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const product = new Product({title, price, description, imageUrl, userId});
  product
  .save()
  .then(result=>res.redirect('/admin/products'))
  .catch(err=>{
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;//always return a string
  if(!editMode){
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product=>{
    if(!product){
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing:editMode,
      product: product,
      hasError: false,
      errorMessage: null,
      validationErrors: []
    });
  })
  .catch(err=>{
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postEditProduct = (req, res, next)=>{
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res
    .status(422)
    .render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing:true,
      hasError:true,
      product: {
        title: updatedTitle,
        imageUrl : updatedImageUrl, 
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: []
    });
  }

  //calling save on existing obj updates it
  Product.findById(prodId)
  .then(product=>{
    if(product.userId.toString()!== req.user._id.toString()){
      return res.redirect('/');
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    product.description = updatedDescription;
    return product.save()  
    .then(result=>  res.redirect('/admin/products'));
  })
  .catch(err=>{
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}


exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteOne({_id: productId, userId: req.user._id})
  .then(result=> res.redirect('/admin/products'))
  .catch(err=>{
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
};




