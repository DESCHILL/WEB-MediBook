import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { create_app } from '../src/app.js';

test('danh mục chuyên khoa là công khai; trạng thái rỗng trả mảng rỗng', async () => {
    const app = create_app({}, { catalog_repository: { list_specialties: async () => [] } });
    await request(app).get('/api/specialties').expect(200, { items: [] });
});

test('lỗi truy vấn danh mục không lộ chuỗi kết nối', async () => {
    const app = create_app({}, { catalog_repository: { list_specialties: async () => { throw new Error('password=secret'); } } });
    const response = await request(app).get('/api/specialties').expect(500);
    assert.doesNotMatch(response.text, /secret|password/);
});

test('danh sách công khai phân trang và chỉ trả các trường công khai', async () => {
    let input;
    const app = create_app({}, { catalog_repository: { list_doctors: async (value) => {
        input = value;
        return { items: [{ bac_si_id: '9007199254740993', chuyen_khoa_id: '1', ho_ten: 'Bác sĩ mẫu', email: 'private@example.test', mat_khau_hash: 'secret' }], total: 25 };
    } } });
    const result = await request(app).get('/api/doctors?page=2&page_size=12').expect(200);
    assert.deepEqual(input, { offset: 12, page_size: 12, specialty_id: null });
    assert.equal(result.body.items[0].bac_si_id, '9007199254740993');
    assert.doesNotMatch(result.text, /secret|private|email|mat_khau/);
    for (const query of ['page=0', 'page=-1', 'page=1.1', 'page_size=1000', 'page=1&page=2', 'order_by=password']) await request(app).get(`/api/doctors?${query}`).expect(400);
});

test('lọc chuyên khoa kiểm tra ID, tồn tại và giữ tham số thành chuỗi an toàn', async () => {
    let input;
    const app = create_app({}, { catalog_repository: {
        specialty_exists: async (id) => id === '2',
        list_doctors: async (value) => { input = value; return { items: [], total: 0 }; },
    } });
    await request(app).get('/api/doctors?chuyen_khoa_id=2').expect(200);
    assert.equal(input.specialty_id, '2');
    await request(app).get('/api/doctors?chuyen_khoa_id=3').expect(404);
    for (const value of ['0', '-1', 'abc', '1 OR 1=1', '9223372036854775808']) await request(app).get('/api/doctors').query({ chuyen_khoa_id: value }).expect(400);
    await request(app).get('/api/doctors?chuyen_khoa_id=1&chuyen_khoa_id=2').expect(400);
});

test('chi tiết bác sĩ trả 404 khi ẩn hoặc không tồn tại, không lộ hồ sơ tài khoản', async () => {
    const app = create_app({}, { catalog_repository: { get_doctor: async (id) => id === '1' ? {
        bac_si_id: '1', chuyen_khoa_id: '2', ho_ten: 'Nguyễn An', ten_chuyen_khoa: 'Nội khoa', phi_kham: 150000,
        email: 'private@example.test', so_dien_thoai: 'private', mat_khau_hash: 'secret',
    } : undefined } });
    const result = await request(app).get('/api/doctors/1').expect(200);
    assert.equal(result.body.doctor.phi_kham, 150000);
    assert.doesNotMatch(result.text, /secret|private|email|mat_khau|so_dien_thoai/);
    await request(app).get('/api/doctors/2').expect(404);
    await request(app).get('/api/doctors/abc').expect(400);
});
