

module.exports=(req,res,next)=>{
    if(req.session.userloggedin){
        next()
    }
    else
    {
        res.render('user/userLogin',{loginErr:req.flash('loginErr')})
       
    }
}