const { Router } = require('express');
const { registerUser  , loginUser, logoutUser, refreshAccessToken, ChangeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUsercoverImage, getUserChannelProfile, getWatchHistory} = require('../controllers/user.controllers');
const upload = require('../middlewares/multer.middleware');
const verifyJWT = require('../middlewares/auth.middleware');
const User = require('../models/user.model');
 
const UserRouter = Router();

 UserRouter.route('/register')
   .post(
    upload.fields([
      {name: 'avatar' , maxCount:1},
      {name: 'coverImage' , maxCount:2}
    ]),registerUser);

    UserRouter.route('/login').post(loginUser);    
    //secured routes
    UserRouter.route('/logout').post(verifyJWT,logoutUser);
    UserRouter.route('/refresh-token').post(refreshAccessToken);
    UserRouter.route('/change-password').post(verifyJWT , ChangeCurrentPassword);
    UserRouter.route("/current-user").get(verifyJWT , getCurrentUser); 
    UserRouter.route("/update-account").patch(verifyJWT , updateAccountDetails);
    UserRouter.route("/update-avatar").patch(verifyJWT , upload.single("avatar"),  updateUserAvatar);
    UserRouter.route("/update-coverimage").patch(verifyJWT , upload.single("/CoverImage") , updateUsercoverImage)
    UserRouter.route("/user-channel/:username").get(verifyJWT , getUserChannelProfile);
    UserRouter.route("/history").get(verifyJWT , getWatchHistory);

  module.exports = UserRouter;