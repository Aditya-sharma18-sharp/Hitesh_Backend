
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req ,file ,cb){
        cb(null ,"../public/temp")
    },
    filename: function (req , file , cb){
       const uniqueSuffix = Date.now();
        cb(null , file.filename +'-'+ uniqueSuffix)
    }
})

const upload = multer({storage:storage});
module.exports =  upload;