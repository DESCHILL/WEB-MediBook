import {test} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import {create_app} from '../src/app.js';
import {create_schedule_service} from '../src/services/schedule_service.js';
import {create_admin_service} from '../src/services/admin_service.js';
import {create_doctor_service} from '../src/services/doctor_service.js';
const config={jwt_secret:'test_only_secret_with_more_than_32_bytes',app_origin:'http://127.0.0.1:5173'};
test('toàn bộ trang riêng chặn vai trò không phù hợp tại API',async()=>{
    for(const role of ['BENH_NHAN','BAC_SI','ADMIN']){
        const token=jwt.sign({},config.jwt_secret,{subject:'42',jwtid:'a'.repeat(36),issuer:'medibook',audience:'medibook_web',expiresIn:3600});
        const app=create_app({},{auth_config:config,auth_repository:{find_session:async()=>({tai_khoan_id:'42',vai_tro:role,hoat_dong:true,email_xac_minh_luc:new Date()})}});
        for(const [path,allowed]of [['/api/profile','BENH_NHAN'],['/api/doctor/appointments','BAC_SI'],['/api/admin/dashboard','ADMIN'],['/api/admin/doctors','ADMIN'],['/api/admin/specialties','ADMIN'],['/api/admin/doctors/1/schedules','ADMIN']]){
            await request(app).get(path).expect(401);
            if(role!==allowed)await request(app).get(path).set('Authorization',`Bearer ${token}`).expect(403);
        }
    }
});
test('lịch làm việc kiểm tra bước 30 phút, thứ và khoảng sinh',async()=>{
    const service=create_schedule_service({create:async()=>({}),generate:async()=>({created:0})});
    for(const body of [{thu_trong_tuan:1,gio_bat_dau:'08:00',gio_ket_thuc:'09:00'},{thu_trong_tuan:2,gio_bat_dau:'08:15',gio_ket_thuc:'09:00'},{thu_trong_tuan:2,gio_bat_dau:'09:00',gio_ket_thuc:'08:00'}])await assert.rejects(service.create('1',body),{status:400});
    await assert.rejects(service.generate('1',{ngay_bat_dau:'2026-02-30',so_ngay:14}),{status:400});
    await assert.rejects(service.generate('1',{ngay_bat_dau:'2026-09-10',so_ngay:1000}),{status:400});
});
test('thêm bác sĩ băm mật khẩu và từ chối gán quyền; kết quả khám chặn rỗng',async()=>{
    let stored;const admin=create_admin_service({create_doctor:async(data)=>{stored=data;return {bac_si_id:'1'};}});
    await assert.rejects(admin.create_doctor({vai_tro:'ADMIN'}),{status:400});
    await admin.create_doctor({ho_ten:'Bác sĩ kiểm thử',email:'doctor@example.test',chuyen_khoa_id:'1',phi_kham:100000});
    assert.match(stored.mat_khau_hash,/^\$2/);assert.equal(stored.mat_khau,undefined);
    const doctor=create_doctor_service({});await assert.rejects(doctor.save_result('1','2',{noi_dung:'  '}),{status:400});
});
