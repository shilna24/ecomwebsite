const User = require('../models/user')
const Product = require('../models/productSchema')
const bcrypt = require('bcrypt')
const db = require('../config/connection')
const twilo = require('../twilo/twilio')
const client = require('twilio')(twilo.accountSid, twilo.authToken);
const otpGenerator = require('otp-generator');
const session = require('express-session');
const user = require('../models/user');
login = false
let loginerr = null
module.exports = {
    /*---------------------user homepage---------------------*/

    get: (req, res) => {
        let users = req.session.user
        Product.find().then((products) => {
            console.log(products);
            res.render('user/home', { login: req.session.userloggedin, users, products })

        })


    },

    /*------------------user loginPage-----------------------*/

    getlogin: (req, res, next) => {
        if (req.session.userloggedin)
            res.redirect('/')
        else
            res.render('user/userLogin', { loginerr })
        loginerr = null
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
                        bcrypt.compare(userData.Password, user.Password, function (error, isMatch) {
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
    getotp: (req, res, next) => {
        res.render('user/verifyotp')
    },
    postOtp: (req, res, next) => {
        const otp = req.body.otp
        console.log(req.session.otp)
        console.log(otp);
        if (otp === req.session.otp) {
            console.log('Okey');
            let userData = req.session.details
            console.log(userData);
            let userSignData = new User({
                Name: userData.Name,
                Email: userData.Email,
                Password: userData.Password,
                Phone: userData.Phone,
            })
            userSignData.save().then((data) => {
                console.log(data.Name)
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
    getProfile: (req, res, next) => {
        if (req.session.userloggedin) {
            let users = req.session.user
            console.log(users);
            res.render('user/updateProfile', { users, login: req.session.userloggedin })
        }
        else {
            res.redirect('/userLogin')
        }


    },
    postProfile: (req, res) => {
        const pId = req.params.id
        console.log(pId);
        User.updateOne({ _id: pId }, {
            $set: {
                Name: req.body.Name,
                Email: req.body.Email,
                Phone: req.body.Phone
            }
        }).then(async (err, data) => {
            console.log("Hi")
            let newUser = await User.findOne({ _id: pId })
            console.log(newUser);
            req.session.user = newUser
            req.session.userloggedin = true
            res.redirect('/updateProfile')

        })
    },



    /*---------------user logout----------------------------*/
    getlogout: (req, res) => {
        req.session.user = null
        req.session.userloggedin = false
        res.redirect('/')
    },
}






