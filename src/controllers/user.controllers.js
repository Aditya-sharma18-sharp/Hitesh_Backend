const asyncHandler = require('../utils/asynchandler');
const ApiError = require('../utils/apierror.js');
const User = require('../models/user.model.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');
const ApiResponse = require('../utils/apiresponse.js');

const registerUser = asyncHandler( async (req ,res) => {
   const {fullName , email , userName , password } =  req.body;
    console.log(fullName);
 if([fullName , email , userName , password].some((field)=> field?.trim() === "")){
    throw new ApiError(400 , "Invalid data passed by user")
 }
 const existedUser = User.findOne({
    $or:[
        {email} , {userName}
    ]
 });
 if(existedUser){
    throw new ApiError( 409 , "User already existed");
 };

  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path

  if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar file is required");
  }
 const avatarImage = await uploadOnCloudinary(avatarLocalPath);
 const coverImage = await uploadOnCloudinary(coverImageLocalPath);
 
 if(!avatarImage) throw new ApiError(400 , "Avatar file is required");

 const user = await User.create({
    fullName,
    email,
    userName:userName.toLowerCase(),
    avatar: avatarImage.url,
    coverImage: coverImage?.url || " ",
    password
  })
    const createuser = User.findById(user._id).select("-password  -refreshToken") 
    if(!createuser) throw new ApiError(500 , "user Can not be created right now ");
 
   res.status(201).json( 
       new ApiResponse(200 , createuser , "user registered Successfully")
   )
 });

module.exports = { registerUser };