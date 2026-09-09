import express from 'express';
import helmet from 'helmet';
import { create_health_repository } from './repositories/health_repository.js';
import { create_health_service } from './services/health_service.js';
import { create_health_controller } from './controllers/health_controller.js';
import { create_health_routes } from './routes/health_routes.js';

export function create_app(database) {
    const app = express();
    app.disable('x-powered-by');
    app.use(helmet());
    app.use(express.json({ limit: '32kb' }));
    const repository = create_health_repository(database);
    const service = create_health_service(repository);
    const controller = create_health_controller(service);
    app.use('/api', create_health_routes(controller));
    app.use((request, response) => {
        response.status(404).json({ code: 'NOT_FOUND', message: 'Không tìm thấy API.' });
    });
    app.use(function handle_error(error, request, response, next) {
        if (response.headersSent) return next(error);
        if (error.type === 'entity.parse.failed') {
            return response.status(400).json({ code: 'INVALID_JSON', message: 'Dữ liệu JSON không hợp lệ.' });
        }
        if (error.type === 'entity.too.large') {
            return response.status(413).json({ code: 'PAYLOAD_TOO_LARGE', message: 'Dữ liệu vượt quá giới hạn.' });
        }
        response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Hệ thống gặp lỗi xử lý.' });
    });
    return app;
}
