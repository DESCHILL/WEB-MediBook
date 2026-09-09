import { Router } from 'express';

export function create_health_routes(controller) {
    const router = Router();
    router.get('/health', controller.get_health);
    router.get('/health/ready', controller.get_readiness);
    return router;
}
