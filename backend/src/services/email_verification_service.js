import bcrypt from 'bcrypt';
import {auth_error,validate_credentials} from './auth_service.js';
import {hash_email_token,prepare_email_verification} from './email_content_service.js';

export function create_email_verification_service(repository, config) {
    async function resend(body) {
        if (!body || Array.isArray(body) || Object.keys(body).some(key=>key!=='email') || typeof body.email!=='string') throw auth_error(400,'INVALID_INPUT','Vui lòng nhập email hợp lệ.');
        const email = body.email.trim().toLowerCase();
        if (email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw auth_error(400,'INVALID_INPUT','Vui lòng nhập email hợp lệ.');
        const account = await repository.find_pending_account(email);
        if (account) await repository.resend(email,prepare_email_verification(config,account.vai_tro==='BAC_SI'?'INVITE_DOCTOR':'VERIFY'));
        return {message:'Nếu tài khoản cần xác minh, yêu cầu gửi email đã được ghi nhận. Kiểm tra hộp thư và mục thư rác.'};
    }
    async function verify(body, doctor = false) {
        const allowed = doctor ? ['token','mat_khau'] : ['token'];
        if (!body || Array.isArray(body) || Object.keys(body).some(key=>!allowed.includes(key)) || typeof body.token!=='string' || !/^[a-f0-9]{64}$/.test(body.token)) throw auth_error(400,'INVALID_TOKEN','Liên kết không hợp lệ hoặc đã hết hạn.');
        let password_hash = null;
        if (doctor) {
            const input = validate_credentials({email:'validation@example.test',mat_khau:body.mat_khau});
            password_hash = await bcrypt.hash(input.mat_khau,12);
        }
        try { await repository.consume(hash_email_token(body.token),doctor?'INVITE_DOCTOR':'VERIFY',password_hash); }
        catch(error) {
            if ((error.number??error.originalError?.info?.number)===51010) throw auth_error(400,'INVALID_TOKEN','Liên kết không hợp lệ, đã sử dụng hoặc đã hết hạn. Vui lòng yêu cầu gửi lại.');
            throw error;
        }
        return {message:doctor?'Đã kích hoạt tài khoản bác sĩ. Bạn có thể đăng nhập.':'Email đã được xác minh. Bạn có thể đăng nhập.'};
    }
    return {resend,verify};
}
