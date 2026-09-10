import {test} from 'node:test';
import assert from 'node:assert/strict';
import {unlink} from 'node:fs/promises';
import {join,basename} from 'node:path';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import {create_app} from '../src/app.js';
import {upload_directory} from '../src/routes/upload_routes.js';
test('ảnh chỉ dành cho Admin, chặn sai định dạng và ảnh quá lớn',async()=>{
    const config={jwt_secret:'test_only_secret_with_more_than_32_bytes',app_origin:'http://127.0.0.1:5173'};
    let role='BENH_NHAN';
    const app=create_app({},{auth_config:config,auth_repository:{find_session:async()=>({tai_khoan_id:'42',vai_tro:role,hoat_dong:true})}});
    const token=jwt.sign({},config.jwt_secret,{subject:'42',jwtid:'a'.repeat(36),issuer:'medibook',audience:'medibook_web',expiresIn:3600});
    const upload=()=>request(app).post('/api/uploads').set('Authorization',`Bearer ${token}`).set('Content-Type','image/png');
    await upload().send(Buffer.from('invalid')).expect(403);
    role='ADMIN';await upload().send(Buffer.from('invalid image')).expect(400);
    await upload().send(Buffer.alloc(2*1024*1024+1)).expect(413);
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jL1sAAAAASUVORK5CYII=','base64');
    let saved;
    try{const response=await upload().send(png).expect(201);saved=response.body.url;assert.match(saved,/^\/uploads\/[a-f0-9-]+\.png$/);await request(app).get(saved).expect(200).expect('X-Content-Type-Options','nosniff');}
    finally{if(saved)await unlink(join(upload_directory,basename(saved)));}
});
