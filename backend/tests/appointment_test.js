import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { create_app } from '../src/app.js';
const config = { jwt_secret: 'test_only_secret_with_more_than_32_bytes', app_origin: 'http://127.0.0.1:5173' };
function create_fixture(role = 'BENH_NHAN', repository = {}) {
    const token = jwt.sign({}, config.jwt_secret, { subject: '42', jwtid: 'a'.repeat(36), issuer: 'medibook', audience: 'medibook_web', expiresIn: 3600 });
    const app = create_app({}, { auth_config: config, appointment_repository: repository,
        auth_repository: { find_session: async () => ({ tai_khoan_id: '42', vai_tro: role, hoat_dong: true }) } });
    return { app, token };
}
test('lịch hẹn yêu cầu JWT, đúng vai trò và luôn dùng ID tài khoản từ phiên', async () => {
    let owner;
    const { app, token } = create_fixture('BENH_NHAN', { list_patient_appointments: async (id) => { owner = id; return []; } });
    await request(app).get('/api/appointments').expect(401);
    await request(app).get('/api/appointments?account_id=99').set('Authorization', `Bearer ${token}`).expect(200, { items: [] });
    assert.equal(owner, '42');
    for (const role of ['ADMIN', 'BAC_SI']) {
        const fixture = create_fixture(role);
        await request(fixture.app).get('/api/appointments').set('Authorization', `Bearer ${fixture.token}`).expect(403);
    }
});
test('đặt lịch chặn gán chủ sở hữu, ID sai, yêu cầu khác nguồn và slot vừa bị giữ', async () => {
    const { app, token } = create_fixture('BENH_NHAN', { book_appointment: async () => { throw Object.assign(new Error('sql'), { number: 51002 }); } });
    const post = () => request(app).post('/api/appointments').set('Authorization', `Bearer ${token}`);
    await post().send({ khung_gio_id: '1', benh_nhan_id: '99' }).expect(400);
    await post().send({ khung_gio_id: '1 OR 1=1' }).expect(400);
    await post().set('Origin', 'https://other.invalid').send({ khung_gio_id: '1' }).expect(403);
    await post().send({ khung_gio_id: '1' }).expect(409);
});
test('hủy lịch không tiết lộ lịch người khác và trả lỗi xung đột điều kiện', async () => {
    const { app, token } = create_fixture('BENH_NHAN', { cancel_appointment: async (owner, id) => {
        assert.equal(owner, '42'); throw Object.assign(new Error('sql'), { number: id === '1' ? 51003 : 51004 });
    } });
    await request(app).post('/api/appointments/1/cancel').set('Authorization', `Bearer ${token}`).send({}).expect(404);
    await request(app).post('/api/appointments/2/cancel').set('Authorization', `Bearer ${token}`).send({}).expect(409);
});
test('khung giờ công khai kiểm tra ngày lịch thực và mã bác sĩ', async () => {
    const { app } = create_fixture('BENH_NHAN', { list_available_slots: async () => [] });
    await request(app).get('/api/doctors/1/slots?ngay=2026-09-10').expect(200, { items: [] });
    for (const day of ['2026-02-30', 'abc', '2026-13-01']) await request(app).get(`/api/doctors/1/slots?ngay=${day}`).expect(400);
    await request(app).get('/api/doctors/abc/slots?ngay=2026-09-10').expect(400);
});
