
const {v2: cloudinary } = require('cloudinary');
const fs = require('fs');

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=> {
    try{
     if(!localFilePath) return null;
     // upload file on cloudinary
      const response = await cloudinary.uploader.upload(localFilePath , {
        resource_type: "auto",
      })
      //file has been uploaded succssfully 
      console.log("File uploaded successfully" , response.original_filename , response.url);
      return response;
    }
    catch(err){
      fs.unlink(localFilePath)
      
      // remove file from local server file as the upload is failed
    }
  };

