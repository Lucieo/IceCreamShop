const Product = require('../models/product');

exports.getAdminProducts = (req, res, next) => {
  Product.fetchAll()
  .then(products=>{
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true
    });
  })
  .catch(
    err=> console.log(err)
  );

};

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing:false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(title, price, description, imageUrl, null, req.user._id);
  product
  .save()
  .then(result=>res.redirect('/admin/products'))
  .catch(error=>{
    console.log(error);
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
      product: product
    });
  })
  .catch(err=>console.log(err));
};

exports.postEditProduct = (req, res, next)=>{
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const product = new Product(updatedTitle, updatedPrice, updatedDescription, updatedImageUrl, prodId, req.user._id)
  product
  .save()
  .then(result=>  res.redirect('/admin/products'))
  .catch(err=>console.log(err));
}


exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteById(productId)
  .then(result=> res.redirect('/admin/products'))
  .catch(err=>console.log(err))
};




