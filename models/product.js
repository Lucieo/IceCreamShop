const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  productImageUrl: {
    type: String,
    required: true
  },
  userId :{
    type : Schema.Types.ObjectId,
    ref: 'User'
  },
  container:{
    type:String,
    required: true
  },
  ingredients:{
    type:String,
    required: true
  },
  validated:{
    type:Boolean,
    default:false
  }
});

module.exports = mongoose.model('Product', productSchema);
