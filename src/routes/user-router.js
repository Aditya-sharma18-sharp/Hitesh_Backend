const { Router } = require('express');
const { registerUser  , loginUser, logoutUser, refreshAccessToken} = require('../controllers/user.controllers');
const upload = require('../middlewares/multer.middleware');
const verifyJWT = require('../middlewares/auth.middleware');
 
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
    

  module.exports = UserRouter;