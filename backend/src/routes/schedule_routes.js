import { Router as create_router } from 'express';
import { create_auth_middleware, require_roles, create_origin_guard } from '../middleware/auth_middleware.js';
export function create_schedule_routes(controller, auth_service, config) {
    const router=create_router();
    router.use(create_auth_middleware(auth_service),require_roles('ADMIN'),create_origin_guard(config));
    router.get('/:doctor_id/schedules',controller.list);
    router.post('/:doctor_id/schedules',controller.create);
    router.post('/:doctor_id/slots/generate',controller.generate);
    return router;
}
