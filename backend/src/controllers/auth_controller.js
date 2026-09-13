export function create_auth_controller(service, config) {
    const cookie_options = { httpOnly: true, secure: config.cookie_secure, sameSite: 'strict', path: '/api' };
    async function register(request, response) {
        const account = await service.register(request.body);
        response.status(201).json({ message: 'Tài khoản đã được tạo và email xác minh đã được đưa vào hàng đợi. Vui lòng mở liên kết trong hộp thư trước khi đăng nhập.', verification_required:true, account });
    }
    async function login(request, response) {
        const result = await service.login(request.body);
        const previous = request.cookies?.medibook_session;
        if (previous) {
            let old_session;
            try { old_session = await service.authenticate(previous); } catch (error) { if (error.status !== 401) throw error; }
            if (old_session) await service.logout(old_session.session_id);
        }
        response.cookie('medibook_session', result.token, { ...cookie_options, maxAge: 3600000 });
        response.json({ account: result.account, expires_in: 3600 });
    }
    function current_account(request, response) { response.json({ account: request.auth.account }); }
    async function logout(request, response) {
        await service.logout(request.auth.session_id);
        response.clearCookie('medibook_session', cookie_options);
        response.status(204).end();
    }
    return { register, login, current_account, logout };
}
