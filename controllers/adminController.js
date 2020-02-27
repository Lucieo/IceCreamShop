const Product = require('../models/product');
const fileHelper = require('../util/file');

//VALIDATION
const {validationResult} = require('express-validator/check')

exports.getAdminProducts = (req, res, next) => {
  Product
  .find({userId: req.user._id})
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
  const imageUrl = req.files.image? req.files.image[0].path : undefined;
  const productImageUrl = req.files.productImage ? req.files.productImage[0].path : undefined;
  const description = req.body.description;
  const price = req.body.price;
  const userId = req.user;//mongoose will look for id only
  const container = req.body.container;
  const ingredients = req.body.ingredients;
  const errors = validationResult(req);
  const validated=((req.user && req.user.superAdmin)? true : false);
  const productInfo = {title, price, description, imageUrl, productImageUrl, userId, container, ingredients,validated}

  if(!errors.isEmpty()){
    return res
    .status(422)
    .render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing:false,
      hasError:true,
      product: productInfo,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
    if(!imageUrl || !productImageUrl){
    return res
    .status(422)
    .render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing:false,
      hasError:true,
      product: productInfo,
      errorMessage: "Image files are requires - Only jpeg jpg or png",
      validationErrors: []
    });
  }

  const product = new Product(productInfo);
  product
  .save()
  .then(result=>{
    return res.redirect('/admin/products')})
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
      product,
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
  const updatedDescription = req.body.description;
  const updatedContainer = req.body.container;
  const updatedIngredients = req.body.ingredients;
  let updatedImageUrl=req.files.image? req.files.image[0].path : undefined;
  let updatedProductImageUrl=req.files.productImage ? req.files.productImage[0].path  : undefined;

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
        ingredients: updatedDescription,
        container: updatedContainer,
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
    if(updatedImageUrl){
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = updatedImage.path;
    }
    if(updatedProductImageUrl){
      fileHelper.deleteFile(product.productImageUrl);
      product.productImageUrl =updatedProductImage.path;
    }
    product.description = updatedDescription;
    product.container = updatedContainer;
    product.ingredients = updatedIngredients;
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




