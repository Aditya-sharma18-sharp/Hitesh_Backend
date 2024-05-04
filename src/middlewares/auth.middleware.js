const ApiError = require("../utils/apierror");
const JWT = require("jsonwebtoken");
const User = require("../models/user.model");
const verifyJWT = async(req ,res ,next)=> {
   try{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " ,"");
    if(!token) throw new ApiError(401 , "Unauthorized request");
       
     const decodedToken = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);
     const user = await User.findById(decodedToken?._id).select("-password  -refreshToken");
     if(!user) throw new ApiError(403 , "Invalid Access Token");
       req.user = user;
     next();
     } 
     catch(err){
       next( new ApiError( 403 , err.message || "Invalid Access Token" ));
     }
  } 
 module.exports = verifyJWT;