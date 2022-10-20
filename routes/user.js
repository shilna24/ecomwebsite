let express=require('express')
let router=express.Router()
const userController=require('../controllers/userControlers')

// router.route('/').get(userController.get).post()
/*-------user homepage----------*/

router.get('/',userController.get)

/*-------user login-------------*/
router.get('/userLogin',userController.getlogin)
router.post('/login',userController.postlogin)

/*--------user signup----------------*/
router.route('/signup')
.get(userController.dosignup)
.post(userController.postsignup)

/*--------user update profile--------*/
router.get('/updateProfile',userController.getProfile)
router.post('/updateProfile/:id',userController.postProfile)

/*--------user get product details----------*/
// router.get('/productDetails/:id',userController.getProductView)

/*--------verify otp-------------*/
router.get('/get-otp',userController.getotp)
router.post('/verifyotp',userController.postOtp)

/*--------user logout-----------*/
router.get('/logout',userController.getlogout)




module.exports=router