
 const asyncHandler = require('../utils/asynchandler');
 const ApiError = require('../utils/apierror.js');
 const User = require('../models/user.model.js');
 const uploadOnCloudinary = require('../utils/cloudinary.js');
 const ApiResponse = require('../utils/apiresponse.js');
 const JWT = require('jsonwebtoken');
const { response } = require('express');


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
      const avtarImageLocalPath = req.files?.avatar[0]?.path;
      const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
      if (!avtarImageLocalPath) {
        throw new ApiError(400, "Avatar  file is required");
      }
       
      // Upload files to cloudinary
      const avatarImage = await uploadOnCloudinary(avtarImageLocalPath);
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
  
  const ChangeCurrentPassword = async( req ,res)=> {
    try {
      const {oldPassword , newpassword , confirmpassword } = req.body;
      if(!(oldPassword && newpassword)) throw new ApiError(404 , "Credentials are not provided by user");
      if(confirmpassword  !== newpassword ) throw new ApiError(404 , "new password is not matched with confirm password");
     
      const user = await User.findById(req.user?._id)
      if(!user) throw new ApiError(404 , "Something went wrong try again");
      
      const checkoldpassword = await user.isPasswordCorrect(oldPassword);
      if(!checkoldpassword) throw new ApiError(404 , "User credentials Are Not Correct");
         
      user.password = newpassword;
      const changePassword = await user.save({validateBeforeSave: false});

   return res.status(200).json(
    new ApiResponse(
      200 , 
      {} ,
      "Password updated successfully"
    )
   )
    } catch (err) {
      new ApiError(404 , err.mesage);
    }
   }

   const getCurrentUser = asyncHandler (async( req ,res)=> {
    return res.status(200)
    .json(new ApiResponse(200 , 
    req.user,
     "Successfully get user information"));
   })

  const updateAccountDetails = asyncHandler(async (req ,res )=> {
    const {fullName , email , userName } = req.body;
    if(!(fullName || email || userName)) throw new ApiError(404 , "Data provided by user is not Sufficient to update user");
     
    const user = await User.findByIdAndUpdate(req.user?._id,{
      set$:{
        fullName,
        email ,userName
      }, 
     } , {new :true}).select("-password");

     if(!user) throw new ApiError(404 , "User not found by server");
     user.save({validateBeforeSave: false});

     return response.status(200)
     .json(new ApiResponse(
      200 , 
      user,
      "User Updated successfully"
      )) 
  });
 
  const updateUserAvatar = asyncHandler( async (req ,res)=> {

       const coverImageLocalPath = req.file?.path;
       if(!coverImageLocalPath) throw new ApiError(404 , "Avtar file is missing");

       const avtarPath  = await uploadOnCloudinary(coverImageLocalPath);
      if(!avtarPath) throw new ApiError(404 , "Avtar path is not uploded on cloudinary");

      const user = await User.findByIdAndUpdate(req.user?._id , {
        $set:{
          avatar: avtarPath.url
        }
      },{new :true }).select('-password');
      user.save({validateBeforeSave: false});
      if(!user)  throw new ApiError(404 , "file is not updated by server");

      return res.status(200).json(new ApiResponse(200 ,
      user,
    "User avtar updated successfully"));
    })
    
  const updateUsercoverImage = asyncHandler( async (req ,res)=> {
       const coverImageLocalPath = req.file?.path;
       if(!coverImageLocalPath) throw new ApiError(404 , " coverImage file is missing");

       const coverImagePath  = await uploadOnCloudinary(coverImageLocalPath);
      if(!coverImagePath) throw new ApiError(404 , "coverImage path is not uploded on cloudinary");

      const user = await User.findByIdAndUpdate(req.user?._id , {
        $set:{
          coverImage: coverImagePath.url
        }
      },{new :true }).select('-password');
      user.save({validateBeforeSave: false});
      if(!user)  throw new ApiError(404 , "file is not updated by server");

      return res.status(200).json(new ApiResponse(200 ,
      user,
    "User coverImage updated successfully"));
   });

  const getUserChannelProfile =asyncHandler( async (req ,res)=>{
     const { username } = req.params;
     if(!username ) throw new ApiError(404 , "username is missing");
     
       const  Channel = User.aggregate([
        {
          $match: {
                userName: username?.toLowerCase()
          }
      },
      {
        $lookup:{
          from: "subscriptions",
          localField: "_id",
          foreignField:"channel",
          as: "subscribers"
        }
      },
      {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField:'subscriber',
            as: "subscribedTo"
          }
      },
      {
        $addFields:{
          subscribersCount:{
            $size: "$subscribers"
          },
          SubscribedCount : {
            $size: "$subscribedTo"
          },
          isSubscribed: {
            if:{$in :[req.user?._id , "$subscribers.subscriber"]},
            Then: true,
            else: false
          }
         }
        },
        {
          $project:{
            fullName: 1,
            avatar: 1,
            userName: 1,
            email : 1,
            subscribersCount: 1,
            isSubscribed :1,
            SubscribedCount: 1,
            coverImage: 1 

          }
        }
      ]); // end of Channel 

      if(!Channel?.length){
        throw new ApiError(404 ,"Channel does not exist")
      }
      return response(200).json(new ApiResponse(
        200 , Channel[0], "User channel fetched successfully")
      )
     });
       
     const getWatchHistory = asyncHandler (async (req , res) => {
       const user = await User.aggregate([
        {
          $match:{
            _id: new mongoose.Types.ObjectId(req.params._id)
          }
        },
        {
          $lookup:{
            from: "videos",
            localField: "watchHistory",
            foreignField: "_id",
            as:"watchHistory",
            pipeline: [
              {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                 pipeline: [ 
                   {
                     $project: {
                      fullName: 1 ,
                      userName: 1 ,
                      avatar : 1,
                     }
                   }
                 ]
              }
            },
            {
            $addFields:{
              owner: {
                $first: "owner"
              }
            }
            }
          ]            
          }
        }
       ])
       if(!user) throw new ApiError(404 , "user not found");
  
        return response.status(200).json(
          new ApiResponse(200 , 
            user[0].watchHistory,
            "Watch History is fetched Successfully"
          )
        )
     });
     
   module.exports = {
     registerUser, loginUser ,logoutUser 
    ,refreshAccessToken , ChangeCurrentPassword  
   , getCurrentUser , updateAccountDetails,
    updateUserAvatar , updateUsercoverImage ,
    getWatchHistory , getUserChannelProfile};
   
   

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
   //   const coverImageLocalPath = req.files?.avatar[0]?.path
   //   const coverImageLocalPath = req.files?.coverImage?.[0]?.path
   //   console.log(coverImageLocalPath);
   //   console.log(coverImageLocalPath);
   //   if(!coverImageLocalPath){
   //     throw new ApiError(400 , "Avatar file is required");
   //   }
   //  const avatarImage = await uploadOnCloudinary(coverImageLocalPath);
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
