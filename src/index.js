  const dotenv  = require('dotenv').config({path:'./.env'});
  const express = require('express');
  const app = express();
  const connectDB = require('./db/index.js');
 
 connectDB().then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log("app listening on port" + process.env.port);
    })
  }).catch(err => {
    console.log("Mongo db connection failed !!!", err)
  throw err;
});
 