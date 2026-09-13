import {test} from 'node:test';
import assert from 'node:assert/strict';
import {create_profile_service} from '../src/services/profile_service.js';
test('hồ sơ từ chối sửa quyền, ngày sinh sai và chỉ cập nhật tài khoản được xác thực',async()=>{
    let saved;
    const service=create_profile_service({get:async()=>({ho_ten:'Nguyễn An'}),update:async(id,data)=>{saved={id,data};return data;}});
    await assert.rejects(service.update('42',{ho_ten:'Nguyễn An',vai_tro:'ADMIN'}),{status:400});
    await assert.rejects(service.update('42',{ho_ten:'Nguyễn An',ngay_sinh:'2025-02-30'}),{status:400});
    await service.update('42',{ho_ten:' Nguyễn An ',gioi_tinh:'Nam',ngay_sinh:'2000-02-29'});
    assert.equal(saved.id,'42');assert.equal(saved.data.ho_ten,'Nguyễn An');
});
