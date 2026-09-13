import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import cookie_parser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { create_app } from '../src/app.js';
import { create_auth_service } from '../src/services/auth_service.js';
import { create_auth_middleware, require_roles } from '../src/middleware/auth_middleware.js';
import { read_environment } from '../src/config/environment.js';

const config = { jwt_secret: 'test_only_secret_with_more_than_32_bytes', app_origin: 'http://127.0.0.1:5173', cookie_secure: false };
function create_fixture() {
    const accounts = new Map();
    const sessions = new Map();
    const repository = {
        async create_patient(input) {
            if (accounts.has(input.email)) throw Object.assign(new Error('duplicate'), { number: 2627 });
            const account = { ...input, tai_khoan_id: String(accounts.size + 1), vai_tro: 'BENH_NHAN', hoat_dong: true, email_xac_minh_luc:new Date() };
            accounts.set(input.email, account); return account;
        },
        async find_by_email(email) { return accounts.get(email); },
        async create_session(id, account_id) { sessions.set(id, String(account_id)); },
        async find_session(id, account_id) { return sessions.get(id) === account_id ? [...accounts.values()].find((a) => a.tai_khoan_id === account_id) : undefined; },
        async delete_session(id) { sessions.delete(id); },
    };
    const app = create_app({}, { auth_config: config, auth_repository: repository });
    return { app, accounts, sessions, repository };
}
const patient = { ho_ten: 'Nguyễn An', email: 'an@example.test', mat_khau: 'MatKhau123!' };

test('đăng ký chuẩn hóa email, băm bcrypt, không trả hash; email trùng trả 409', async () => {
    const { app, accounts } = create_fixture();
    const result = await request(app).post('/api/auth/register').send({ ...patient, email: ' AN@EXAMPLE.TEST ' }).expect(201);
    assert.equal(result.body.account.vai_tro, 'BENH_NHAN');
    assert.equal(result.body.account.email, patient.email);
    assert.doesNotMatch(result.text, /mat_khau|hash/);
    assert.equal(await bcrypt.compare(patient.mat_khau, accounts.get(patient.email).mat_khau_hash), true);
    await request(app).post('/api/auth/register').send(patient).expect(409);
    assert.equal(accounts.size, 1);
});

test('không thể tự cấp quyền; kiểm tra trường thiếu, email sai và giới hạn bcrypt tính theo byte', async () => {
    const { app, accounts } = create_fixture();
    for (const body of [{ ...patient, vai_tro: 'ADMIN' }, { ...patient, role: 'BAC_SI' }, {}, null, [], { ...patient, email: 'wrong' }, { ...patient, mat_khau: 'a'.repeat(73) }, { ...patient, mat_khau: 'ắ'.repeat(25) }]) {
        await request(app).post('/api/auth/register').set('Content-Type', 'application/json').send(JSON.stringify(body)).expect(400);
    }
    assert.equal(accounts.size, 0);
});

test('đăng nhập sai và tài khoản không tồn tại cùng lỗi; cookie HttpOnly; đăng xuất chặn replay JWT', async () => {
    const { app } = create_fixture();
    await request(app).post('/api/auth/register').send(patient).expect(201);
    const wrong = await request(app).post('/api/auth/login').send({ email: patient.email, mat_khau: 'WrongPassword!' }).expect(401);
    const missing = await request(app).post('/api/auth/login').send({ email: 'nobody@example.test', mat_khau: patient.mat_khau }).expect(401);
    assert.deepEqual(wrong.body, missing.body);
    const login = await request(app).post('/api/auth/login').send({ email: patient.email, mat_khau: patient.mat_khau }).expect(200);
    const cookie = login.headers['set-cookie'][0];
    assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Strict/); assert.doesNotMatch(login.text, /eyJ|mat_khau/);
    const token = cookie.split(';')[0].split('=')[1];
    await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);
    await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app).post('/api/auth/logout').set('Cookie', cookie).send({}).expect(204);
    await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(401);
});

test('từ chối token thiếu, sai chữ ký, hết hạn, sai audience và sai thuật toán', async () => {
    const { app } = create_fixture();
    await request(app).get('/api/auth/me').expect(401);
    const options = { subject: '1', jwtid: 'a'.repeat(36), issuer: 'medibook', audience: 'medibook_web' };
    for (const token of ['broken', jwt.sign({}, 'other_secret', options), jwt.sign({}, config.jwt_secret, { ...options, expiresIn: -1 }), jwt.sign({}, config.jwt_secret, { ...options, audience: 'other' }), jwt.sign({}, config.jwt_secret, { ...options, algorithm: 'HS384' })]) {
        await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(401);
    }
});

test('ba vai trò được kiểm tra ở Backend; đổi vai trò hoặc khóa tài khoản có hiệu lực ngay', async () => {
    const { repository, accounts } = create_fixture();
    const service = create_auth_service(repository, config);
    await service.register(patient);
    const api = express(); api.use(cookie_parser());
    for (const role of ['BENH_NHAN', 'BAC_SI', 'ADMIN']) {
        api.get(`/${role}`, create_auth_middleware(service), require_roles(role), (req, res) => res.sendStatus(200));
    }
    api.use((error, req, res, next) => res.status(error.status ?? 500).json({ code: error.code }));
    const result = await service.login({ email: patient.email, mat_khau: patient.mat_khau });
    for (const role of ['BENH_NHAN', 'BAC_SI', 'ADMIN']) {
        accounts.get(patient.email).vai_tro = role;
        for (const target of ['BENH_NHAN', 'BAC_SI', 'ADMIN']) await request(api).get(`/${target}`).set('Authorization', `Bearer ${result.token}`).expect(role === target ? 200 : 403);
    }
    accounts.get(patient.email).hoat_dong = false;
    await request(api).get('/ADMIN').set('Authorization', `Bearer ${result.token}`).expect(401);
    await assert.rejects(service.login({ email: patient.email, mat_khau: patient.mat_khau }), { status: 401 });
});

test('chống yêu cầu cross-site, yêu cầu JSON, giới hạn thử đăng nhập', async () => {
    const { app } = create_fixture();
    await request(app).post('/api/auth/login').set('Origin', 'https://other.example').send({}).expect(403);
    await request(app).post('/api/auth/logout').type('form').send({}).expect(415);
    await request(app).post('/api/auth/register').set('Sec-Fetch-Site', 'cross-site').send(patient).expect(403);
    for (let i = 0; i < 20; i++) await request(app).post('/api/auth/login').send({}).expect(400);
    await request(app).post('/api/auth/login').send({}).expect(429);
});

test('cấu hình bắt buộc secret đủ mạnh và cookie bảo mật khi production', () => {
    assert.throws(() => read_environment({}), /JWT_SECRET/);
    assert.throws(() => read_environment({ JWT_SECRET: 'short' }), /JWT_SECRET/);
    assert.throws(() => read_environment({ JWT_SECRET: config.jwt_secret, NODE_ENV: 'production' }), /HTTPS/);
    assert.equal(read_environment({ JWT_SECRET: config.jwt_secret }).cookie_secure, false);
});
