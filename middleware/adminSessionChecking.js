const admin = require("../models/admin")

module.exports=(req,res,next)=>{
    if(req.session.adminloggedin){
        next()
    }else
    {
        res.render('admin/adminLogin',{ adminErr: req.flash('adminErr')} )
       
    }
}