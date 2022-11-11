let express = require('express')
let router = express.Router()
const userController = require('../controllers/userControlers')
const sessionUser = require('../middleware/userSessionChecking')

/*-------user homepage----------*/

router.get('/', userController.get)

/*-------user login-------------*/
router.get('/userLogin', sessionUser, userController.getlogin)
router.post('/login', userController.postlogin)

/*--------user signup----------------*/
router.route('/signup')
    .get(userController.dosignup)
    .post(userController.postsignup)

/*--------user update profile--------*/
router.route('/my-profile').get(sessionUser, userController.getMyProfile)
// router.post('/updateProfile/:id', userController.postProfile)

router.get('/editProfile', sessionUser, userController.getProfile)
router.post('/editProfile/:id', userController.postProfile)

/*--------user get one product details----------*/
router.get('/productDetails/:id', userController.getProductView)

/*------- get all product details--------------*/
router.get('/view-product', userController.viewAllProducts)

/*--------user cartPage-------------------*/
router.get('/add-to-cart/:proId/:qty', sessionUser, userController.getCart)

/*--------user view cart------------------*/
router.get('/viewCart', sessionUser, userController.cartView)

/*--------change product quantity----------*/
router.post('/change-quantity/:proId/:changeStatus', userController.changeQuantity)

/*--------delete cart item----------------*/
router.delete('/delete-from-cart/:proId', userController.deleteCartItem)
/*----------wishlist----------------------*/
router.post('/add-to-wishlist/:proId', userController.addToWishlist)

router.get('/wishList', sessionUser, userController.viewWishList)

router.delete('/delete-from-wishlist/:proId', userController.deleteWishlistItem)

/*--------verify otp-------------*/
router.get('/get-otp', userController.getotp)
router.post('/verifyotp', userController.postOtp)

/*--------getting aAbout page-------*/
router.get('/aboutUs', userController.getAbout)

router.route('/get-category/:catName').get(userController.getCategories)

router.route('/order-success').get(sessionUser, userController.orderSuccessPage)

router.route('/payment/orderId').post(userController.generateOrder)

router.route('/orders').get(sessionUser, userController.getOrder)

router.route('/checkout').get(sessionUser, userController.checkOut)

router.route('/redeem/:coupCode/:total').post(userController.redeemCoupnAmount)

router.route('/placeOrder').post(userController.placeOrder)

router.route('/payment/orderId').post(userController.generateOrder)

router.route('/payment/verify/:orderId').post(userController.verifyPayment)

router.route('/addAddress').post(userController.addAndEditAddress)
router.route('/delete-address/:addresIndex').delete(userController.deleteAddress)

router.route('/cancel-order/:orderId').post(userController.cancelOrder)


// router.route('/notify-product').post(userController.addNotifyProduct)

/*--------getting about page-------*/
router.get('/contactUs', userController.getContact)

/*--------user logout-----------*/
router.get('/logout', userController.getlogout)





router.get('/500-error', (req, res) => {
    res.status(500).render('user/error-500-page')
})



module.exports = router