const Product = require('../models/product');
const fileHelper = require('../util/file');

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
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  const userId = req.user;//mongoose will look for id only
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res
    .status(422)
    .render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing:false,
      hasError:true,
      product: {
        title,
        price,
        description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
    if(!image){
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
      errorMessage: "Attached file is not an image (jpeg jpg or png accepted).",
      validationErrors: []
    });
  }

  const imageUrl = image.path;

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
  const updatedImage = req.file;
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
    if(updatedImage){
      //delete old image
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    product.description = updatedDescription;
    return product.save()  
    .then(result=>  res.redirect('/admin/products'));
  })
  .catch(err=>{
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}


exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product
  .findById({_id:productId})
  .then(product=>{
    if(!product){
      return next(new Error('Product not found'));
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({_id: productId, userId: req.user._id})
  })
  .then(result=> {
    res
    .status(200)
    .json({
      message: 'Success!'
    });
  })
  .catch(err=>{
    res
    .status(500)
    .json({
      message:'Deleting product failed.'
    });
  })
};




