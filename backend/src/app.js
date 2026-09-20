import {create_profile_repository} from './repositories/profile_repository.js';
import {create_profile_service} from './services/profile_service.js';
import {create_profile_controller} from './controllers/profile_controller.js';
import {create_profile_routes} from './routes/profile_routes.js';
import {create_schedule_repository} from './repositories/schedule_repository.js';
import {create_schedule_service} from './services/schedule_service.js';
import {create_schedule_controller} from './controllers/schedule_controller.js';
import {create_schedule_routes} from './routes/schedule_routes.js';
import {create_appointment_repository} from './repositories/appointment_repository.js';
import {create_appointment_service} from './services/appointment_service.js';
import {create_appointment_controller} from './controllers/appointment_controller.js';
import {create_appointment_routes} from './routes/appointment_routes.js';
import {create_doctor_repository} from './repositories/doctor_repository.js';
import {create_doctor_service} from './services/doctor_service.js';
import {create_doctor_controller} from './controllers/doctor_controller.js';
import {create_doctor_routes} from './routes/doctor_routes.js';
import express from 'express';
import helmet from 'helmet';
import cookie_parser from 'cookie-parser';
import { create_catalog_repository } from './repositories/catalog_repository.js';
import { create_catalog_service } from './services/catalog_service.js';
import { create_catalog_controller } from './controllers/catalog_controller.js';
import { create_catalog_routes } from './routes/catalog_routes.js';
import { create_auth_repository } from './repositories/auth_repository.js';
import { create_auth_service } from './services/auth_service.js';
import { create_auth_controller } from './controllers/auth_controller.js';
import { create_auth_routes } from './routes/auth_routes.js';
import { create_health_repository } from './repositories/health_repository.js';
import { create_health_service } from './services/health_service.js';
import { create_health_controller } from './controllers/health_controller.js';
import { create_health_routes } from './routes/health_routes.js';

export function create_app(database, { auth_config = {}, auth_repository, catalog_repository, appointment_repository } = {}) {
    const app = express();
    app.disable('x-powered-by');
    app.use(helmet());
    app.use(express.json({ limit: '32kb' }));
    app.use(cookie_parser());
    const catalog_service = create_catalog_service(catalog_repository ?? create_catalog_repository(database));
    app.use('/api', create_catalog_routes(create_catalog_controller(catalog_service)));
    const auth_service = create_auth_service(auth_repository ?? create_auth_repository(database), auth_config);
    app.use('/api/auth', create_auth_routes(create_auth_controller(auth_service, auth_config), auth_service, auth_config));
app.use('/api/profile',create_profile_routes(create_profile_controller(create_profile_service(create_profile_repository(database))),auth_service,auth_config));
app.use('/api/admin/doctors',create_schedule_routes(create_schedule_controller(create_schedule_service(create_schedule_repository(database))),auth_service,auth_config));
const appointment_service=create_appointment_service(appointment_repository??create_appointment_repository(database));
app.use('/api',create_appointment_routes(create_appointment_controller(appointment_service),auth_service,auth_config));
app.use('/api/doctor',create_doctor_routes(create_doctor_controller(create_doctor_service(create_doctor_repository(database))),auth_service,auth_config));
    const repository = create_health_repository(database);
    const service = create_health_service(repository);
    const controller = create_health_controller(service);
    app.use('/api', create_health_routes(controller));
    app.use((request, response) => {
        response.status(404).json({ code: 'NOT_FOUND', message: 'Không tìm thấy API.' });
    });
    app.use(function handle_error(error, request, response, next) {
        if (response.headersSent) return next(error);
        if (error.status && error.code && error.status >= 400 && error.status < 500) {
            return response.status(error.status).json({ code: error.code, message: error.message, ...(error.fields ? { fields: error.fields } : {}) });
        }
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
