let express=require('express')
let router=express.Router()
const adminController=require('../controllers/adminControlers')
/*---------admin addproduct---------*/
router.get('/addProduct',adminController.getproduct)
router.post('/addProduct',adminController.postproduct)

/*-----------admin login-----------*/
router.get('/',adminController.getlogin)

/*-----------admin postlogin-------*/
router.post('/adminLogin',adminController.postlogin)

/*---------admin viewproduct--------*/
router.get('/viewProduct',adminController.getviewproductlist)


// router.route.get('/addProduct',).post('/addProduct',)

/*---------admin editproduct----------*/
router.get('/editProduct/:id',adminController.editproduct)
router.post('/editProduct/:id',adminController.posteditproduct)


/*---------admin deleteproduct-------*/
router.get('/deleteProduct/:id',adminController.deleteproduct)

/*---------view users----------------*/
router.get('/viewUser',adminController.viewusers)
 /*--------block user----------------*/
 router.get('/blockUser/',adminController.blockUsers)

 /*--------unblock user---------------*/
 router.get('/unblockUser/',adminController.unblockUsers)

/*---------admin logout------------*/
router.get('/logout',adminController.adminlogout)

module.exports=router
