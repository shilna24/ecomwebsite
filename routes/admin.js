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
router.post('/deleteProduct/:id',store.array("image",3),adminController.deleteproduct)

/*---------admin editproduct----------*/
// router.get('/editCategory/:id',adminController.editCategory)
// router.post('/editCategory/:id',adminController.posteditCategory)


/*---------admin deleteproduct-------*/
router.get('/deleteCategoryProduct/:catName',adminController.deleteCategory)

/*---------view users----------------*/
router.get('/viewUser',adminController.viewusers)
 /*--------block or unblock user----------------*/
 router.get('/userStage/:id',adminController.getStatus)
/*---------admin logout------------*/
router.get('/logout',adminController.adminlogout)

module.exports=router
