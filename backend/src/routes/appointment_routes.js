import { Router as create_router } from 'express';
import { create_auth_middleware, require_roles, create_origin_guard } from '../middleware/auth_middleware.js';
export function create_appointment_routes(controller, auth_service, config) {
    const router = create_router();
    router.get('/doctors/:doctor_id/slots', controller.slots);
    router.use('/appointments', (request, response, next) => { response.set('Cache-Control', 'no-store'); next(); },
        create_auth_middleware(auth_service), require_roles('BENH_NHAN'), create_origin_guard(config));
    router.get('/appointments', controller.list);
    router.post('/appointments', controller.book);
    router.post('/appointments/:appointment_id/cancel', controller.cancel);
    return router;
}
