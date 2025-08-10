//CREATE A SUBSCRIPTION -> MIDDLEWARE(CHECK FOR RENEWAL DATE)->MIDDLEWARE(CHECKFOR ERRORS)->NEXT->CONTROLLER
const errorMiddleware = (err, req, res, next) => {
    try{
        let error={...err};
        error.message=err.message;
        console.error(err);

        //Mongoose bad objectid
        if(err.name==='CastError'){
            const message='resource not found';
            error=new Error(message);
            error.statusCode=404;
        }

        //mongoose duplicate key
        if(err.name===11000){
            const message='duplicate field value entered';
            error=new Error(message);
            error.statusCode=400;
        }

        //mongoose validation err
        if(err.name==='validationError'){
            const message = Object.values(err.errors).map(val=> val.message);
            error=new Error(message.join(', '));
            error.statusCode=400;
        }
        res.status(error.statusCode||500).json({
            success: false,
            error: error.message || 'Server Error',
        });
    }catch(err){
        next(err);
    }
};
export default errorMiddleware;