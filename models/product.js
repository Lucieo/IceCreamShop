const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class Product{
  constructor(title, price, description, imageUrl, id, user_id){
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? mongodb.ObjectId(id) : null;
    this.user_id = user_id;
  }
  
  save(){
    //initiate connection with db
    const db = getDb();
    let dbOp;
    if(this._id){
      //UPDATE PRODUCT
      dbOp = db.collection('products').updateOne({id_:this._id}, {$set: this})
    }
    else{
      //CREATE PRODUCT
      dbOp = db.collection('products').insertOne(this)
    }
    return dbOp    
    .then(result=>console.log(result))
    .catch(err=> console.log(err));
  }

  static fetchAll(){
    const db = getDb();
    //find returns all documents through cursor - to Array returns all doc beware of quantity else use pagination
    return db.collection('products')
    .find()
    .toArray()
    .then(products=>{return products})
    .catch(err=>console.log(err));
  }
  
  static findById(prodId){
    const db= getDb();
    return db.collection('products')
    .find({_id: mongodb.ObjectId(prodId)})
    .next()
    .then(product=>{return product;})
    .catch(err=>console.log(err))
  }

  static deleteById(prodId){
    const db = getDb();
    return db.collection('products')
    .deleteOne({_id:mongodb.ObjectId(prodId)})
    .then(result=>console.log('product deleted'))
    .catch(err=>console.log(err))
  }
};

module.exports = Product;