const mongoose=require('mongoose')

const subCategory=new mongoose.Schema({
    subcategoryname:{
         type:String,
         required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    }
})

module.exports=mongoose.model("SubCategoryModel",subCategorySchema)

