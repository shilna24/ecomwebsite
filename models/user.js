const mongoose=require('mongoose')

const Schema=mongoose.Schema

const AddressSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    pincode: {
      type: Number,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    }
  
  
  })

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
        default:true
    },
    Address : {
        type : [AddressSchema]
      }
})
module.exports=mongoose.model('user',userSchema)