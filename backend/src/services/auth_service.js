import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID as random_uuid } from 'node:crypto';
import {prepare_email_verification} from './email_content_service.js';

export function auth_error(status, code, message, fields) {
    return Object.assign(new Error(message), { status, code, fields });
}

export function validate_credentials(body, registration = false) {
    const allowed = registration ? ['ho_ten', 'email', 'mat_khau'] : ['email', 'mat_khau'];
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some((key) => !allowed.includes(key))) {
        throw auth_error(400, 'INVALID_INPUT', 'Dữ liệu gửi lên không hợp lệ.');
    }
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const ho_ten = typeof body.ho_ten === 'string' ? body.ho_ten.trim() : '';
    const mat_khau = typeof body.mat_khau === 'string' ? body.mat_khau : '';
    const fields = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fields.email = 'Vui lòng nhập email hợp lệ.';
    if (mat_khau.length < 8 || Buffer.byteLength(mat_khau, 'utf8') > 72 || mat_khau.includes('\0')) {
        fields.mat_khau = 'Mật khẩu cần ít nhất 8 ký tự và không quá 72 byte UTF-8.';
    }
    if (registration && (ho_ten.length < 2 || ho_ten.length > 150 || /[\x00-\x1f]/.test(ho_ten))) fields.ho_ten = 'Họ và tên cần từ 2 đến 150 ký tự.';
    if (Object.keys(fields).length) throw auth_error(400, 'INVALID_INPUT', 'Vui lòng kiểm tra thông tin đã nhập.', fields);
    return { email, ho_ten, mat_khau };
}

export function public_account(account) {
    return { tai_khoan_id: String(account.tai_khoan_id), email: account.email, ho_ten: account.ho_ten, vai_tro: account.vai_tro };
}

export function create_auth_service(repository, config) {
    const jwt_options = { algorithms: ['HS256'], issuer: 'medibook', audience: 'medibook_web' };
    let dummy_hash;
    async function register(body) {
        const input = validate_credentials(body, true);
        const mat_khau_hash = await bcrypt.hash(input.mat_khau, 12);
        try {
            return public_account(await repository.create_patient({ email: input.email, ho_ten: input.ho_ten, mat_khau_hash, verification:prepare_email_verification(config) }));
        } catch (error) {
            const number = error.number ?? error.originalError?.info?.number;
            if ([2601, 2627].includes(number)) throw auth_error(409, 'EMAIL_EXISTS', 'Email này đã được đăng ký.', { email: 'Email này đã được đăng ký.' });
            throw error;
        }
    }
    async function login(body) {
        const input = validate_credentials(body);
        const account = await repository.find_by_email(input.email);
        dummy_hash ??= bcrypt.hash(random_uuid(), 12);
        const matches = await bcrypt.compare(input.mat_khau, account?.mat_khau_hash ?? await dummy_hash);
        if (!account || !matches || !account.hoat_dong) throw auth_error(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng, hoặc tài khoản không được phép truy cập.');
        if (account.vai_tro !== 'ADMIN' && !account.email_xac_minh_luc) throw auth_error(403,'EMAIL_NOT_VERIFIED','Bạn cần xác minh email trước khi đăng nhập. Vui lòng kiểm tra hộp thư hoặc yêu cầu gửi lại email.');
        const session_id = random_uuid();
        const token = jwt.sign({}, config.jwt_secret, {
            algorithm: 'HS256', issuer: jwt_options.issuer, audience: jwt_options.audience,
            subject: String(account.tai_khoan_id), jwtid: session_id, expiresIn: 3600,
        });
        await repository.create_session(session_id, account.tai_khoan_id);
        return { token, account: public_account(account) };
    }
    async function authenticate(token) {
        let payload;
        try {
            payload = jwt.verify(token, config.jwt_secret, jwt_options);
            if (!/^\d+$/.test(payload.sub) || !/^[0-9a-f-]{36}$/.test(payload.jti) || !Number.isInteger(payload.exp)) throw new Error('Invalid claims');
        } catch {
            throw auth_error(401, 'UNAUTHENTICATED', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
        }
        const account = await repository.find_session(payload.jti, payload.sub);
        if (!account || !account.hoat_dong) throw auth_error(401, 'UNAUTHENTICATED', 'Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.');
        if (account.vai_tro !== 'ADMIN' && !account.email_xac_minh_luc) throw auth_error(401,'EMAIL_NOT_VERIFIED','Tài khoản cần xác minh email. Vui lòng đăng nhập lại và yêu cầu gửi email xác minh.');
        return { account: public_account(account), session_id: payload.jti };
    }
    async function logout(session_id) { await repository.delete_session(session_id); }
    return { register, login, authenticate, logout };
}
