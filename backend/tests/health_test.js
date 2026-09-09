import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { create_app } from '../src/app.js';
import { read_environment } from '../src/config/environment.js';

test('API sống khi database chưa sẵn sàng; readiness trả 503 và không lộ lỗi nội bộ', async () => {
    const app = create_app({ get_pool: async () => { throw new Error('server=private;password=secret'); } });
    await request(app).get('/api/health').expect(200, { status: 'ok' });
    const result = await request(app).get('/api/health/ready').expect(503);
    assert.equal(result.body.status, 'unavailable');
    assert.doesNotMatch(result.text, /secret|private/);
});

test('readiness chỉ thành công khi truy vấn database thành công', async () => {
    let called = false;
    const app = create_app({ get_pool: async () => ({ request: () => ({ query: async () => { called = true; } }) }) });
    await request(app).get('/api/health/ready').expect(200, { status: 'ok', database: 'connected' });
    assert.equal(called, true);
});

test('API trả JSON cho đường dẫn sai và JSON không hợp lệ', async () => {
    const app = create_app({});
    await request(app).get('/api/missing').expect(404);
    const result = await request(app).post('/api/missing').set('Content-Type', 'application/json').send('{broken').expect(400);
    assert.equal(result.body.code, 'INVALID_JSON');
});

test('cấu hình lỗi bị từ chối trước khi khởi động', () => {
    assert.throws(() => read_environment({ PORT: 'abc' }), /PORT/);
    assert.throws(() => read_environment({ DB_AUTH: 'unknown' }), /DB_AUTH/);
    assert.throws(() => read_environment({ DB_AUTH: 'sql' }), /DB_USER/);
    assert.throws(() => read_environment({ DB_ENCRYPT: 'maybe' }), /boolean/);
});
