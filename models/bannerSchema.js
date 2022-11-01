const mongoose=require('mongoose')
const Schema=mongoose.Schema
const bannerSchema=new Schema({
   
    title1:{
        type:String,
        required:true
    },
    title2:{
        type:String,
        required:true
    },

    image:{
        type:Array,
        required:true
    },
    access:{
        type:Boolean,
        default:true
    }
})
module.exports=mongoose.model('banner',bannerSchema)