require('dotenv').config()
const express = require('express')
const app = express();
let ejs = require('ejs');
const path = require('path');
const flash = require('connect-flash');
let cookieParser = require('cookie-parser')
let session = require('express-session')
// let fileUpload = require('express-fileupload');
const mongoose = require('./config/connection')
// const bodyParser = require ('body-parser')
const nocache = require("nocache");
// let db=require('./config/connection')
let logger = require('morgan');
let userRouter = require('./routes/user');
let adminRouter = require('./routes/admin');
const Swal = require('sweetalert2')
// app.use(logger('dev'));
app.use(nocache());
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(fileUpload());
app.use(session({ secret: "key", cookie: { maxAge: 60 * 60 * 60 * 1000 } }))
app.use('/', userRouter)
app.use('/admin', adminRouter)
/*-----view engine setup------------*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.engine('ejs', ejs.engine({ extname: 'ejs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/' }));
app.use(express.static(path.join(__dirname, 'public')));
// catch 404 and forward to error handler

// app.use(function (req, res, next) {
//   next(createError(404));
// });
// error handler
// app.use(function (err, req, res, next) {
//   console.log(err);
    // set locals, only providing error in development
// res.locals.message = err.message;
// res.locals.error = req.app.get("env") === "development" ? err : {};
// render the error page
// res.status(err.status || 500);
// res.render("error");
// });

app.use((req,res,nex)=>{
  res.status(404);
  if(req.accepts("html")){
   return res.render("error")
  }
})
app.listen(8000, () => {
  console.log('server is running')
})
module.exports = app;


