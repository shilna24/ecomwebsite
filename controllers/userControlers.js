const User = require('../models/user')
const bcrypt = require('bcrypt')
const db = require('../config/connection')
const twilo=require('../twilo/twilio')
const client = require('twilio')(twilo.accountSid, twilo.authToken);
const otpGenerator=require('otp-generator');
const user = require('../models/user');
const session = require('express-session');
login=false

// let otpgen=otpGenerator.generate(6,{upperCaseAlphabets:false,specialChars:false})

module.exports = {
/*---------------------user homepage---------------------*/

    get: (req, res) => {
        // res.send('index')
        // console.log("hi");
        // console.log(req.session.userloggedin);
        res.render('user/home',{login : req.session.userloggedin})
    },

/*------------------user loginPage-----------------------*/
    
    getlogin: (req, res, next) => {
    
        if(req.session.userloggedin)
        
        res.redirect('/')
        else
        res.render('user/userLogin')

    },
    postlogin: (req, res,next) => {
        
        userData = req.body
        return new Promise(async (resolve, reject) => {
            
           await User.findOne({ Email: userData.Email }).then((user) => {
                
                // console.log(user);
                if (user) {
                    
                    bcrypt.compare(userData.Password, user.Password, function (error, isMatch) {
                        if (isMatch) {
                            req.session.userloggedin = true
                            req.session.user = user
                            if(req.session.user.Access){
                            res.redirect('/')
                            }else{
                                res.render('user/blockPage')
                            }
                            
                            
                        }
                        else {
                            res.redirect('/userLogin')
                            console.log('incorrect password')
                        }
                    })
                }
                else {
                    
                    res.redirect('/userLogin')
                    console.log('not exist')
                }
            })
            
        })
    },
    
/*-----------------user signup---------------------------*/
    
    dosignup:(req,res)=>{
    res.render('user/signup');
    },
    // getsignup: (req, res) => {
    //     res.render('user/userSignup')
    // },
    postsignup: (req, res, next) => {
        console.log(req.body);
        let details= req.body
        req.session.details =details
        
        User.find({ Email:req.body.Email },async(err,data)=>{
            // console.log('ooooooooooooooooooooooooooooooooooooooooooooooooooooo');
            // console.log(data);
            if(data.length==0)
            {
                req.session.otp =otpGenerator.generate(6,{upperCaseAlphabets:false,specialChars:false})
                console.log('pppppppppppppppppppppppppppppp');
            details.Password=await bcrypt.hash(details.Password,10)
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
    else{
        res.redirect('/')
    }
})      

          

}, 
    getotp:(req,res,next)=>{
        res.render('user/verifyotp')
    },
    postOtp:(req,res,next)=>{
          const otp=req.body.otp
        //   const Access=true
          console.log(req.session.otp)
         console.log(otp);
        //  console.log(otpgen);
    if(otp===req.session.otp)
    {
        console.log('Okey');
    let userData=req.session.details
    console.log(userData);
    let userSignData=new User({
        Name:userData.Name,
        Email:userData.Email,
        Password:userData.Password,
        Phone:userData.Phone,
        // Access:Access

    })
    userSignData.save().then((data)=>{
    console.log(data.Name)
    req.session.userloggedin=true
    req.session.user=data.Name
    res.redirect('/')
    })
    }
    else{
    res.redirect('/get-otp')
    }

},
    
    
/*---------------user logout----------------------------*/
    getlogout:(req,res,next)=>{
        req.session.userloggedin=false
        // req.session.destroy()
        res.redirect('/')
    },
} 
    





