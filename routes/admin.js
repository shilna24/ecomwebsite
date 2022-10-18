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

/*----------admin addcategory---------*/
router.get('/addCategory',adminController.getCategory)
router.post('/addCategory',adminController.postCategory)

/*---------admin view category---------*/
router.get('/viewCategory',adminController.getviewCategory)

/*---------admin categoryWiseView-------*/
router.get('/categoryProduct/:category',adminController.viewCategoryWise)

/*---------admin addproduct---------*/
router.get('/addProduct',adminController.getproduct)
router.post('/addProduct',store.array("image",3),adminController.postproduct)

/*---------admin viewproduct--------*/
router.get('/viewProduct',adminController.getviewproductlist)

/*---------admin editproduct----------*/
router.get('/editProduct/:id',adminController.editproduct)
router.post('/editProduct/:id',store.array("image",3),adminController.posteditproduct)


/*---------admin deleteproduct-------*/
router.get('/deleteProduct/:id',store.array("image",3),adminController.deleteproduct)

/*---------admin editproduct----------*/
// router.get('/editCategory/:id',adminController.editCategory)
// router.post('/editCategory/:id',adminController.posteditCategory)


/*---------admin deleteproduct-------*/
router.get('/deleteCategoryProduct/:id',adminController.deleteCategory)

/*---------view users----------------*/
router.get('/viewUser',adminController.viewusers)
 /*--------block user----------------*/
 router.get('/blockUser/',adminController.blockUsers)


 router.get('/unblockUser/',adminController.unblockUsers)

/*---------admin logout------------*/
router.get('/logout',adminController.adminlogout)

module.exports=router
