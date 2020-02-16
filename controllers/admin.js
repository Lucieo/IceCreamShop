const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing:false
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;//always return a string
  if(!editMode){
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  req.user
  .getProducts({where:{id:prodId}})
  .then(products=>{
    const product= products[0];
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
  //double then avoid nesting promises
  Product.findByPk(prodId)
  .then(product=>{
    product.title = updatedTitle;
    product.price=updatedPrice;
    product.description=updatedDescription;
    product.imageUrl = updatedImageUrl;
    return product.save();
  })
  .then(result=>  res.redirect('/admin/products'))
  .catch(err=>console.log(err));
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  req.user.createProduct({
    title,
    price,
    imageUrl,
    description,
  })
  .then(result=>{
    res.redirect('/admin/products');
  })
  .catch(error=>{
    console.log(error);
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findByPk(prodId)
  .then(product=>{
    return product.destroy();
  })
  .then(result=> res.redirect('/admin/products'))
  .catch(err=>console.log(err))
};

exports.getAdminProducts = (req, res, next) => {
  req.user
  .getProducts()
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


