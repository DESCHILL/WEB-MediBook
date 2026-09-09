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
