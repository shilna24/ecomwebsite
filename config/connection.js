const mongoose=require('mongoose')
mongoose.connect(process.env.MONGODB_URL)


mongoose.connection
.once("open",()=>console.log("connected"))
.on("error",error=>{
    console.log("your error",error);
})