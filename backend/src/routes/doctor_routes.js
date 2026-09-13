import {Router as create_router} from 'express';
import {create_auth_middleware,require_roles,create_origin_guard} from '../middleware/auth_middleware.js';
export function create_doctor_routes(controller,auth_service,config) {
    const router=create_router();
    router.use((req,res,next)=>{res.set('Cache-Control','no-store');next();},create_auth_middleware(auth_service),require_roles('BAC_SI'),create_origin_guard(config));
    router.get('/appointments',controller.list);
    router.post('/appointments/:id/result',controller.save_result);
    return router;
}
