const fs = require('fs');
const path = require('path');

const jsonPath = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
  );
  

module.exports = class Cart{

    static addProduct(id, productPrice){
        fs.readFile(jsonPath, (err, fileContent)=>{
            let cart = {products:[], totalPrice:0};
            if(!err){
                cart = JSON.parse(fileContent);
            }
            const existingProductIndex = cart.products.findIndex(el=>el.id ===id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            if(existingProduct){
                //increasing quantity of existing product
                updatedProduct={...existingProduct};
                updatedProduct.qty = updatedProduct.qty+1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            }else{
                //adding a new product
                updatedProduct = {id:id, qty:1};
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(jsonPath, JSON.stringify(cart))
        });
    };

    static deleteProduct(id, productPrice){
        fs.readFile(jsonPath, (err, fileContent)=>{
            if (err){
                return; 
            }
            const cart = JSON.parse(fileContent);
            const updatedCart = {...cart};
            const product = updatedCart.products.find(prod=> prod.id ===id);
            if(!product){
                return;
            }
            updatedCart.totalPrice = cart.totalPrice - productPrice * product.qty;
            updatedCart.products = updatedCart.products.filter(prod=> prod.id!==id);
            fs.writeFile(jsonPath, JSON.stringify(updatedCart))
        })
    };

    static getCart(cb){
        fs.readFile(jsonPath, (err, fileContent)=>{
            const cart = JSON.parse(fileContent);
            if(err){
                cb(null);
            }else{
                cb(cart);
            }
        });
    }

}