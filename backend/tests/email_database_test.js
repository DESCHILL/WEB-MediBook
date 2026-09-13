import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as random_uuid} from 'node:crypto';
import {create_database} from '../src/config/database.js';
import {read_environment} from '../src/config/environment.js';
import {create_admin_service} from '../src/services/admin_service.js';
import {create_admin_repository} from '../src/repositories/admin_repository.js';
import {create_auth_service} from '../src/services/auth_service.js';
import {create_auth_repository} from '../src/repositories/auth_repository.js';
import {create_email_repository} from '../src/repositories/email_repository.js';
import {create_email_verification_service} from '../src/services/email_verification_service.js';

test('SQL email: token hết hạn, gửi lại, kích hoạt bác sĩ một lần và nhận thư bằng lease riêng', {skip:process.env.RUN_DATABASE_TESTS!=='true'}, async()=>{
    const config=read_environment();const database=create_database(config);const key=random_uuid();
    const email=`email_${key}@example.test`;let pool;
    try {
        pool=await database.get_pool();
        const specialty=(await pool.request().input('name',`Email test ${key}`).query('INSERT dbo.ChuyenKhoa(ten_chuyen_khoa) OUTPUT CONVERT(varchar(20),inserted.chuyen_khoa_id) id VALUES(@name);')).recordset[0];
        await create_admin_service(create_admin_repository(database),config).create_doctor({email,ho_ten:'Bác sĩ kiểm thử email',chuyen_khoa_id:specialty.id,phi_kham:100000});
        const account=(await pool.request().input('email',email).query('SELECT CONVERT(varchar(20),tai_khoan_id) id,email_xac_minh_luc FROM dbo.TaiKhoan WHERE email=@email;')).recordset[0];
        assert.equal(account.email_xac_minh_luc,null);
        async function current_link(){return JSON.parse((await pool.request().input('id',account.id).query("SELECT TOP(1) du_lieu FROM dbo.HangDoiEmail WHERE tai_khoan_id=@id AND trang_thai='PENDING' ORDER BY email_id DESC;")).recordset[0].du_lieu).link;}
        const first_token=new URL(await current_link()).hash.slice(7);
        const repo=create_email_repository(database);const service=create_email_verification_service(repo,config);
        await assert.rejects(service.verify({token:first_token}),{status:400});
        await pool.request().input('id',account.id).query('UPDATE dbo.XacMinhEmail SET het_han_luc=DATEADD(SECOND,-1,SYSUTCDATETIME()),tao_luc=DATEADD(MINUTE,-2,SYSUTCDATETIME()) WHERE tai_khoan_id=@id;');
        await assert.rejects(service.verify({token:first_token,mat_khau:'DoctorTest123!'},true),{status:400});
        await service.resend({email});const next_token=new URL(await current_link()).hash.slice(7);
        assert.notEqual(first_token,next_token);
        await service.resend({email});assert.equal(new URL(await current_link()).hash.slice(7),next_token);
        await pool.request().input('id',account.id).query("UPDATE dbo.HangDoiEmail SET thu_lai_luc=DATEADD(SECOND,-2,SYSUTCDATETIME()) WHERE tai_khoan_id=@id AND trang_thai='PENDING';");
        const claims=await Promise.all([repo.claim(account.id),repo.claim(account.id)]);
        assert.equal(claims.filter(Boolean).length,1);
        const claimed=claims.find(Boolean);
        await repo.finish({...claimed,ma_khoa:random_uuid()});
        const leased=(await pool.request().input('id',claimed.email_id).query('SELECT trang_thai FROM dbo.HangDoiEmail WHERE email_id=@id;')).recordset[0];
        assert.equal(leased.trang_thai,'SENDING');
        await repo.finish(claimed,'EAUTH');
        const failed=(await pool.request().input('id',claimed.email_id).query('SELECT trang_thai,du_lieu,ma_loi FROM dbo.HangDoiEmail WHERE email_id=@id;')).recordset[0];
        assert.equal(failed.trang_thai,'PENDING');assert.equal(failed.ma_loi,'EAUTH');assert.ok(failed.du_lieu);
        await pool.request().input('id',claimed.email_id).query('UPDATE dbo.HangDoiEmail SET thu_lai_luc=DATEADD(SECOND,-2,SYSUTCDATETIME()) WHERE email_id=@id;');
        const retry=await repo.claim(account.id);await repo.finish(retry);
        assert.equal((await pool.request().input('id',claimed.email_id).query('SELECT du_lieu FROM dbo.HangDoiEmail WHERE email_id=@id;')).recordset[0].du_lieu,null);
        const activated=await Promise.allSettled([service.verify({token:next_token,mat_khau:'DoctorTest123!'},true),service.verify({token:next_token,mat_khau:'DoctorTest123!'},true)]);
        assert.equal(activated.filter(item=>item.status==='fulfilled').length,1);
        assert.equal(activated.find(item=>item.status==='rejected').reason.status,400);
        const login=await create_auth_service(create_auth_repository(database),config).login({email,mat_khau:'DoctorTest123!'});
        assert.equal(login.account.vai_tro,'BAC_SI');
    } finally {
        if(pool)await pool.request().input('email',email).input('name',`Email test ${key}`).query(`
            DECLARE @id bigint=(SELECT tai_khoan_id FROM dbo.TaiKhoan WHERE email=@email);
            DELETE dbo.PhienDangNhap WHERE tai_khoan_id=@id;
            DELETE dbo.BacSi WHERE tai_khoan_id=@id;
            DELETE dbo.TaiKhoan WHERE tai_khoan_id=@id;
            DELETE dbo.ChuyenKhoa WHERE ten_chuyen_khoa=@name;
        `);
        await database.close_pool();
    }
});
