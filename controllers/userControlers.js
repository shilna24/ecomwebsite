const User = require('../models/user')
const bcrypt = require('bcrypt')
const db = require('../config/connection')
login=false
module.exports = {
/*---------------------user homepage---------------------*/

    get: (req, res) => {
        // res.send('index')
        console.log("hi");
        console.log(req.session.userloggedin);
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
            let loginStatus = false
            let response = {}
           await User.findOne({ Email: userData.Email }).then((user) => {
                
                console.log(user);
                if (user) {
                    
                    bcrypt.compare(userData.Password, user.Password, function (error, isMatch) {
                        if (isMatch) {
                            login="true"
                            req.session.userloggedin = true
                            req.session.user = user
                            console.log('/')
                            res.redirect('/')
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
        User.find({ Email:req.body.Email },async(err,data)=>{
            console.log(data);
        if(data.length==0)
        {
            const Name = req.body.Name
            const Email = req.body.Email
            const Phone = req.body.Phone
            const Password =await bcrypt.hash(req.body.Password,10)
            const user = new User({
                Name: Name,
                Email: Email,
                Phone:Phone,
                Password: Password
            })

            console.log(user);
            user.save()
                .then(result => {
                    login="true"
                    req.session.userloggedin = true
                    req.session.user = result
                    res.redirect('/')
                    
                })
                .catch(err => {
                    console.log(err)
                })
        }else{
            
            res.redirect('/userLogin')
        }
    })

    },
    
/*---------------user logout----------------------------*/
    getlogout:(req,res,next)=>{
        req.session.userloggedin=false
        // req.session.destroy()
        res.redirect('/')
    },
} 
    





