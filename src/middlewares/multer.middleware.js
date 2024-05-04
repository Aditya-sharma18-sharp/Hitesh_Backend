
// const multer = require('multer');
// const storage = multer.diskStorage({
//     destination: function (req ,file ,cb){
//         cb(null ,"../../public/temp")
//     },
//     filename: function (req , file , cb){
//        console.log(file);
//         cb(null , file.fieldname)
//     }
// })

// const upload = multer({storage:storage});

// module.exports =  upload;

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/temp'));
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
module.exports = upload;
