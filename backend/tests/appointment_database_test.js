import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID as random_uuid } from 'node:crypto';
import { create_database } from '../src/config/database.js';
import { read_environment } from '../src/config/environment.js';
import { create_appointment_repository } from '../src/repositories/appointment_repository.js';
import { create_appointment_service } from '../src/services/appointment_service.js';

test('SQL thật: đặt đồng thời chỉ một người thành công, kiểm tra sở hữu và hủy giải phóng chỗ', { skip: process.env.RUN_DATABASE_TESTS !== 'true' }, async () => {
    const database = create_database(read_environment());
    const key = random_uuid();
    let pool;
    try {
        pool = await database.get_pool();
        const setup = await pool.request().input('key', key).query(`
            SET XACT_ABORT ON;
            BEGIN TRANSACTION;
            INSERT dbo.ChuyenKhoa(ten_chuyen_khoa) VALUES(N'Kiểm thử lịch '+@key);
            DECLARE @specialty bigint=SCOPE_IDENTITY();
            INSERT dbo.TaiKhoan(email,ho_ten,mat_khau_hash,vai_tro) VALUES(@key+'d@example.test',N'Bác sĩ kiểm thử','not_a_password','BAC_SI');
            DECLARE @doctor_account bigint=SCOPE_IDENTITY();
            INSERT dbo.BacSi(tai_khoan_id,chuyen_khoa_id,phi_kham) VALUES(@doctor_account,@specialty,100000);
            DECLARE @doctor bigint=SCOPE_IDENTITY();
            INSERT dbo.LichLamViec(bac_si_id,thu_trong_tuan,gio_bat_dau,gio_ket_thuc) VALUES(@doctor,2,'08:00','09:00');
            DECLARE @schedule bigint=SCOPE_IDENTITY(),@start datetime2(0)=DATEADD(day,2,SYSUTCDATETIME());
            INSERT dbo.KhungGioKham(lich_lam_viec_id,bac_si_id,bat_dau_luc,ket_thuc_luc) VALUES(@schedule,@doctor,@start,DATEADD(minute,30,@start));
            DECLARE @slot bigint=SCOPE_IDENTITY();
            INSERT dbo.TaiKhoan(email,ho_ten,mat_khau_hash,vai_tro) VALUES(@key+'p@example.test',N'Bệnh nhân thử','not_a_password','BENH_NHAN');
            DECLARE @patient bigint=SCOPE_IDENTITY();
            INSERT dbo.BenhNhan(tai_khoan_id) VALUES(@patient);
            INSERT dbo.TaiKhoan(email,ho_ten,mat_khau_hash,vai_tro) VALUES(@key+'q@example.test',N'Bệnh nhân khác','not_a_password','BENH_NHAN');
            DECLARE @other bigint=SCOPE_IDENTITY();
            INSERT dbo.BenhNhan(tai_khoan_id) VALUES(@other);
            COMMIT;
            SELECT CONVERT(varchar(20),@slot) slot_id,CONVERT(varchar(20),@patient) patient_id,CONVERT(varchar(20),@other) other_id;
        `);
        const fixture = setup.recordset[0];
        const service = create_appointment_service(create_appointment_repository(database));
        const attempts = await Promise.allSettled([service.book(fixture.patient_id, { khung_gio_id: fixture.slot_id }), service.book(fixture.other_id, { khung_gio_id: fixture.slot_id })]);
        assert.equal(attempts.filter((item) => item.status === 'fulfilled').length, 1);
        assert.equal(attempts.find((item) => item.status === 'rejected').reason.status, 409);
        const owner = attempts[0].status === 'fulfilled' ? fixture.patient_id : fixture.other_id;
        const other = owner === fixture.patient_id ? fixture.other_id : fixture.patient_id;
        const id = attempts.find((item) => item.status === 'fulfilled').value.lich_hen_id;
        assert.equal((await service.list(owner)).items.length, 1);
        assert.equal((await service.list(other)).items.length, 0);
        await assert.rejects(service.cancel(other, id), { status: 404 });
        await service.cancel(owner, id);
        await assert.rejects(service.cancel(owner, id), { status: 409 });
        await service.book(other, { khung_gio_id: fixture.slot_id });
    } finally {
        if (pool) await pool.request().input('key', key).query(`
            DELETE h FROM dbo.LichHen h JOIN dbo.KhungGioKham k ON k.khung_gio_id=h.khung_gio_id JOIN dbo.BacSi b ON b.bac_si_id=k.bac_si_id JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id WHERE a.email=@key+'d@example.test';
            DELETE k FROM dbo.KhungGioKham k JOIN dbo.BacSi b ON b.bac_si_id=k.bac_si_id JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id WHERE a.email=@key+'d@example.test';
            DELETE l FROM dbo.LichLamViec l JOIN dbo.BacSi b ON b.bac_si_id=l.bac_si_id JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id WHERE a.email=@key+'d@example.test';
            DELETE b FROM dbo.BacSi b JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id WHERE a.email=@key+'d@example.test';
            DELETE p FROM dbo.BenhNhan p JOIN dbo.TaiKhoan a ON a.tai_khoan_id=p.tai_khoan_id WHERE a.email IN(@key+'p@example.test',@key+'q@example.test');
            DELETE dbo.TaiKhoan WHERE email IN(@key+'d@example.test',@key+'p@example.test',@key+'q@example.test');
            DELETE dbo.ChuyenKhoa WHERE ten_chuyen_khoa=N'Kiểm thử lịch '+@key;
        `);
        await database.close_pool();
    }
});
