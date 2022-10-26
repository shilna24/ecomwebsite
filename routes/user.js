let express = require('express')
let router = express.Router()
const userController = require('../controllers/userControlers')


/*-------user homepage----------*/

router.get('/', userController.get)

/*-------user login-------------*/
router.get('/userLogin', userController.getlogin)
router.post('/login', userController.postlogin)

/*--------user signup----------------*/
router.route('/signup')
    .get(userController.dosignup)
    .post(userController.postsignup)

/*--------user update profile--------*/
router.get('/updateProfile', userController.getProfile)
router.post('/updateProfile/:id', userController.postProfile)

/*--------user get one product details----------*/
router.get('/productDetails/:id', userController.getProductView)

/*------- get all product details--------------*/
router.get('/viewAllProduct/',userController.viewAllProducts)

/*--------user cartPage-------------------*/
router.get('/add-to-cart/:proId/:qty', userController.getCart)

/*--------user view cart------------------*/
router.get('/viewCart', userController.cartView)

/*--------change product quantity----------*/
router.post('/change-quantity/:proId/:changeStatus', userController.changeQuantity)

/*--------delete cart item----------------*/
router.delete('/delete-from-cart/:proId', userController.deleteCartItem)
/*----------wishlist----------------------*/
router.post('/add-to-wishlist/:proId',userController.addToWishlist)

router.get('/wishList',userController.viewWishList)

router.delete('/delete-from-wishlist/:proId',userController.deleteWishlistItem)

/*--------verify otp-------------*/
router.get('/get-otp', userController.getotp)
router.post('/verifyotp', userController.postOtp)

/*--------getting about page-------*/
router.get('/aboutUs',userController.getAbout)

/*--------getting about page-------*/
router.get('/contactUs',userController.getContact)

/*--------user logout-----------*/
router.get('/logout', userController.getlogout)




module.exports = router