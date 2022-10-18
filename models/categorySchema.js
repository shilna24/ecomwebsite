const mongoose = require('mongoose')
const Schema = mongoose.Schema


let categorySchema = new Schema({
    categoryName:{
        type:String,
        required:true
    }
    
    })

module.exports=mongoose.model('categories',categorySchema)