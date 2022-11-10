let express=require('express')
let router=express.Router()
const adminController=require('../controllers/adminControlers')
const store = require('../middleware/multer')
const sessionAdmin=require('../middleware/adminSessionChecking')
let createError = require('http-errors');



/*-----------admin login-----------*/
router.get('/',sessionAdmin,adminController.getlogin)

/*-----------admin postlogin-------*/
router.post('/adminLogin',adminController.postlogin)

/*-----------admin dashboard--------*/
router.get('/adminDashboard',sessionAdmin,adminController.getDashboard)

router.get('/salesReport',sessionAdmin,adminController.getReport)

/*---------admin view category---------*/
router.route('/adminCategory')
.get(sessionAdmin,adminController.getviewCategory)
.post(adminController.postviewCategory)

/*---------admin categoryWiseView-------*/
router.get('/categoryProduct/:category',sessionAdmin,adminController.viewCategoryWise)

/*---------admin addproduct---------*/
router.route('/addProduct')
.get(sessionAdmin,adminController.getproduct)
.post(store.array("image",3),adminController.postproduct)

/*---------admin viewproduct--------*/
router.get('/viewProduct',sessionAdmin,adminController.getviewproductlist)

/*---------admin editproduct----------*/
router.route('/editProduct/:id')
.get(sessionAdmin,adminController.editproduct)
.post(store.array("image",3),adminController.posteditproduct)


/*---------admin deleteproduct-------*/
router.post('/delete-product/:id',store.array("image",3),adminController.deleteProduct)

/*---------admin deleteproduct-------*/
router.get('/deleteCategoryProduct/:catName',adminController.deleteCategory)

/*---------admin bannermanage---------------*/
router.route('/addBanner')
.get(adminController.getBanner)
.post(store.array("image",3),adminController.postBanner)

router.route('/editBanner/:id')
.get(sessionAdmin,adminController.editbanner)
.post(store.array("image",3),adminController.posteditbanner)

/*---------admin removebanner-------*/
router.post('/blockBanner/:id',store.array("image",3),adminController.removeBanner)


/*---------admin coupon-------------*/
router.route('/view-coupen').get(sessionAdmin,adminController.viewAllCoupens).post(adminController.addCoupen)
router.route('/coupon-status/:couponId').post(adminController.couponStatusChange)


/*---------view users----------------*/
router.get('/viewUser',sessionAdmin,adminController.viewusers)

/*---------view orders-------------------------*/
router.route('/view-orders').get(sessionAdmin,adminController.getAllOrders)

router.route('/cancel-order/:orderId').post(adminController.cancelOrder)

router.route('/status-order/:orderId/:status').post(adminController.orderStatusChange)

/*--------block or unblock user----------------*/
 router.get('/userStage/:id',sessionAdmin,adminController.getStatus)

 

router.route('/get-invoice/:orderId').get(sessionAdmin,adminController.getInvoice)

 /*---------admin logout------------*/
router.get('/logout',adminController.adminlogout)

// router.use(function (req, res, next) {
//     next(createError(404));
//   });
  
//   router.use(function (err, req, res, next) {
//     console.log(err,"admin error route handler")
//     res.status(err.status || 500);
//     res.render('admin/error');
//   });

module.exports=router
