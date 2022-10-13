const Admin = require('../models/admin')
const Product=require('../models/productSchema')
const bcrypt=require("bcrypt");
const db = require('../config/connection');
const session = require('express-session');
module.exports={
  
  /*--------admin login-----------*/
  getlogin:async(req,res)=>{
    try{
    res.render('admin/adminLogin')
    }
    catch(error){
            console.log(err)
    }

},

/*----------admin postlogin---------*/
postlogin:(req, res)=> {
  
  const email=req.body.email
  console.log(email);
  const password=req.body.password
  Admin.findOne({email:email},(err,data)=>{
    // console.log(data)
    // bcrypt.compare(data.password, password,(err,result)=>{
      if(data)
      {
   login="true"
   req.session.adminloggedin=true
   req.session.admindata=Admin
   res.render('admin/index')
      }
  else{
        res.redirect('/admin/adminLogin')
      }
    })
    
  },
/*----------admin viewproduct----------*/
getproduct:(req,res,next)=>{
res.render('admin/addProduct')
},

/*---------admin postproduct------------*/
postproduct:(req,res)=>{
  console.log(req.body);
const name=req.body.name
const price=req.body.price
const description=req.body.description
const quantity=req.body.quantity
let image = req.files.Image;
const product=new Product({name:name,price:price,description:description,quantity:quantity})
product.save().then(result=>{
  console.log(result);
  image.mv('./public/product-images/' + result.id + '.jpg', (err, done) => {
    if (!err) {
      res.render('admin/addProduct')
    } else {
      console.log(err);
    }
  
})
})
},
/*-----------view product list-------------*/
getviewproductlist:(req,res,next)=>{
Product.find().then(products=>{
  console.log(products)
  res.render('admin/viewProduct',{products})
})
.catch(err=>{
  console.log(err)
})


},

/*---------admin getproductdetails---*/
// getproductdetails:(req,res,next)=>{
// const prodId=req.params.id
// Product.findById(prodId).then(product=>{
//   res.render()
// })
// },

/*---------admin deleteproduct-------*/
deleteproduct:(req,res,next)=>{
const prodId=req.params.id
console.log(prodId)
Product.findByIdAndRemove(prodId).then(()=>{
  console.log('Destroyed Product')
  res.redirect('/admin/viewProduct')
})
.catch(err=>console.log(err))
},

/*---------admin editproduct---------*/
editproduct:(req,res,next)=>{

Product.findById(req.params.id).then(product=>{
 res.render('admin/editProduct',{product})     
})
},
posteditproduct:(req,res)=>{
  const prodId=req.params.id
  Product.updateOne({id:prodId},{$set: {
    name:req.body.name, 
    price:req.body.price,
    description:req.body.description,
    quantity:req.body.quantity

  }
}).then((err,data)=>{
  console.log("Hi")

    // console.log(data)
    res.redirect('/admin/viewProduct')

})

},
/*---------admin logout-------------*/
adminlogout:(req,res)=>{
  console.log("hi");
  req.session.adminloggedin=false
  res.redirect('/admin/')
}

}
