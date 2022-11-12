const User = require('../models/user')
const Product = require('../models/productSchema')
const bcrypt = require('bcrypt')
const Category = require('../models/categorySchema')
const Wishlist = require('../models/wishlistSchema')
const Order = require('../models/orderShema')
const Banner = require('../models/bannerSchema')
const db = require('../config/connection')
const twilo = require('../twilo/twilio')
const client = require('twilio')(twilo.accountSid, twilo.authToken);
const couponModel = require('../models/couponSchema')
const session = require('express-session');
const Cart = require('../models/cartSchema')
const Razorpay = require('razorpay');
const { resourceLimits } = require('worker_threads')
const { default: mongoose } = require('mongoose')
const instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});
login = false
module.exports = {
    /*---------------------user homepage---------------------*/

    get: async (req, res, next) => {
        try {
            if (req.session.user) {
                const userId = req.session.user._id
                const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()
                if (viewcart) {
                    req.session.cartNumber = viewcart.Products.length
                }
                const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
                if (wishlist) {
                    req.session.wishlistNumber = wishlist.myWish.length
                }

            }
            else {
                req.session.cartNumber = 0
                req.session.wishlistNumber = 0
            }
            const pageNum = req.query.page
            const perPage = 4
            let docCount;
            const products = await Product.find({ active: true }).countDocuments().then(documents => {
                docCount = documents;
                return Product.find({ active: true }).skip((pageNum - 1) * perPage).limit(perPage)
            })
            const banners = await Banner.find({ access: true })
            const categories = await Category.find({})
            res.render('user/home', { login: req.session.userloggedin, users: req.session.user, products, categories, wishlistNumber: req.session.wishlistNumber, cartNumber: req.session.cartNumber, banners, currentPage: pageNum, totalDocuments: docCount, pages: Math.ceil(docCount / perPage) })

        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },

    /*------------------user loginPage-----------------------*/

    getlogin: async (req, res, next) => {
        try {
            res.redirect('/')
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    postlogin: async (req, res, next) => {
        try {
            userData = req.body
            await User.findOne({ Email: userData.email }).then((user) => {
                if (user) {
                    if (!user.Access) {
                        loginerr = "you were blocked by admin"
                        res.redirect('/userLogin')
                    }
                    else {
                        
                        bcrypt.compare(userData.password, user.Password, async function (error, isMatch) {
            
                            if (isMatch) {

                                req.session.userloggedin = true
                                req.session.user = user

                                res.json({ loginStatus: true })

                            }
                            else {
                                res.json({ passwordErr: true })

                                // res.redirect('/userLogin')
                            }
                        })
                    }

                }
                else {
                    res.json({ emailErr: true })


                    // res.redirect('/userLogin')
                }
            })

        }
        catch (err) {
            console.log(err);
            next(err)
        }


    },

    /*-----------------user signup---------------------------*/

    dosignup: (req, res, next) => {
        try {
            res.render('user/signup');
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    postsignup: (req, res, next) => {
        try {
            
            let details = req.body
            req.session.details = details
            User.find({ Email: req.body.Email }, async (err, data) => {
                if (data.length == 0) {
                    // req.session.otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, digits: true, lowerCaseAlphabets: false })
                    details.Password = await bcrypt.hash(details.Password, 10)
                    client.verify.v2.services(process.env.service_id)
                        .verifications
                        .create({ to: '+91' + req.body.Phone, channel: 'sms' })
                        .then(verification => console.log(verification.status));
                    res.json({ status: true })
                }
                else {
                    res.json({ emailExist: true })
                    // res.redirect('/')
                }
            })
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    /*-------------view all product-----------------------*/
    viewAllProducts: async (req, res, next) => {
        try {
            let categories = await Category.find()
            let products = await Product.find({ active: true })
            if (req.session.user) {
                const userId = req.session.user._id

                const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()
                if (viewcart) {
                    req.session.cartNumber = viewcart.Products.length
                }
                const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
                if (wishlist) {
                    req.session.wishlistNumber = wishlist.myWish.length
                }
            }
            else {
                req.session.cartNumber = 0
                req.session.wishlistNumber = 0
            }
            res.render('user/view-product', { login: req.session.userloggedin, users: req.session.user, products, categories, cartNumber: req.session.cartNumber, wishlistNumber: req.session.wishlistNumber })

        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },


    getProductView: async (req, res, next) => {
        try {
            const proId = req.params.id
            let products = await Product.findOne({ _id: mongoose.Types.ObjectId(proId) })
            // if(!products){                    
            //     res.send('500')
            // }
            if (req.session.user) {

                const userId = req.session.user._id
                const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()
                if (viewcart) {
                    req.session.cartNumber = viewcart.Products.length
                }
                const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
                if (wishlist) {
                    req.session.wishlistNumber = wishlist.myWish.length
                }
            }
            else {
                req.session.cartNumber = 0
                req.session.wishlistNumber = 0
            }
            res.render('user/productDetails', { login: req.session.userloggedin, users: req.session.user, products, cartNumber: req.session.cartNumber, wishlistNumber: req.session.wishlistNumber })
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },

    /*----------------otp setup-------------------------------*/
    getotp: (req, res, next) => {
        try {
            res.render('user/verifyotp')
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    postOtp: (req, res, next) => {
        try {
            const otp = req.body.otp
            const num = req.body.Phone
            client.verify.v2.services(process.env.service_id)
                .verificationChecks
                .create({ to: '+91' + req.session.details.Phone, code: otp })
                .then(verification_check => {
                    if (verification_check.status === 'approved') {

                        let userData = req.session.details
                        
                        let userSignData = new User({
                            Name: userData.Name,
                            Email: userData.Email,
                            Password: userData.Password,
                            Phone: userData.Phone,
                        })
                        userSignData.save().then((data) => {
                            console.log(data);
                            req.session.userloggedin = true
                            req.session.user = data
                            res.redirect('/')
                        })
                    }
                    else {
                        res.redirect('/get-otp')
                    }
                })
        }
        catch (err) {
            console.log(err);
            next(err)
        }

        //  console.log(verification_check.status));


    },
    /*--------------user Profile----------------------------*/
    getProfile: async (req, res, next) => {
        try {
            let users = req.session.user
            const userId = req.session.user._id
            const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()
            if (viewcart) {
                req.session.cartNumber = viewcart.Products.length
            }
            const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
            if (wishlist) {
                req.session.wishlistNumber = wishlist.myWish.length
            }
            
            res.render('user/editProfile', { login: req.session.userloggedin, users: req.session.user, cartProducts: viewcart, wishlistNumber: req.session.wishlistNumber, cartNumber: req.session.cartNumber })
        }
        catch (err) {
            console.log(err);
            next(err)
        }
    },
    postProfile: (req, res, next) => {

        try {
            User.updateOne({ _id: req.params.id }, {

                Name: req.body.Name,
                Email: req.body.Email,
                Phone: req.body.Phone

            }).then(async (err, data) => {
                let newUser = await User.findById({ _id: req.params.id })
            
                req.session.user = newUser
                req.session.userloggedin = true
                res.redirect('/my-profile')

            })
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    /*------------------cart------------------------------------*/
    getCart: async (req, res, next) => {
        
        const productId = req.params.proId
        const quantity = parseInt(req.params.qty)
        try {
            const findProduct = await Product.findById(productId)
            const price = findProduct.price
            const name = findProduct.name
            if (findProduct.quantity >= quantity) {
                findProduct.quantity -= quantity
                const userId = req.session.user._id
                let cart = await Cart.findOne({ userId })
                if (cart) {
                    /*Cart is exists for user*/
                    let itemIndex = cart.Products.findIndex(p => p.productId == productId)
                    if (itemIndex > -1) {
                        /* products exist in the cart and update the quantity*/
                        let productItem = cart.Products[itemIndex]
                        productItem.quantity += quantity
                    }
                    else {
                        /*products does not exists in cart,add new item*/
                        cart.Products.push({ productId, quantity, name, price })
                    }
                    cart.total = cart.Products.reduce((acc, curr) => {
                        return acc + curr.quantity * curr.price
                    }, 0)
                    await cart.save()
                }
                else {
                    /*creating a new cart for a user */
                    const total = quantity * price
                    cart = new Cart({
                        userId: userId,
                        Products: [{ productId, quantity, name, price }],
                        total: total
                    })
                    await cart.save()
                }
                res.json({ status: true })
            }
            else {
                res.json({ status: true })
            }
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    /*-------------cart view-------------------------------*/
    cartView: async (req, res, next) => {
        try {
            const userId = req.session.user._id
            const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()

            if (viewcart) {
                req.session.cartNumber = viewcart.Products.length
            }
            const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
            if (wishlist) {
                req.session.wishlistNumber = wishlist.myWish.length
            }
            res.render('user/viewCart', { login: req.session.userloggedin, users: req.session.user, cartProducts: viewcart, wishlistNumber: req.session.wishlistNumber, cartNumber: req.session.cartNumber })
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },

    /*----------------change quantity--------------------------*/
    changeQuantity: async (req, res, next) => {
        try {
            let productId = req.params.proId.toString()
            let changeStatus = req.params.changeStatus
            let userId = req.session.user._id
            let cart = await Cart.findOne({ userId })
            let itemIndex = cart.Products.findIndex(p => p._id == productId)
            let productItem = cart.Products[itemIndex]
            if (changeStatus == -1) {
                productItem.quantity -= 1
            } else {
                productItem.quantity += 1
            }
            cart.total = cart.Products.reduce((acc, curr) => {
                return acc + curr.quantity * curr.price
            }, 0)
            await cart.save()
            res.json({ status: true })
        }
        catch (err) {
            console.log(err);
            next(err)
        }
    },

    /*---------------delete cart item--------------------*/
    deleteCartItem: async (req, res, next) => {
        try {
            let productId = req.params.proId
            let userId = req.session.user._id
            let cart = await Cart.findOne({ userId })
            let itemIndex = cart.Products.findIndex(p => p._id == productId)
            cart.Products.splice(itemIndex, 1)
            cart.total = cart.Products.reduce((acc, curr) => {
                return acc + curr.quantity * curr.price
            }, 0)
            await cart.save()
            res.json({ status: true })
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    /*-----------------add wishlist---------------------------*/
    addToWishlist: async (req, res, next) => {
        const productId = req.params.proId
        try {
            const userId = req.session.user._id
            let list = await Wishlist.findOne({ userId: userId })
            console.log(list);
            if (list) {
                let itemIndex = list.myWish.findIndex(p => p.productId == productId)
                if (itemIndex > -1) {
                    list.myWish.splice(itemIndex, 1)
                    await list.save()
                }
                else {
                    list.myWish.push({ productId })

                }
                await list.save()
                res.json({ status: true })
            }
            else {
                list = new Wishlist({
                    userId: userId,
                    myWish: [{ productId }]
                })

                await list.save()
                res.json({ status: true })
            }
        } catch (err) {
            console.log(err);
            next(err)
        }

    },
    /*---------------view wishlist-----------------------*/
    viewWishList: async (req, res, next) => {
        try {
            const userId = req.session.user._id
            const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()
            if (viewcart) {
                req.session.cartNumber = viewcart.Products.length
            }
            const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
            if (wishlist) {
                req.session.wishlistNumber = wishlist.myWish.length
            }
            res.render('user/wishList', { login: req.session.userloggedin, users: req.session.user, wishProducts: wishlist, wishlistNumber: req.session.wishlistNumber, cartNumber: req.session.cartNumber })
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    /*---------------remove wishlist---------------------*/
    deleteWishlistItem: async (req, res, next) => {
        try {
            let productId = req.params.proId
            let userId = req.session.user._id
            let wishlist = await Wishlist.findOne({ userId })
            let itemIndex = wishlist.myWish.findIndex(p => p._id == productId)
            wishlist.myWish.splice(itemIndex, 1)
            await wishlist.save()
            res.json({ status: true })
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    /*-----------about page-----------------------------*/
    getAbout: async (req, res, next) => {
        try {
            const users = req.session.user
            if (req.session.user) {
                const userId = req.session.user._id
                const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()
                if (viewcart) {
                    req.session.cartNumber = viewcart.Products.length
                }
                const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
                if (wishlist) {
                    req.session.wishlistNumber = wishlist.myWish.length
                }
            } else {
                req.session.cartNumber = 0
                req.session.wishlistNumber = 0
            }
            res.render('user/aboutUs', { users, cartNumber: req.session.cartNumber, wishlistNumber: req.session.wishlistNumber })
        }
        catch (err) {
            console.log(err);
            next(err)
        }
    },


    /*--------------categories ---------------------------*/
    getCategories: (req, res, next) => {
        try {
            let catName = req.params.catName

            Product.find({ category: catName }).then((products) => {

                res.json(products)
            })
        }
        catch (err) {
            console.log(err);
            next(err)
        }



    },

    /*---------------contact page--------------------------*/
    getContact: async (req, res, next) => {
        try {

            let users = req.session.user
            if (req.session.user) {
                const userId = req.session.user._id
                const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()
                if (viewcart) {
                    req.session.cartNumber = viewcart.Products.length
                }
                const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
                if (wishlist) {
                    req.session.wishlistNumber = wishlist.myWish.length
                }
            }
            else {
                req.session.cartNumber = 0
                req.session.wishlistNumber = 0
            }
            res.render('user/contactUs', { users, cartNumber: req.session.cartNumber, wishlistNumber: req.session.wishlistNumber })
        }
        catch (err) {
            console.log(err);
            next(err)
        }


    },

    /*---------------order placing--------------------------*/
    checkOut: async (req, res, next) => {
        try {
            let users = req.session.user

            const userId = req.session.user._id
            const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()
            if (viewcart) {
                req.session.cartNumber = viewcart.Products.length
            }
            const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
            if (wishlist) {
                req.session.wishlistNumber = wishlist.myWish.length
            }
            if (viewcart)
                res.render('user/checkout', { users, login: req.session.userloggedin, cartNumber: req.session.cartNumber, wishlistNumber: req.session.wishlistNumber, cartProducts: viewcart })
            else
                res.redirect('/viewCart')
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    placeOrder: async (req, res, next) => {
        try {
            let userId = req.session.user._id
            let deliveryAddress = {
                firstName: req.body.firstname,
                lastName: req.body.lastname,
                phone: req.body.number,
                address: req.body.address,
                pincode: req.body.pin,
                state: req.body.state,
                district: req.body.district
            }
            
            const cart = await Cart.findOne({ userId: userId })
            const paymentType = req.body.paymentType
            const newOrder = new Order({
                userId: userId,
                deliveryAddress: deliveryAddress,
                products: cart.Products,
                quantity: cart.quantity,
                total: cart.total,
                paymentType: paymentType
            })
            req.session.cartNumber = null
            await Cart.deleteOne({ userId: userId })
            await newOrder.save()
            if (req.session.coupon > 0) {
                req.session.coupon = null
            }
            res.json({ status: true })

        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    /*-----------order successPage--------------------*/
    orderSuccessPage: async (req, res, next) => {
        try {
            let users = req.session.user
            const userId = req.session.user._id
            const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
            if (wishlist) {
                req.session.wishlistNumber = wishlist.myWish.length
            }
            const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()

            if (viewcart) {
                req.session.cartNumber = viewcart.Products.length
            } else {
                req.session.cartNumber = null
            }

            res.render('user/order-success', { cartProducts: viewcart, wishlistNumber: req.session.wishlistNumber, cartNumber: req.session.cartNumber, users, login: req.session.userloggedin })
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    /*----------------getorder------------------------------*/
    getOrder: async (req, res, next) => {
        try {
            const userId = req.session.user._id
            let users = req.session.user

            const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
            if (wishlist) {
                req.session.wishlistNumber = wishlist.myWish.length
            }
            const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()

            if (viewcart) {
                req.session.cartNumber = viewcart.Products.length
            } else {
                req.session.cartNumber = null
            }

            const myOrders = await Order.find({ userId }).sort({ 'createdAt': -1 }).populate([
                {
                    path: "userId",
                    model: "user"
                },
                {
                    path: "products.productId",
                    model: "products"
                }
            ]).exec()

            res.render('user/orders', { myOrders: myOrders, wishlistNumber: req.session.wishlistNumber, cartNumber: req.session.cartNumber, users, login: req.session.userloggedin })
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },

    generateOrder: (req, res, next) => {
        try {
            const amount = parseInt(req.body.amount) * 100

            const options = {
                amount: amount,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "order1001"
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err)
                } else {
                    res.send({ orderId: order.id })
                }
            });
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    /*--------------------payment verify-------------------*/
    verifyPayment: (req, res, next) => {
        try {
            const orderId = req.params.orderId
            let body = orderId + "|" + req.body.response.razorpay_payment_id;

            const crypto = require("crypto");
            const expectedSignature = crypto.createHmac('sha256', process.env.key_secret)
                .update(body.toString())
                .digest('hex');
            // console.log("sig received ", req.body.response.razorpay_signature);
            // console.log("sig generated ", expectedSignature);
            let response = { "signatureIsValid": false }
            if (expectedSignature === req.body.response.razorpay_signature) {
                response = { "signatureIsValid": true }
            }
            res.send(response);

        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    /*----------coupon------------------------------------*/
    redeemCoupnAmount: async (req, res, next) => {
        const coupCode = req.params.coupCode
        const totalAmount = req.params.total
        try {
            const coupon = await couponModel.findOne({ couponCode: coupCode }).lean().exec()
            if (coupon) {
                let nw = new Date()
                let str = nw.toJSON().slice(0, 10)
                let coustr = coupon.expDate.toJSON().slice(0, 10)
                if (coupon.isActive && str <= coustr) {

                    if (!req.session.coupon) {
                        if (totalAmount >= coupon.minPurchase) {
                            res.json(coupon)
                            req.session.coupon = 1
                            //    let userId = req.session.user._id
                            //    _id=coupon._id
                            //    console.log(_id);
                            //    let cc= await couponModel.findById({ _id });
                            //    console.log(cc,'jjjj');
                            //    cc.usedUsers.push({userId})
                            //    await cc.save()

                        } else {
                            res.json({ minimunPurchase: true })
                        }
                    } else {
                        res.json({ alreadyApplied: true })
                    }
                } else {
                    res.json({ expired: true })
                }

            } else {
                res.json({ invalidCoupon: true })
            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    cancelOrder: async (req, res, next) => {
        try {
            const orderId = req.params.orderId
            await Order.findByIdAndRemove(orderId, { orderActive: false })
            res.json({ status: true })
        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },
    /*--------------add address------------------------------*/
    addAndEditAddress: async (req, res, next) => {
        try {
            
            let addrexIndex = parseInt(req.body.index)
            let _id = req.session.user._id
            let userOne = await User.findById(_id)
            
            let address = {
                firstName: req.body.firstname,
                lastName: req.body.lastname,
                phone: req.body.phone,
                address: req.body.address,
                pincode: req.body.pincode,
                state: req.body.state,
                district: req.body.district
            }
            if (addrexIndex > -1) {
                userOne.Address[addrexIndex] = address
            } else {
                userOne.Address.push(address);
            }
            await userOne.save()
            res.json({ status: true })

        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },

    deleteAddress: async (req, res, next) => {
        try {
            const userId = req.session.user._id
            const addressIndex = req.body.addresIndex
            const users = await User.findById(userId)
            users.Address.splice(addressIndex, 1)
            await users.save()
            res.json({ status: true })
        }
        catch (err) {
            console.log(err);
            next(err)
        }


    },
    getMyProfile: async (req, res, next) => {
console.log(req.session.user);
        const userId = req.session.user._id
        let users = req.session.user
        try {
            const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
            if (wishlist) {
                req.session.wishlistNumber = wishlist.myWish.length
            }
            const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()

            if (viewcart) {
                req.session.cartNumber = viewcart.Products.length
            } else {
                req.session.cartNumber = null
            }
            res.render('user/my-profile', { users, cartNumber: req.session.cartNumber, wishlistNumber: req.session.wishlistNumber, login: req.session.userloggedin })

        } catch (err) {
            console.log(err);
            next(err)
        }
    },


    /*---------------user logout----------------------------*/
    getlogout: (req, res) => {
        req.session.user = null
        req.session.cartNumber = null
        req.session.wishlistNumber = null
        req.session.userloggedin = false
        res.redirect('/')
    },
}






