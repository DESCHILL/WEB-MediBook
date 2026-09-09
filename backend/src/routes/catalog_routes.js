import { Router as create_router } from 'express';

export function create_catalog_routes(controller) {
    const router = create_router();
    router.get('/specialties', controller.list_specialties);
    router.get('/doctors', controller.list_doctors);
    return router;
}
