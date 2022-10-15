const User = require('../models/user')
const bcrypt = require('bcrypt')
const db = require('../config/connection')

login=false

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
            let loginStatus = false
            let response = {}
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
        
        User.find({ Email:req.body.Email },async(err,data)=>{
            console.log(data);
        if(data.length==0)
        {
            const Name = req.body.Name
            const Email = req.body.Email
            const Phone = req.body.Phone
            const Access=true
            const Password =await bcrypt.hash(req.body.Password,10)
            const user = new User({
                Name: Name,
                Email: Email,
                Phone:Phone,
                Password: Password,
                Access:Access
            })

            console.log(user);
            user.save()
                .then(result => {
                    
                    console.log(result);
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
    getotp:(req,res,next)=>{
UserData=req.body
console.log(UserData.Phone);
User.find({$or:[{Email:UserData.Email},{Phone:UserData.Phone}]},async(err,data)=>{
if(err)
{
    console.log(err)
}else{
    if(data.length==0)
    {
        UserData.Password=await bcrypt.hash(Password,10)
        req.session.userData=userData
        let otpgen=otpGenerator.generate(6,{upperCaseAlphabets:false,specialChars:false})
req.session.otpgen=otpgen
client.messages 
      .create({ 
         body: 'otpgen',  
         messagingServiceSid: 'MG9e71b0d653b8bb096a865985d7fde294',      
         to: '+918129066716' 
       }) 
      .then(message => console.log(message.sid)) 
      .done();
      res.redirect('/verifyotp')
      console.log(UserData.Password);
    }
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
    





