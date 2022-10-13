const mongoose = require('mongoose')
const Schema = mongoose.Schema


const categorySchema = new Schema({
    Category:String,
    required:true
    })

const category=mongoose.model('category',categorySchema)
module.exports=category