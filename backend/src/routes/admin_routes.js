import {Router as create_router} from 'express';
import {create_auth_middleware,require_roles,create_origin_guard} from '../middleware/auth_middleware.js';
export function create_admin_routes(controller,auth_service,config){
    const router=create_router();
    router.use((req,res,next)=>{res.set('Cache-Control','no-store');next();},create_auth_middleware(auth_service),require_roles('ADMIN'),create_origin_guard(config));
    router.get('/dashboard',controller.dashboard);
    router.get('/appointments',controller.appointments);
    router.post('/appointments/:id/cancel',controller.cancel);
    router.get('/doctors',controller.doctors);
    router.post('/doctors',controller.create_doctor);
    router.get('/specialties',controller.specialties);
    router.post('/specialties',controller.save_specialty);
    router.put('/specialties/:id',controller.save_specialty);
    router.delete('/specialties/:id',controller.delete_specialty);
    return router;
}
