const mongoose=require('mongoose')

const Schema=mongoose.Schema
const userSchema=new Schema({
    Name: {
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true
    },
    Phone:{
        type:Number,
        required:true
    },
    Password:{
        type:String,
        required:true
    
    },
    Access:{
        type:Boolean,
        required:true
    }
})
module.exports=mongoose.model('user',userSchema)