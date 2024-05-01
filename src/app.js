
 const express = require('express');
 const cors = require('cors');
 const cookieparser = require('cookie-parser');
 const app = express();

 app.use(cors({
   origin: process.env.CORS_ORIGIN ,
   credentials: true
 }));

 app.use(express.json({
    limit:"16kb"
 }));

 app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
 }));
 
 app.use(express.static(`${__dirname}/public`));
 app.use(cookieparser());

//routes 
 const UserRouter = require('./routes/user-router.js');

  app.use('/api/v2/user',UserRouter);

 module.exports = app ; 
 