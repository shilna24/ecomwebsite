const mongoose=require('mongoose')
mongoose.connect('mongodb+srv://shilna:LTuLYj4lMZI91TO3@cluster0.csnhdv3.mongodb.net/ecommerce?retryWrites=true&w=majority')


mongoose.connection
.once("open",()=>console.log("connected"))
.on("error",error=>{
    console.log("your error",error);
})