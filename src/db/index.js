 const mongoose = require('mongoose');
 const {DB_NAME }  = require('../constants');
 const connectDB = async()=>{
    try{
  const connectionInstance = await (mongoose.connect(`${process.env.MONGODB_URL}/`))
                           console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);                 
    } 
    catch(err){
        console.log(" MONGODB connection error" ,err.message);
     process.exit(1);
    }
}
module.exports = connectDB;
