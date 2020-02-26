const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    password:{
        type: String,
        required: true
    },
    resetToken:String,
    resetTokenExpiration:Date,
    email: {
        type: String,
        required: true
    },
    admin:{
        type: Boolean,
        default:false
    },
    cart: {
        items: [
            {
            productId:{type: Schema.Types.ObjectId, required: true, ref : 'Product'}, 
            quantity:{type:Number, required: true}
            }
        ]
    }
});

userSchema.methods.addToCart = function(product, quantity){
    const cartProductIndex = this.cart.items.findIndex(cartProduct=>{
        return cartProduct.productId.toString() === product._id.toString();
    });
    let newQuantity=quantity;
    const updatedCartItems = [...this.cart.items];
    if(cartProductIndex>=0){
        //PRODUCT IS ALREADY IN CART INCREASE QUANTITY
        newQuantity = this.cart.items[cartProductIndex].quantity+newQuantity;
        updatedCartItems[cartProductIndex].quantity = newQuantity; 
    } else{
        updatedCartItems.push({
            productId: product._id, 
            quantity: newQuantity})
    }
    const updatedCart = {items: updatedCartItems};
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.removeFromCart = function(productId){
    const updatedCartItems = this.cart.items.filter(items=>{
        return items.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.emptyCart = function(){
    this.cart.items = [];
    this.save();
}



module.exports = mongoose.model('User', userSchema);