const Admin = require('../models/admin')
const Product = require('../models/productSchema')
const User = require('../models/user')
const Category = require('../models/categorySchema')
const Banner = require('../models/bannerSchema')
const Order = require('../models/orderShema')
const Cart = require('../models/cartSchema')
const couponModel = require('../models/couponSchema')
const bcrypt = require("bcrypt");
const session = require('express-session');
const db = require('../config/connection');
const Multer = require('../middleware/multer')
// const session = require('express-session')

let catLogErr = null;
module.exports = {

  /*--------admin login-----------*/
  getlogin: async(req, res) => {
try{
  let totalSales=await Order.aggregate([
  {
      $match:{
          orderActive:true
      }
  },
  {
      $group:{
          _id:null,
          totalSale:{$sum:"$total"}
      }
  }
])
let totalSale=totalSales[0].totalSale
let totalUsers=await User.find({}).count()
//cashtotal cod&delivered , online&not canceled
let totalCash=await Order.aggregate([
  {
      $match:{
          $or:[{
              $and:[{status:"Delivered"},{paymentType:"cod"}]},{
                  $and:[{paymentType:"Online Payment"},{orderActive:true}]
              }]
          }
      },
      {
          $group:{
              _id:null,
              totalCash:{$sum:"$total"}
          }
      }
  ])
//total orders not canceled and not delivered
let totalOrderCount=await Order.aggregate([
{
  $match:{
      $and:[{orderActive:true},{status:{$ne:"Delivered"}}]
  }
},
{
  $count:"total"
}
])
let orderCount=totalOrderCount[0].total
let totalMoney=totalCash[0].totalCash

const allOrders = await Order.find().populate([
{
  path: "userId",
  model: "user"
},
{
  path: "products.productId",
  model: "products"
}
]).exec()



  res.render('admin/adminDashboard',{totalSale,totalUsers,totalMoney,orderCount,allOrders});
}
 catch(error){
  console.log(error);
 }     
  
  },

  /*----------admin postlogin---------*/
  postlogin: (req, res) => {

    const email = req.body.email
    console.log(email);
    const password = req.body.password
    console.log(password);
    Admin.findOne({ email: email }, (err, data) => {
      console.log(data)

      if (data) {

        if (password == data.password) {

          req.session.adminloggedin = true
          req.session.adminData = data
          res.redirect('/admin')
        } else {
          req.flash('adminErr', 'Please Enter correct Password !');
          res.redirect('/admin/')

        }

      } else {
        req.flash('adminErr', 'Please Enter valid email address !');
        res.redirect('/admin/')

      }
    })

  },
  /*-----------admin dashboard-------------*/
  getDashboard: (req, res) => {
  try{
    res.render('admin/adminDashboard',{totalSale,totalUsers,totalMoney,orderCount,allOrders})
  }
   catch(error)
   {
    console.log(error);
   }   
  },
  /*------------view category list------------*/
  getviewCategory: (req, res) => {
    try {
      Category.find().then(categories => {
        res.render('admin/adminCategory', { categories ,catLogErr:req.flash('catLogErr')})
      
      })
    }
    catch (error) {
      console.log(error);
    }

  },

  /*---------admin post category----------*/
  postviewCategory: async (req, res, next) => {

    const categoryName = req.body.category.toUpperCase()
    console.log(categoryName);
    let catData = await Category.findOne({ categoryName: categoryName })
    console.log(catData);
    if (!catData) {
      console.log('err');
      const category = new Category({ categoryName })
      category.save().then(result => {
        console.log(result);
        res.redirect('/admin/adminCategory')
      })
        .catch(error => {
          console.log(error)
        })
    }
    else {
      console.log('Already exist');
      req.flash('catLogErr', 'This Category already exist')
      res.redirect('/admin/adminCategory');

    }

  },
  /*---------admin deleteCategory-------*/
  deleteCategory: (req, res, next) => {
    Product.find({ category: req.params.catName }).then((productList) => {
      console.log('Category Removed')
      if (productList.length == 0) {
        console.log('delete ok');
        catId = req.params.id
        Category.deleteOne({ categoryName: req.params.catName }).then((result) => {
          console.log(result);
        }).catch((err) => {
          console.log(err);
        })
        res.redirect('/admin/adminCategory')
      }
      else {
        req.flash('catLogErr', 'This category contains Products')
      res.redirect('/admin/adminCategory');
      }
      
    })

  },


  /*------------admin categoryWiseView--------*/
  viewCategoryWise: (req, res) => {
    try {
      let catName = req.params.category
      Category.find().then((categories) => {
        Product.find({ category: catName }).then((products) => {
          res.render('admin/addProduct', { products, categories })
        })
      })
    }
    catch (error) {
      console.log('error');
    }
  },

  /*----------admin viewproduct----------*/
  getproduct: (req, res, next) => {
    try {
      Product.find().then(products => {
        console.log(products)

        Category.find().then((categories) => {
          res.render('admin/addProduct', { categories, products })
        })
      })
    }
    catch (error) {
      console.log('error');
    }
  },

  /*---------admin postproduct------------*/
  postproduct: (req, res) => {
    console.log(req.body);
    const { name, price, description, category, checkbox, quantity, image } = req.body
    console.log(req.body.checkbox);
    const files = req.files
    if (files) {
      let Images = []
      console.log(req.files.length)
      console.log(req.files)
      for (i = 0; i < req.files.length; i++) {
        Images[i] = files[i].filename
      }
      const product = new Product({ name: name, price: price, description: description, category: category, size: checkbox, quantity: quantity, image: Images })
      product.save().then((result) => {
        console.log(result);
        res.redirect('/admin/addProduct')
      }
      )
    }
    else {
      console.log(err);
    }
  },
  /*-----------view product list-------------*/
  getviewproductlist: (req, res, next) => {
    try {
      Product.find().then(products => {
        console.log(products)
        res.render('admin/viewProduct', { products })
      })
    }
    catch (error) {
      console.log(error);
    }
  },
  /*---------------------------------------------*/
  viewusers: (req, res, next) => {
    try {
      User.find().then(users => {
        console.log(users)
        res.render('admin/viewUser', { users })
      })
    }
    catch (error) {
      console.log(error);
    }
  },
  /*----------------------------------------------------------------------------------*/
  getStatus: (req, res, next) => {
    let userId = req.params.id
    console.log(userId);
    User.findOne({ _id: userId }, (err, data) => {
      console.log(data);
      if (!err) {
        if (data.Access) {
          User.updateOne({ _id: userId }, { $set: { Access: false } }).then(() => {
            res.json({ status: true })

          })
        }
        else {
          User.updateOne({ _id: userId }, { $set: { Access: true } }).then(() => {
            res.json({ status: true })

          })
        }
      }
      else {
        console.log(err);
      }

    })
  },
  deleteProduct: (req, res, next) => {
    let prodId = req.params.id
    console.log(prodId);
    Product.findOne({ _id: prodId }, (err, data) => {
      console.log(data);
      if (!err) {
        if (data.active) {
          Product.updateOne({ _id: prodId }, { $set: { active: false } }).then(() => {
            res.json({ status: true })
          })
        }
        else {
          Product.updateOne({ _id: prodId }, { $set: { active: true } }).then(() => {
            res.json({ status: true })
          })
        }
      }
      else {
        console.log(err);
      }

    })
  },

  /*---------admin editproduct---------*/
  editproduct: async (req, res, next) => {
    try {
      Category.find().then(async (categories) => {
        console.log(categories);
        await Product.findById(req.params.id).then(products => {
          res.render('admin/editProduct', { products, categories })
        })
      })

    } catch (error) {
      console.log(error);
    }
  },
  /*--------------------------------------------------------------------*/
  posteditproduct: async (req, res) => {
    const prodId = req.params.id
    let Images = []
    if (req.files.length !== 0) {

      for (i = 0; i < req.files.length; i++) {
        Images[i] = req.files[i].filename
      }
      await Product.updateOne({ _id: prodId }, {
        image: Images
      })

    }
    await Product.updateOne({ _id: prodId }, {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      quantity: req.body.quantity,
      category: req.body.category,
      size: req.body.checkbox,

    })
    res.redirect('/admin/addProduct')

  },

  /*---------------banner management---------------------*/
  getBanner: (req, res) => {
    try {
      Banner.find().then((banners) => {
        res.render('admin/addBanner', { banners })
      })
    }
    catch(error){
      console.log(error);
    }

  },
  postBanner: async (req, res) => {
    console.log(req.body);
    const { name, name1, image } = req.body
    const files = req.files
    if (files) {
      let Images = []
      console.log(req.files.length)
      console.log(req.files)
      for (i = 0; i < req.files.length; i++) {
        Images[i] = files[i].filename
      }
      const banner = new Banner({ title1: name, title2: name1, image: Images, access: true })
      await banner.save().then((result) => {
        console.log(result);
        res.redirect('/admin/addBanner')
      })
    }
    else {
      console.log(err);
    }
  },

  /*---------remove banner------------*/
  removeBanner: async (req, res, next) => {
    let bannerId = req.params.id
    try {
      let banner = await Banner.findOne({ _id: bannerId })
      // console.log(coupon);
      if (banner.access) {
        Banner.updateOne({ _id: bannerId }, { $set: { access: false } }).then(async () => {
          res.json({ status: true })
        })
      } else {
        Banner.updateOne({ _id: bannerId }, { $set: { access: true } }).then(async () => {
          res.json({ status: true })
        })
      }
    } catch (err) {
      console.log(err);
      // res.redirect('back')
    }
  },

  editbanner: (req, res, next) => {
    try{
      Banner.findById(req.params.id).then(banners => {
        res.render('admin/editBanner', { banners })
      })
    }
    catch(error) {
      console.log(error);
    }

  },
  /*--------------------------------------------------------------------*/
  posteditbanner: async (req, res) => {
    const bannerId = req.params.id
    const files = req.files
    let Images = []
    if (files) {
      console.log(req.files.length)
      console.log(req.files)
      for (i = 0; i < req.files.length; i++) {
        Images[i] = files[i].filename
      }
      req.body.image = Images
      await Banner.updateOne({ _id: bannerId }, {
        title1: req.body.name,
        title2: req.body.name1,
        image: Images
      })
      res.redirect('/admin/addBanner')

    }
  },
  /*-------------coupon management---------------*/
  viewAllCoupens: async (req, res) => {
    try {
      const coupon = await couponModel.find()
      res.render('admin/view-coupens', { coupon })
    }
    catch (error) {
      console.log(error);

    }

  },
  addCoupen: async (req, res) => {
    console.log(req.body);
    const { name, couponCode, discount, maxLimit, minPurchase, expDate } = req.body
    try {
      await couponModel.create({
        name: name.toUpperCase(),
        couponCode: couponCode.toUpperCase(),
        discount,
        maxLimit,
        minPurchase,
        expDate
      })
      res.redirect('back')

    } catch (error) {
      console.log(error);

    }
  },
  couponStatusChange: async (req, res) => {
    console.log(req.params.couponId);
    let couponId = req.params.couponId
    try {
      let coupon = await couponModel.findOne({ _id: couponId })
      if (coupon.isActive) {
        couponModel.updateOne({ _id: couponId }, { $set: { isActive: false } }).then(async () => {
          res.json({ status: true })
        })
      } else {
        couponModel.updateOne({ _id: couponId }, { $set: { isActive: true } }).then(async () => {
          res.json({ status: true })
        })
      }
    } catch (err) {
      console.log(err);
      
    }
  },

  /*----------admin orders--------------*/
  getAllOrders: async (req, res) => {
    try
    {
      const allOrders = await Order.find({}).populate([
        {
          path: "userId",
          model: "user"
        },
        {
          path: "products.productId",
          model: "products"
        }
      ]).exec()
      console.log(allOrders);
      res.render('admin/view-orders', { allOrders })
    }
    catch(error)
    {
      console.log(error);
    }
    
  },

  cancelOrder: async (req, res) => {
    let orderId = req.params.orderId
    await Order.findByIdAndUpdate(orderId, {
      orderActive: false
    })
    res.json({ status: true })
  },

  orderStatusChange: async (req, res) => {
    console.log(req.params.orderId);
    console.log(req.params.status);
    let orderId = req.params.orderId
    let status = req.params.status
    if (status === "pending") {

      await Order.findByIdAndUpdate(orderId, {
        status: "Packed"
      })
    } else if (status === "Packed") {
      await Order.findByIdAndUpdate(orderId, {
        status: "Shipped"
      })
    } else if (status === "Shipped") {
      await Order.findByIdAndUpdate(orderId, {
        status: "Out For Delivery"
      })
    } else if (status === "Out For Delivery") {
      await Order.findByIdAndUpdate(orderId, {
        status: "Delivered"
      })
    }
    res.json({ status: true })

  },

  /*---------admin logout-------------*/
  adminlogout: (req, res) => {
    req.session.adminData = null
    req.session.adminloggedin = false
    res.redirect('/admin')
  }

}
