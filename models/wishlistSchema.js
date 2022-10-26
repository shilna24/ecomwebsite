const mongoose = require('mongoose')
const Schema = mongoose.Schema
const wishlistSchema = new Schema({
userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',

},
myWish:[{
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'products'
    }
}]
})
module.exports=mongoose.model('wishlist',wishlistSchema)