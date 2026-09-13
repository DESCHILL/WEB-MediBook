import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID as random_uuid } from 'node:crypto';
import request from 'supertest';
import { create_app } from '../src/app.js';
import { create_database } from '../src/config/database.js';
import { read_environment } from '../src/config/environment.js';

test('SQL Server: hai đăng ký đồng thời chỉ tạo một tài khoản và hồ sơ; phiên đăng nhập bị hủy thật', { skip: process.env.RUN_DATABASE_TESTS !== 'true' }, async () => {
    const config = read_environment();
    const database = create_database(config);
    const app = create_app(database, { auth_config: config });
    const email = `auth_test_${random_uuid()}@example.test`;
    const body = { email, ho_ten: 'Kiểm thử xác thực', mat_khau: 'AuthTest_12345!' };
    try {
        const results = await Promise.all([request(app).post('/api/auth/register').send(body), request(app).post('/api/auth/register').send(body)]);
        assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
        const pool = await database.get_pool();
        const rows = await pool.request().input('email', email).query('SELECT a.vai_tro,a.mat_khau_hash,p.benh_nhan_id FROM dbo.TaiKhoan a JOIN dbo.BenhNhan p ON p.tai_khoan_id=a.tai_khoan_id WHERE a.email=@email;');
        assert.equal(rows.recordset.length, 1); assert.equal(rows.recordset[0].vai_tro, 'BENH_NHAN'); assert.match(rows.recordset[0].mat_khau_hash, /^\$2[ab]\$12\$/);
        await request(app).post('/api/auth/login').send({email,mat_khau:body.mat_khau}).expect(403);
        const queued=(await pool.request().input('email',email).query("SELECT e.du_lieu FROM dbo.HangDoiEmail e JOIN dbo.TaiKhoan a ON a.tai_khoan_id=e.tai_khoan_id WHERE a.email=@email AND e.loai='VERIFY';")).recordset[0];
        const token=new URL(JSON.parse(queued.du_lieu).link).hash.slice(7);
        await request(app).post('/api/auth/email/verify').send({token}).expect(200);
        await request(app).post('/api/auth/email/verify').send({token}).expect(400);
        const login = await request(app).post('/api/auth/login').send({ email, mat_khau: body.mat_khau }).expect(200);
        const cookie = login.headers['set-cookie'][0];
        await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);
        await request(app).post('/api/auth/logout').set('Cookie', cookie).send({}).expect(204);
        await request(app).get('/api/auth/me').set('Cookie', cookie).expect(401);
    } finally {
        try {
            const pool = await database.get_pool();
            await pool.request().input('email', email).query(`SET XACT_ABORT ON; BEGIN TRANSACTION;
                DECLARE @id bigint=(SELECT tai_khoan_id FROM dbo.TaiKhoan WHERE email=@email);
                DELETE dbo.PhienDangNhap WHERE tai_khoan_id=@id;
                DELETE dbo.BenhNhan WHERE tai_khoan_id=@id;
                DELETE dbo.TaiKhoan WHERE tai_khoan_id=@id AND email=@email;
                COMMIT TRANSACTION;`);
        } finally { await database.close_pool(); }
    }
});
