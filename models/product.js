const Sequelize = require('sequelize');
//fully configured sequelized env
const sequelize = require('../util/database');

//auto pluralize - will create update and create timestamp fields
const Product = sequelize.define('product', {
  id:{
    type:Sequelize.INTEGER,
    autoIncrement:true,
    allowNull: false,
    primaryKey: true
  },
  title:{
    type: Sequelize.STRING,
    allowNull: false
  },
  price:{
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  imageUrl:{
    type: Sequelize.STRING,
    allowNull: false
  },
  description:{
    type: Sequelize.STRING
  }
});

module.exports = Product;