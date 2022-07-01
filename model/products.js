const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  img:{type:String,required:true},
  title:{type:String,required:true},
  price:{type:Number,required:true},
  per:{type:Number,required:true},
  category:{type:String},
  info:{type:String},
  inCart:{type:mongoose.SchemaTypes.Boolean,required:true},
  count:{type:Number, default: 0},
  total:{type:Number, default: 0},
});

module.exports = mongoose.model('products', ProductSchema);

