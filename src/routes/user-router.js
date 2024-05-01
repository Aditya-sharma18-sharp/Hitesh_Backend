const { Router } = require('express');
const { registerUser } = require('../controllers/user.controllers');
const upload = require('../middlewares/multer.middleware');
 
const UserRouter = Router();

 UserRouter.route('/register')
   .post(
    upload.fields([
      {name: 'avatar' , maxCount:1},
      {name: 'coverImage' , maxCount:2}
    ]),registerUser)
    
  module.exports = UserRouter;