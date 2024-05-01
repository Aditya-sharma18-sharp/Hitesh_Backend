 
 const asyncHandler = (fn) => async(req ,res ,next) => {
    try{  
      await fn(req,res,next);
    }
    catch(err){
        res.status(err.code || 500).json({
            success: 'Failed',
            data:{
                error:err.message
            }
        })
    };
 };
//  const asyncHandler2 = (fn)=> {
//   (req ,res ,next)=> {
//     Promise.resolve(fn(req ,res ,next)).reject(err=> next(err))
//   }
//  }

 module.exports = asyncHandler;

