let express=require('express')
let router=express.Router()
const adminController=require('../controllers/adminControlers')
const store = require('../middleware/multer')




/*-----------admin login-----------*/
router.get('/',adminController.getlogin)

/*-----------admin postlogin-------*/
router.post('/adminLogin',adminController.postlogin)

/*-----------admin dashboard--------*/
router.get('/adminDashboard',adminController.getDashboard)



/*---------admin view category---------*/
router.route('/adminCategory')
.get(adminController.getviewCategory)
.post(adminController.postviewCategory)

/*---------admin categoryWiseView-------*/
router.get('/categoryProduct/:category',adminController.viewCategoryWise)

/*---------admin addproduct---------*/
router.route('/addProduct')
.get(adminController.getproduct)
.post(store.array("image",3),adminController.postproduct)

/*---------admin viewproduct--------*/
router.get('/viewProduct',adminController.getviewproductlist)

/*---------admin editproduct----------*/
router.route('/editProduct/:id')
.get(adminController.editproduct)
.post(store.array("image",3),adminController.posteditproduct)


/*---------admin deleteproduct-------*/
router.post('/delete-product/:id',store.array("image",3),adminController.deleteProduct)

/*---------admin deleteproduct-------*/
router.get('/deleteCategoryProduct/:catName',adminController.deleteCategory)

/*---------admin bannermanage---------------*/
router.route('/addBanner')
.get(adminController.getBanner)
.post(store.array("image",3),adminController.postBanner)

/*---------admin removebanner-------*/
router.post('/blockBanner/:id',store.array("image",3),adminController.removeBanner)
/*---------admin coupon-------------*/
router.route('/view-coupen').get(adminController.viewAllCoupens).post(adminController.addCoupen)
router.route('/coupon-status/:couponId').post(adminController.couponStatusChange)
/*---------view users----------------*/
router.get('/viewUser',adminController.viewusers)
 /*--------block or unblock user----------------*/
 router.get('/userStage/:id',adminController.getStatus)
/*---------admin logout------------*/
router.get('/logout',adminController.adminlogout)

module.exports=router
