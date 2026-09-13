import {Router as create_router} from 'express';
import {rateLimit as rate_limit} from 'express-rate-limit';
import {create_origin_guard} from '../middleware/auth_middleware.js';

export function create_email_routes(controller,config) {
    const router=create_router();
    router.use(create_origin_guard(config));
    router.use((req,res,next)=>{res.set('Cache-Control','no-store');next();});
    router.use(rate_limit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-8',legacyHeaders:false,
        message:{code:'TOO_MANY_REQUESTS',message:'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 15 phút.'}}));
    router.post('/resend',controller.resend);
    router.post('/verify',controller.verify);
    router.post('/activate-doctor',controller.activate_doctor);
    return router;
}
