import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID as random_uuid } from 'node:crypto';
import sql from 'mssql/msnodesqlv8.js';
import { create_database } from '../src/config/database.js';
import { read_environment } from '../src/config/environment.js';
import { create_catalog_repository } from '../src/repositories/catalog_repository.js';
import { create_catalog_service } from '../src/services/catalog_service.js';

test('SQL thật: lọc, phân trang và chi tiết chỉ trả bác sĩ hoạt động; rollback dữ liệu thử', { skip: process.env.RUN_DATABASE_TESTS !== 'true' }, async () => {
    const database = create_database(read_environment());
    let transaction;
    try {
        const pool = await database.get_pool();
        transaction = new sql.Transaction(pool); await transaction.begin();
        const fixture = await new sql.Request(transaction).input('key', random_uuid()).query(`
            INSERT dbo.ChuyenKhoa(ten_chuyen_khoa) VALUES(N'Kiểm thử '+@key);
            DECLARE @specialty bigint=SCOPE_IDENTITY();
            INSERT dbo.TaiKhoan(email,ho_ten,mat_khau_hash,vai_tro,hoat_dong)
            VALUES(@key+'@example.test',N'Bác sĩ kiểm thử','test_fixture_not_a_password','BAC_SI',1);
            DECLARE @account bigint=SCOPE_IDENTITY();
            INSERT dbo.BacSi(tai_khoan_id,chuyen_khoa_id,phi_kham) VALUES(@account,@specialty,175000);
            SELECT CONVERT(varchar(20),@specialty) AS specialty_id,CONVERT(varchar(20),SCOPE_IDENTITY()) AS doctor_id,CONVERT(varchar(20),@account) AS account_id;
        `);
        const { specialty_id, doctor_id, account_id } = fixture.recordset[0];
        const repository = create_catalog_repository({ get_pool: async () => ({ request: () => new sql.Request(transaction) }) });
        const service = create_catalog_service(repository);
        const first = await service.list_doctors({ chuyen_khoa_id: specialty_id, page: '1', page_size: '1' });
        assert.equal(first.total, 1); assert.equal(first.items[0].bac_si_id, doctor_id);
        assert.equal((await service.list_doctors({ chuyen_khoa_id: specialty_id, page: '2', page_size: '1' })).items.length, 0);
        assert.equal((await service.get_doctor(doctor_id)).phi_kham, 175000);
        await new sql.Request(transaction).input('id', account_id).query('UPDATE dbo.TaiKhoan SET hoat_dong=0 WHERE tai_khoan_id=@id;');
        assert.equal((await service.list_doctors({ chuyen_khoa_id: specialty_id })).total, 0);
        await assert.rejects(service.get_doctor(doctor_id), { status: 404 });
        await new sql.Request(transaction).input('id', account_id).query("UPDATE dbo.TaiKhoan SET hoat_dong=1,vai_tro='ADMIN' WHERE tai_khoan_id=@id;");
        assert.equal((await service.list_doctors({ chuyen_khoa_id: specialty_id })).total, 0);
    } finally {
        if (transaction) await transaction.rollback();
        await database.close_pool();
    }
});
