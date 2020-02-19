const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class User{
    constructor(name, email, cart, id){
        this.name = name;
        this.email = email;
        this.cart = cart;
        this._id =id? mongodb.ObjectId(id) : null;
    }

    save(){
        //initiate connection with db
        const db = getDb();
        let dbOp;
        if(this._id){
        //UPDATE PRODUCT
        dbOp = db.collection('users').updateOne({id_:this._id}, {$set: this})
        }
        else{
        //CREATE PRODUCT
        dbOp = db.collection('users').insertOne(this)
        }
        return dbOp    
        .then(result=>console.log(result))
        .catch(err=> console.log(err));
    }

    addToCart(product){
        const cartProductIndex = this.cart.items.findIndex(cartProduct=>{
            return cartProduct.productId.toString() === product._id.toString();
        });
        let newQuantity=1;
        const updatedCartItems = [...this.cart.items];
        if(cartProductIndex>=0){
            //PRODUCT IS ALREADY IN CART INCREASE QUANTITY
            newQuantity = this.cart.items[cartProductIndex].quantity+1;
            updatedCartItems[cartProductIndex].quantity = newQuantity; 
        } else{
            updatedCartItems.push({productId: mongodb.ObjectId(product._id), quantity: newQuantity})
        }
        const updatedCart = {items: updatedCartItems};
        const db = getDb();
        return db
        .collection('users')
        .updateOne(
            {_id: this._id}, 
            {$set:{cart : updatedCart}}
        );
    }

    getCart(){
        const db = getDb();
        const productIds = this.cart.items.map(item=>item.productId);
        return db.collection('products')
        .find({_id : {$in: productIds}})
        .toArray()
        .then(products=>{
            return products.map(p=>{
                return {...p, quantity : this.cart.items.find(item=>{
                    return item.productId.toString()===p._id.toString()
                }).quantity
                }
            })
        })
    }

    removeFromCart(prodId){
        console.log(this.cart.items)
        const updatedCartItems = this.cart.items.filter(item=>{
            return item.productId.toString() !== prodId.toString();
        }) 
        const db = getDb();
        return db
        .collection('users')
        .updateOne(
            {_id: this._id}, 
            {$set:{cart : {items: updatedCartItems}}}
        );
    }

    addOrder(){
        const db = getDb();
        return this.getCart()
        .then(products=>{
            //duplicate user obj + copy products info from cart (duplication is not a problem as order is a snapshot of products and their price at a given time)
            const order={
                items: products,
                user :{
                    _id: mongodb.ObjectId(this._id),
                    name : this.name,
                    email : this.email
                }
            };
            return db.collection('orders').insertOne(order);
        })
        .then(result=>{
            //Clearing Cart in User object
            this.cart = {items: []}
            //Clearing Cart in Db
            return db
            .collection('users')
            .updateOne(
                {_id: this._id}, 
                {$set:{cart : {items: []}}}
            );
            })
    }

    getOrders(){
        const db = getDb();
        return db.collection('orders')
        .find({'user._id': mongodb.ObjectId(this._id)})
        .toArray()
        .then(orders=>{
            return orders
        })
    }

    static findById(userId){
        const db = getDb();
        return db.collection('users')
        .findOne({_id: mongodb.ObjectId(userId)})
        .then(user=>{return user;})
        .catch(err=>console.log(err))
    }
}

module.exports = User;