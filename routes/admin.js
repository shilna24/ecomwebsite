let express=require('express')
let router=express.Router()
const adminController=require('../controllers/adminControlers')




/*-----------admin login-----------*/
router.get('/',adminController.getlogin)

/*-----------admin postlogin-------*/
router.post('/adminLogin',adminController.postlogin)

/*----------admin addcategory---------*/
router.get('/addCategory',adminController.getCategory)
router.post('/addCategory',adminController.postCategory)

/*---------admin view category---------*/
router.get('/viewCategory',adminController.getviewCategory)

/*---------admin addproduct---------*/
router.get('/addProduct',adminController.getproduct)
router.post('/addProduct',adminController.postproduct)

/*---------admin viewproduct--------*/
router.get('/viewProduct',adminController.getviewproductlist)

/*---------admin editproduct----------*/
router.get('/editProduct/:id',adminController.editproduct)
router.post('/editProduct/:id',adminController.posteditproduct)


/*---------admin deleteproduct-------*/
router.get('/deleteProduct/:id',adminController.deleteproduct)

/*---------admin editproduct----------*/
router.get('/editCategory/:id',adminController.editCategary)
router.post('/editCategory/:id',adminController.posteditCategory)


/*---------admin deleteproduct-------*/
router.get('/deleteCategory/:id',adminController.deleteCategory)

/*---------view users----------------*/
router.get('/viewUser',adminController.viewusers)
 /*--------block user----------------*/
 router.get('/blockUser/',adminController.blockUsers)


 router.get('/unblockUser/',adminController.unblockUsers)

/*---------admin logout------------*/
router.get('/logout',adminController.adminlogout)

module.exports=router
