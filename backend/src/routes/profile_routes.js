import { Router as create_router } from 'express';
import { create_auth_middleware, require_roles, create_origin_guard } from '../middleware/auth_middleware.js';
export function create_profile_routes(controller,auth_service,config) {
    const router=create_router();
    router.use((request,response,next)=>{response.set('Cache-Control','no-store');next();},create_auth_middleware(auth_service),require_roles('BENH_NHAN'),create_origin_guard(config));
    router.get('/',controller.get);
    router.put('/',controller.update);
    return router;
}
