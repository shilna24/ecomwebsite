const User = require('../models/user')
const Product = require('../models/productSchema')
const bcrypt = require('bcrypt')
const Category = require('../models/categorySchema')
const Wishlist = require('../models/wishlistSchema')
const db = require('../config/connection')
const twilo = require('../twilo/twilio')
const client = require('twilio')(twilo.accountSid, twilo.authToken);
const otpGenerator = require('otp-generator');
const session = require('express-session');
const Cart = require('../models/cartSchema')
const user = require('../models/user')
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
        const products = await Product.find({})
        const categories = await Category.find({})
        console.log(categories);
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
                                const userId = req.session.user._id
                                const viewcart = await Cart.findOne({ userId: userId }).populate("Products.productId").exec()
                                req.session.cartNumber = viewcart.Products.length
                                const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
                                req.session.wishlistNumber = wishlist.myWish.length
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
                req.session.otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false })
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
        // const proId = req.params.id
        let products = await Product.find()
        console.log(products);
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
        res.render('user/viewAllProduct', { login: req.session.userloggedin, users: req.session.user, products, cartNumber: req.session.cartNumber, wishlistNumber: req.session.wishlistNumber })
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
            console.log(req.session.wishlistNumber);
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
        console.log("hi");
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
            res.render('user/wishList', { login: req.session.userloggedin, users: req.session.user, wishProducts: wishlist, wishlistNumber: req.session.wishlistNumber, cartNumber: req.session.cartNumber })
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
        // const wishlist = await Wishlist.findOne({ userId: userId }).populate("myWish.productId").exec()
        wishlist.myWish.splice(itemIndex, 1)
        await wishlist.save()
        res.json({ status: true })

    },
    /*-----------about page-----------------------------*/
    getAbout:async(req,res)=>{
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

    /*---------------contact page--------------------------*/
    getContact:async(req,res)=>{
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
        else {
            res.redirect('/userLogin')
        }
    },

    /*---------------user logout----------------------------*/
    getlogout: (req, res) => {
        req.session.user = null
        req.session.userloggedin = false
        res.redirect('/')
    },
}






