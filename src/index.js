  const dotenv  = require('dotenv').config({path:'./.env'});
  const connectDB = require('./db/index.js');
  const app = require('./app.js'); 
 connectDB().then(()=>{
  const port = process.env.PORT || 8000;
    app.listen(port,()=>{
        console.log("app listening on port" + port);
    })
  }).catch(err => {
    console.log("Mongo db connection failed !!!", err)
  throw err;});
 