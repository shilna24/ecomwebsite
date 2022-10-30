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
const couponModel=require('../models/couponSchema')
const otpGenerator = require('otp-generator');
const session = require('express-session');
const Cart = require('../models/cartSchema')
const user = require('../models/user')
const Razorpay = require('razorpay');
const instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});
login = false
let loginerr = null
module.exports = {
    /*---------------------user homepage---------------------*/

    get: async (req, res) => {
        if (req.session.userloggedin) {
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
        const products = await Product.find({ active: true })
        const categories = await Category.find({})
        res.render('user/home', { login: req.session.userloggedin, users: req.session.user, products, categories, wishlistNumber: req.session.wishlistNumber, cartNumber: req.session.cartNumber })

    },

    /*------------------user loginPage-----------------------*/

    getlogin: async (req, res, next) => {
        if (req.session.userloggedin) {
            res.redirect('/')
        }

        else {

            res.render('user/userLogin', { loginerr })
            loginerr = null
        }

    },
    postlogin: (req, res, next) => {

        userData = req.body
        return new Promise(async (resolve, reject) => {
            await User.findOne({ Email: userData.Email }).then((user) => {
                if (user) {
                    if (!user.Access) {
                        loginerr = "you were blocked by admin"
                        res.redirect('/userLogin')
                    }
                    else {
                        bcrypt.compare(userData.Password, user.Password, async function (error, isMatch) {
                            if (isMatch) {
                                req.session.userloggedin = true
                                req.session.user = user
                                res.redirect('/')
                            }
                            else {
                                loginerr = 'incorrect password'
                                res.redirect('/userLogin')
                            }
                        })
                    }

                }
                else {
                    loginerr = 'not exist'
                    res.redirect('/userLogin')
                }
            })

        })
    },

    /*-----------------user signup---------------------------*/

    dosignup: (req, res) => {
        res.render('user/signup');
    },
    postsignup: (req, res, next) => {
        console.log(req.body);
        let details = req.body
        req.session.details = details
        User.find({ Email: req.body.Email }, async (err, data) => {
            console.log(data);
            if (data.length == 0) {
                req.session.otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, digits: true, lowerCaseAlphabets: false })
                details.Password = await bcrypt.hash(details.Password, 10)
                client.messages
                    .create({

                        body: req.session.otp,
                        messagingServiceSid: 'MG9e71b0d653b8bb096a865985d7fde294',
                        to: '+918129066716'
                    })
                    .then(message => console.log(message.sid))
                    .done();
                res.redirect('/get-otp')
            }
            else {
                res.redirect('/')
            }
        })
    },
    /*-------------view all product-----------------------*/
    viewAllProducts: async (req, res) => {
        let categories = await Category.find()
        let products = await Product.find({ active: true })
        console.log(products);
        const userId = req.session.user._id
        if (req.session.userloggedin) {
            const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()
            if (viewcart) {
                req.session.cartNumber = viewcart.Products.length
            }
            const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
            if (wishlist) {
                req.session.wishlistNumber = wishlist.myWish.length
            }
        }

        res.render('user/viewAllProduct', { login: req.session.userloggedin, users: req.session.user, products, categories, cartNumber: req.session.cartNumber, wishlistNumber: req.session.wishlistNumber })
    },


    getProductView: async (req, res) => {
        const proId = req.params.id
        let products = await Product.findOne({ _id: proId })
        if (req.session.userloggedin) {
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
        res.render('user/productDetails', { login: req.session.userloggedin, users: req.session.user, products, cartNumber: req.session.cartNumber, wishlistNumber: req.session.wishlistNumber })
    },

    /*----------------otp setup-------------------------------*/
    getotp: (req, res, next) => {
        res.render('user/verifyotp')
    },
    postOtp: (req, res, next) => {
        const otp = req.body.otp
        if (otp === req.session.otp) {

            let userData = req.session.details
            console.log(userData);
            let userSignData = new User({
                Name: userData.Name,
                Email: userData.Email,
                Password: userData.Password,
                Phone: userData.Phone,
            })
            userSignData.save().then((data) => {
                req.session.userloggedin = true
                req.session.user = data.Name
                res.redirect('/')
            })
        }
        else {
            res.redirect('/get-otp')
        }

    },
    /*--------------user Profile----------------------------*/
    getProfile: async (req, res, next) => {
        if (req.session.userloggedin) {
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
            res.render('user/updateProfile', { users, login: req.session.userloggedin, cartNumber: req.session.cartNumber, wishlistNumber: req.session.wishlistNumber })
        }
        else {
            res.redirect('/userLogin')
        }


    },
    postProfile: (req, res) => {
        const pId = req.params.id
        User.updateOne({ _id: pId }, {
            $set: {
                Name: req.body.Name,
                Email: req.body.Email,
                Phone: req.body.Phone
            }
        }).then(async (err, data) => {
            let newUser = await User.findOne({ _id: pId })
            console.log(newUser);
            req.session.user = newUser
            req.session.userloggedin = true
            res.redirect('/updateProfile')

        })
    },
    /*------------------cart------------------------------------*/
    getCart: async (req, res) => {
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
            res.json({ status: true })
        }

    },
    /*-------------cart view-------------------------------*/
    cartView: async (req, res) => {
        if (req.session.userloggedin) {
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
        } else {
            res.redirect('/userLogin')
        }

    },

    /*----------------change quantity--------------------------*/
    changeQuantity: async (req, res) => {
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
    },

    /*---------------delete cart item--------------------*/
    deleteCartItem: async (req, res) => {
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
    },
    /*-----------------add wishlist---------------------------*/
    addToWishlist: async (req, res) => {
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
            res.json({ status: true })
        }

    },
    /*---------------view wishlist-----------------------*/
    viewWishList: async (req, res) => {
        if (req.session.userloggedin) {
            const userId = req.session.user._id
            const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()
            if (viewcart) {
                req.session.cartNumber = viewcart.Products.length
            }
            const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
            if (wishlist) {
                req.session.wishlistNumber = wishlist.myWish.length
            }
            res.render('user/sample', { login: req.session.userloggedin, users: req.session.user, wishProducts: wishlist, wishlistNumber: req.session.wishlistNumber, cartNumber: req.session.cartNumber })
        } else {
            res.redirect('/userLogin')
        }
    },
    /*---------------remove wishlist---------------------*/
    deleteWishlistItem: async (req, res) => {
        let productId = req.params.proId
        let userId = req.session.user._id
        let wishlist = await Wishlist.findOne({ userId })
        let itemIndex = wishlist.myWish.findIndex(p => p._id == productId)
        wishlist.myWish.splice(itemIndex, 1)
        await wishlist.save()
        res.json({ status: true })

    },
    /*-----------about page-----------------------------*/
    getAbout: async (req, res) => {
        if (req.session.userloggedin) {
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
            res.render('user/aboutUs', { users, login: req.session.userloggedin, cartNumber: req.session.cartNumber, wishlistNumber: req.session.wishlistNumber })
        }
        else {
            res.redirect('/userLogin')
        }
    },
    /*--------------categories ---------------------------*/
    getCategories: (req, res) => {
        if (req.session.userloggedin) {
            let catName = req.params.catName

            Product.find({ category: catName }).then((products) => {

                res.json(products)
            })
        } else {
            res.redirect('/')
        }


    },

    /*---------------contact page--------------------------*/
    getContact: async (req, res) => {
        if (req.session.userloggedin) {
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
            res.render('user/contactUs', { users, login: req.session.userloggedin, cartNumber: req.session.cartNumber, wishlistNumber: req.session.wishlistNumber })
        }

    },

    /*---------------order placing--------------------------*/
    checkOut: async (req, res) => {
        if (req.session.userloggedin) {
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


    },
    placeOrder: async (req, res) => {
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
        console.log(deliveryAddress);
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
        await cart.remove()
        await newOrder.save()
        if(req.session.coupon>0){
            req.session.coupon=null
        }
        res.json({ status: true })

    },
    /*-----------order successPage--------------------*/
    orderSuccessPage: async (req, res) => {
        console.log(req.session.userloggedin);
        if (req.session.userloggedin) {
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
        else {

            res.redirect('/userLogin')

        }

    },
    /*----------------getorder------------------------------*/
    getOrder: async (req, res) => {
        
        if (req.session.userloggedin) {
            const userId = req.session.user._id
            let users=req.session.user
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
                
                const myOrders = await Order.find({ userId }).populate([
                    {
                        path: "userId",
                        model: "user"
                    },
                    {
                        path: "products.productId",
                        model: "products"
                    }
                ]).exec()
                res.render('user/orders', { myOrders: myOrders, wishlistNumber: req.session.wishlistNumber, cartNumber: req.session.cartNumber, users,login: req.session.userloggedin })
            } catch (error) {
                console.log(error);

            }
        }
    },

    generateOrder: (req, res) => {
        // console.log(req.body.amount);
        const amount = parseInt(req.body.amount) * 100
        console.log(amount, 'jjjj');
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
    },
    /*--------------------payment verify-------------------*/
    verifyPayment: (req, res) => {

        const orderId = req.params.orderId
        let body = orderId + "|" + req.body.response.razorpay_payment_id;

        const crypto = require("crypto");
        const expectedSignature = crypto.createHmac('sha256', process.env.key_secret)
            .update(body.toString())
            .digest('hex');
        console.log("sig received ", req.body.response.razorpay_signature);
        console.log("sig generated ", expectedSignature);
        let response = { "signatureIsValid": false }
        if (expectedSignature === req.body.response.razorpay_signature) {
            response = { "signatureIsValid": true }
        }
        res.send(response);

    },
    /*----------coupon------------------------------------*/
    redeemCoupnAmount :async (req, res) => {
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
        }
    },
    /*--------------add address------------------------------*/
    addAddress:async(req,res)=>{
   
        let address={
            firstName:req.body.firstname ,
              lastName:req.body.lastname,
              phone:req.body.phone ,
              address:req.body.address ,
              pincode:req.body.pincode,
              state:req.body.state ,
              district: req.body.district
        }
       
        let _id=req.session.user._id
        let userOne=await User.findById(_id)
        console.log(userOne);
        userOne.Address.push(address);
        await userOne.save()
    },


    /*---------------user logout----------------------------*/
    getlogout: (req, res) => {
        req.session.user = null
        req.session.userloggedin = false
        res.redirect('/')
    },
}






