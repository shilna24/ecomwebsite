let express=require('express')
let router=express.Router()
const userController=require('../controllers/userControlers')

// router.route('/').get(userController.get).post()
/*-------user homepage----------*/

router.get('/',userController.get)

/*-------user login-------------*/
router.get('/userLogin',userController.getlogin)

/*-------user postlogin----------*/
router.post('/login',userController.postlogin)

/*--------user signup-----------*/
router.get('/signup',userController.dosignup)
// router.get('/userSignup',userController.getsignup)


router.post('/signup',userController.postsignup)

/*--------verify otp-------------*/
// router.get('/verifyotp',userController.getotp)

/*--------user logout-----------*/
router.get('/logout',userController.getlogout)




module.exports=router