
 const asyncHandler = require('../utils/asynchandler');
 const ApiError = require('../utils/apierror.js');
 const User = require('../models/user.model.js');
 const uploadOnCloudinary = require('../utils/cloudinary.js');
 const ApiResponse = require('../utils/apiresponse.js');
 const JWT = require('jsonwebtoken');


  const generateAccessAndRefreshTokensAndAddRefreshTokenToUser = async(userId) =>{
   try{
     const user = await User.findById(userId);
     const accessToken = await user.generateAccessToken();
     const refreshToken = await user.generateRefreshToken();
      user.refreshToken = refreshToken; 
     const updateduser =  await user.save({ validateBeforeSave : false })
     return {accessToken , refreshToken};
   }
   catch(err){
    throw new ApiError(500 , "Something went wrong while login")
   }
  }    

  const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, userName, password } = req.body;
    console.log(req.body);
  
    // Check if any required field is empty
    if ([fullName, email, userName, password].some(field => !field?.trim())) {
        throw new ApiError(400, "Invalid data passed by user");
    }
    
    // Check if user already exists
    const existedUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existedUser) {
       throw new ApiError(409, "User already exists");
      }
      
      // Handle file uploads
      const avatarLocalPath = req.files?.avatar[0]?.path;
      const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
      if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
      }
       
      // Upload files to cloudinary
      const avatarImage = await uploadOnCloudinary(avatarLocalPath);
      const coverImage = await uploadOnCloudinary(coverImageLocalPath);
      
      // Create new user
      const newUser = await User.create({
         fullName,
         email,
         userName: userName.toLowerCase(),
         avatar: avatarImage.url,
        coverImage: coverImage?.url || "",
        password
    });
      const responseUser = {
      fullName,
      email,
      userName: userName.toLowerCase(),
      avatar: avatarImage.url,
      coverImage: coverImage?.url || "",
      }
     // Check if user was successfully created
     if (!newUser) {
        throw new ApiError(500, "User cannot be created at the moment");
     } 
     // Respond with success message
     res.status(201).json(new ApiResponse(200, responseUser, "User registered successfully"));
  });
    
    
  const loginUser = asyncHandler( async (req, res) => {

      const { email, password, userName } = req.body;

      if (!(email || userName)) {
          throw new ApiError(400, "Either username or email is required");
      }
      
      const user = await User.findOne({ $or: [{ userName }, { email }] });

      if (!user) {
          throw new ApiError(404, "User not found");
      }
     
      const isPasswordCorrect = await user.isPasswordCorrect(password);
  
      if (!isPasswordCorrect) {
          throw new ApiError(404, "Incorrect password");
      }
  
      const { accessToken, refreshToken } = await generateAccessAndRefreshTokensAndAddRefreshTokenToUser(user._id);
        const testuser = await User.findById(user._id).select("-password  -refreshToken");
       const options = {
          httpOnly: true,
          secure: true
      };
  
      return res.status(200)
          .cookie('refreshToken', refreshToken, options)
          .cookie('accessToken', accessToken, options)
          .json(new ApiResponse(200, {
              testuser 
          }, "User logged in successfully"));
  });
  
  const logoutUser = asyncHandler (async(req , res) =>{
       await User.findByIdAndUpdate(req.user._id,{
               $set:{
                  refreshToken: undefined
               } 
        },{
          new :true   
          }
        );
       const options = {
        httpOnly: true,
        secure: true
       }  
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
      200, 
      {},
      "user Successfully Logged Out"
    ));
  });

  const refreshAccessToken = async (req ,res)=> {
   try{  
    const incomingrefreshToken = req.cookies.accessToken || req.body.refreshToken ;
    console.log(incomingrefreshToken);
    if(!incomingrefreshToken) {
      throw new ApiError(401 , "unauthorized request");
     }
     const decodedToken = JWT.verify(incomingrefreshToken , process.env.REFRESH_TOKEN_SECRET);
     console.log(decodedToken);

     const user = await User.findById(decodedToken?._id);
     if(!user) throw new ApiError(401 , "Invalid refreshToken");

     if(incomingrefreshToken !== user?.refreshToken){
      throw new ApiError(403 , "Refresh Token is expired or used")
     };
    const {accessToken , refreshToken } = await generateAccessAndRefreshTokensAndAddRefreshTokenToUser(user._id);
    
    const options = {
      httpOnly: true,
      secure: true
    }
      return res.status(200)
      .cookies('refreshToken' ,refreshToken , options)
      .cookies('accessToken' ,accessToken , options)
      .json(new ApiResponse(200 ,
        {
          accessToken , refreshToken
        },
        "Access Token refreshed successfully"
      ))
    }
    catch(err){
      new ApiError(404,err.message)
    }
  }

   module.exports = { registerUser  , loginUser ,logoutUser ,refreshAccessToken};
   
   

   // const asyncHandler = require('../utils/asynchandler');
   // const ApiError = require('../utils/apierror.js');
   // const User = require('../models/user.model.js');
   // const uploadOnCloudinary = require('../utils/cloudinary.js');
   // const ApiResponse = require('../utils/apiresponse.js');
   
   // const registerUser =  asyncHandler( async (req ,res) => {
      
   //    const {fullName , email , userName , password } =  req.body;
   //     console.log(fullName);
   //  if([fullName , email , userName , password].some((field)=> field?.trim() === "")){
   //     throw new ApiError(400 , "Invalid data passed by user")
   //  }
   //  const existedUser = await User.findOne({
   //     $or:[
   //         {email} , {userName}
   //     ]
   //  });
   //  if(existedUser){
   //     throw new ApiError( 409 , "User already existed");
   //  };
   
   //  console.log("Run run req.files");
   //   const avatarLocalPath = req.files?.avatar[0]?.path
   //   const coverImageLocalPath = req.files?.coverImage?.[0]?.path
   //   console.log(avatarLocalPath);
   //   console.log(coverImageLocalPath);
   //   if(!avatarLocalPath){
   //     throw new ApiError(400 , "Avatar file is required");
   //   }
   //  const avatarImage = await uploadOnCloudinary(avatarLocalPath);
   //  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
   //  if(!avatarImage) throw new ApiError(400 , "Avatar file is required");
    
   //  const user = await User.create({
   //     fullName,
   //     email,
   //     userName:userName.toLowerCase(),
   //     avatar: avatarImage.url,
   //     coverImage: coverImage?.url || " ",
   //     password
   //   })
   //   console.log(user , "this is about user");
   //     const createuser = User.findById(user._id).select("-password  -refreshToken"); 
   //     if(!createuser) throw new ApiError(500 , "user Can not be created right now ");
    
   //    res.status(201).json( 
   //        new ApiResponse(200 , createuser , "user registered Successfully")
   //    )
   // });
   
   // module.exports = { registerUser }
