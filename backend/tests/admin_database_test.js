import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as random_uuid} from 'node:crypto';
import {create_database} from '../src/config/database.js';
import {read_environment} from '../src/config/environment.js';
import {create_admin_repository} from '../src/repositories/admin_repository.js';
import {create_admin_service} from '../src/services/admin_service.js';
test('SQL thật: CRUD chuyên khoa và thêm bác sĩ nguyên tử, không lộ hash', {skip:process.env.RUN_DATABASE_TESTS!=='true'},async()=>{
    const database=create_database(read_environment());const key=random_uuid();let pool;
    try{
        pool=await database.get_pool();const service=create_admin_service(create_admin_repository(database));
        const specialty=await service.save_specialty(null,{ten_chuyen_khoa:`Kiểm thử ${key}`,mo_ta:'Dữ liệu giả'});
        await service.save_specialty(specialty.chuyen_khoa_id,{ten_chuyen_khoa:`Kiểm thử ${key}`,mo_ta:'Đã sửa'});
        const input={ho_ten:'Bác sĩ giả lập',email:`${key}@example.test`,chuyen_khoa_id:specialty.chuyen_khoa_id,phi_kham:125000};
        const doctor=await service.create_doctor(input);
        await assert.rejects(service.create_doctor(input),{status:409});
        await assert.rejects(service.delete_specialty(specialty.chuyen_khoa_id),{status:409});
        const row=(await service.doctors()).items.find((item)=>item.bac_si_id===doctor.bac_si_id);
        assert.equal(row.ho_ten,input.ho_ten);assert.equal(row.mat_khau_hash,undefined);
        const spec=(await service.specialties()).items.find((item)=>item.chuyen_khoa_id===specialty.chuyen_khoa_id);
        assert.equal(spec.mo_ta,'Đã sửa');assert.equal(spec.so_bac_si,1);
        await pool.request().input('email',input.email).query('DELETE b FROM dbo.BacSi b JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id WHERE a.email=@email; DELETE dbo.TaiKhoan WHERE email=@email;');
        await service.delete_specialty(specialty.chuyen_khoa_id);
        await assert.rejects(service.delete_specialty(specialty.chuyen_khoa_id),{status:404});
    }finally{
        if(pool)await pool.request().input('email',`${key}@example.test`).input('name',`Kiểm thử ${key}`).query('DELETE b FROM dbo.BacSi b JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id WHERE a.email=@email; DELETE dbo.TaiKhoan WHERE email=@email; DELETE dbo.ChuyenKhoa WHERE ten_chuyen_khoa=@name;');
        await database.close_pool();
    }
});
