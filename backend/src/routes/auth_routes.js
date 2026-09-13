import { Router as create_router } from 'express';
import { rateLimit as rate_limit } from 'express-rate-limit';
import { create_auth_middleware, create_origin_guard } from '../middleware/auth_middleware.js';

export function create_auth_routes(controller, service, config) {
    const router = create_router();
    const authenticate = create_auth_middleware(service);
    const limiter = rate_limit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false,
        message: { code: 'TOO_MANY_REQUESTS', message: 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 15 phút.' } });
    router.use((request, response, next) => { response.set('Cache-Control', 'no-store'); next(); });
    router.use(create_origin_guard(config));
    router.post('/register', limiter, controller.register);
    router.post('/login', limiter, controller.login);
    router.get('/me', authenticate, controller.current_account);
    router.post('/logout', authenticate, controller.logout);
    return router;
}
