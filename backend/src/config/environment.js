export function read_environment(env = process.env) {
    const port = Number(env.PORT ?? 3000);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('PORT phải là số nguyên từ 1 đến 65535.');
    }
    const db_auth = env.DB_AUTH ?? 'windows';
    if (!['windows', 'sql'].includes(db_auth)) {
        throw new Error('DB_AUTH chỉ nhận windows hoặc sql.');
    }
    if (db_auth === 'sql' && (!env.DB_USER || !env.DB_PASSWORD)) {
        throw new Error('SQL Authentication yêu cầu DB_USER và DB_PASSWORD.');
    }
    const db_encrypt = read_boolean(env.DB_ENCRYPT, true);
    if (!env.JWT_SECRET || Buffer.byteLength(env.JWT_SECRET) < 32) throw new Error('JWT_SECRET cần ít nhất 32 byte; chạy npm run setup:auth.');
    const app_origin = env.APP_ORIGIN ?? 'http://127.0.0.1:5173';
    if (!/^https?:\/\//.test(app_origin) || new URL(app_origin).origin !== app_origin) throw new Error('APP_ORIGIN phải là origin hợp lệ, không có đường dẫn.');
    const cookie_secure = read_boolean(env.COOKIE_SECURE, false);
    if (env.NODE_ENV === 'production' && (!cookie_secure || !app_origin.startsWith('https://'))) throw new Error('Production yêu cầu HTTPS và COOKIE_SECURE=true.');
    return {
        host: env.HOST ?? '127.0.0.1',
        port,
        db_auth,
        db_server: env.DB_SERVER ?? '.\\SQLEXPRESS',
        db_database: env.DB_DATABASE ?? 'MediBook',
        db_driver: env.DB_ODBC_DRIVER ?? 'ODBC Driver 18 for SQL Server',
        db_encrypt,
        jwt_secret: env.JWT_SECRET,
        app_origin,
        cookie_secure,
        db_trust_certificate: read_boolean(env.DB_TRUST_SERVER_CERTIFICATE, false),
        db_user: env.DB_USER,
        db_password: env.DB_PASSWORD,
    };
}

function read_boolean(value, fallback) {
    if (value === undefined) return fallback;
    if (!['true', 'false'].includes(value)) throw new Error('Giá trị cấu hình boolean phải là true hoặc false.');
    return value === 'true';
}
