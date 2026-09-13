import { auth_error } from '../services/auth_service.js';

export function create_auth_middleware(service) {
    return async function authenticate_request(request, response, next) {
        const header = request.get('authorization');
        const token = header ? (/^Bearer ([^\s]+)$/.exec(header)?.[1]) : request.cookies?.medibook_session;
        if (!token) throw auth_error(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập để tiếp tục.');
        request.auth = await service.authenticate(token);
        next();
    };
}

export function require_roles(...roles) {
    return function authorize_request(request, response, next) {
        if (!request.auth) throw auth_error(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập để tiếp tục.');
        if (!roles.includes(request.auth.account.vai_tro)) throw auth_error(403, 'FORBIDDEN', 'Bạn không có quyền sử dụng chức năng này.');
        next();
    };
}

export function create_origin_guard(config) {
    return function verify_origin(request, response, next) {
        if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return next();
        const origin = request.get('origin');
        if ((origin && origin !== config.app_origin) || request.get('sec-fetch-site') === 'cross-site') {
            throw auth_error(403, 'ORIGIN_NOT_ALLOWED', 'Yêu cầu không đến từ giao diện được phép.');
        }
        if (!request.is('application/json')) throw auth_error(415, 'JSON_REQUIRED', 'Yêu cầu phải sử dụng application/json.');
        next();
    };
}
