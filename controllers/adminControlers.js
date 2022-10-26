const Admin = require('../models/admin')
const Product = require('../models/productSchema')
const User = require('../models/user')
const Category = require('../models/categorySchema')
const Cart = require('../models/cartSchema')
const bcrypt = require("bcrypt");
const session = require('express-session');
const db = require('../config/connection');
const Multer = require('../middleware/multer');

let adminLoggErr = null;
let catLogErr = null;
// const session = require('express-session');
module.exports = {

  /*--------admin login-----------*/
  getlogin: (req, res) => {

    if (req.session.adminloggedin) {
      res.render('admin/index');
    }
    else {
      res.render('admin/adminLogin', { adminLoggErr })
      adminLoggErr = null
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
          adminLoggErr = 'Incorrect password'
          res.redirect('/admin/')

        }

      } else {
        adminLoggErr = 'Not exist'
        res.redirect('/admin/')

      }
    })

  },
  /*-----------admin dashboard-------------*/
  getDashboard: (req, res) => {
    if (req.session.adminloggedin) {
      res.render('admin/adminDashboard')
    } else {
      res.redirect('/admin/')
    }

  },
  /*------------view category list------------*/
  getviewCategory: (req, res, next) => {
    if (req.session.adminloggedin) {
      Category.find().then(categories => {
        res.render('admin/adminCategory', { categories, catLogErr, })
        catLogErr = null
      })
    }
    else {
      res.redirect('/admin')
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
        .catch(err => {
          console.log('error')
        })
    }
    else {
      console.log('Already exist');
      catLogErr = "This category already exists"
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
        catLogErr = "Can't delete category contains product"
        res.redirect('/admin/adminCategory')
      }
      // catLogErr = null
    })

  },

  /*----------admin edit category---------*/
  // editCategory: (req, res, next) => {

  //   Category.findById(req.params.id).then(categories => {
  //     res.render('admin/editCategory', { categories })
  //   })
  // },

  // /*----------admin post editCategory-------*/
  // posteditCategory: async (req, res) => {
  //   if (req.session.adminloggedin) {
  //     const catId = req.params.id
  //     await Category.updateOne({ _id: catId }, {
  //       categoryName: req.body.categoryName

  //     })
  //     res.redirect('/admin/viewCategory')
  //   }
  //   else {
  //     res.redirect('/admin/')
  //   }


  // },
  /*------------admin categoryWiseView--------*/
  viewCategoryWise: (req, res) => {
    if (req.session.adminloggedin) {
      let catName = req.params.category
      Product.find({ category: catName }).then((products) => {
        res.render('admin/viewProduct', { products })
      })
    } else {
      res.redirect('/admin/')
    }

  },

  /*----------admin viewproduct----------*/
  getproduct: (req, res, next) => {
    if (req.session.adminloggedin) {
      Category.find().then((categories) => {
        res.render('admin/addProduct', { categories })
      })
    }
    else {
      res.redirect('/admin/')
    }
  },

  /*---------admin postproduct------------*/
  postproduct: (req, res) => {

    console.log(req.body);
    const { name, price, description, category, checkbox, quantity, image } = req.body
    console.log(req.body.checkbox);
    let files = req.files

    console.log(req.files)

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
        res.redirect('/admin/viewProduct')
      }
      )
    }
    else {
      console.log(err);
    }
  },





  /*-----------view product list-------------*/
  getviewproductlist: (req, res, next) => {
    if (req.session.adminloggedin) {
      Product.find().then(products => {
        console.log(products)
        res.render('admin/viewProduct', { products })
      })
    }
    else {
      res.redirect('/admin/')
    }
  },
  /*---------------------------------------------*/
  viewusers: (req, res, next) => {
    if (req.session.adminloggedin) {
      User.find().then(users => {
        console.log(users)
        res.render('admin/viewUser', { users })
      })
    }
    else {
      res.redirect('/admin/')
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
            // res.redirect('/admin/viewUser')
          })
        }
        else {
          User.updateOne({ _id: userId }, { $set: { Access: true } }).then(() => {
            res.json({ status: true })
            // res.redirect('/admin/viewUser')
          })
        }
      }
      else {
        console.log(err);
      }

    })
  },



  /*---------admin deleteproduct-------*/
  deleteproduct: (req, res, next) => {
    const prodId = req.params.id
    console.log(prodId)
    Product.findByIdAndRemove(prodId).then(() => {
      console.log('Destroyed Product')
      res.json({ status: true })
    })
      .catch(err => console.log(err))
  },

  /*---------admin editproduct---------*/
  editproduct: async (req, res, next) => {
    if (req.session.adminloggedin) {
      Category.find().then(async (categories) => {
        console.log(categories);
        await Product.findById(req.params.id).then(products => {
          res.render('admin/editProduct', { products, categories })
        })
      })

    } else {
      res.redirect('/admin/')
    }

  },
  /*--------------------------------------------------------------------*/
  posteditproduct: async (req, res) => {
    const prodId = req.params.id
    const files = req.files
    let Images = []
    if (files) {
      console.log(req.files.length)
      console.log(req.files)
      for (i = 0; i < req.files.length; i++) {
        Images[i] = files[i].filename
      }
      req.body.image = Images
      await Product.updateOne({ _id: prodId }, {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        quantity: req.body.quantity,
        category: req.body.category,
        size: req.body.size,
        image: Images
      })
      res.redirect('/admin/viewProduct')

    }
  },
  /*---------admin logout-------------*/
  adminlogout: (req, res) => {
    req.session.adminData = null
    req.session.adminloggedin = false
    res.redirect('/admin')
  }

}
