import aj from '../config/arcjet.js'

const arcjetMiddleware = async (req, res, next) => {
    try{
        const decision= await aj.protect(req, { requested: 1 });
        if(decision.isDenied())
        {
            if(decision.reason.isRateLimit())
            {
                return res.status(429).json({
                    message: 'rate limit exceeded'
                });
            }
            if(decision.reason.isBot())
            {
                return res.status(403).json({
                    error: 'Bot detected'
                });
            }
            return res.status(403).json({error:'access denied'})
        }
        return next();
    }
    catch(err){
        console.log('arcjet middleware err: ', err);
        next(err);
    }
}
export default arcjetMiddleware;