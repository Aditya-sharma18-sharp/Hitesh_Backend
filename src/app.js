
 const express = require('express');
 const cors = require('cors');
 const cookieparser = require('cookie-parser');
 const app = express();
 const UserRouter = require('./routes/user-router.js');

 app.use(express.json({
    limit:"16kb"
 }));

 app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
 }));
 app.use(express.static(`${__dirname}/public`));
 app.use(cookieparser());

  app.use('/home',UserRouter);
 module.exports = app ; 
 