export function create_auth_repository(database) {
    async function create_patient(input) {
        const pool = await database.get_pool();
        const result = await pool.request().input('email', input.email).input('ho_ten', input.ho_ten).input('mat_khau_hash', input.mat_khau_hash).query(`
            SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRANSACTION;
                INSERT dbo.TaiKhoan(email,ho_ten,mat_khau_hash,vai_tro) VALUES(@email,@ho_ten,@mat_khau_hash,'BENH_NHAN');
                DECLARE @tai_khoan_id bigint = SCOPE_IDENTITY();
                INSERT dbo.BenhNhan(tai_khoan_id) VALUES(@tai_khoan_id);
                COMMIT TRANSACTION;
                SELECT CONVERT(varchar(20),tai_khoan_id) AS tai_khoan_id,email,ho_ten,vai_tro FROM dbo.TaiKhoan WHERE tai_khoan_id=@tai_khoan_id;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
                THROW;
            END CATCH;
        `);
        return result.recordset[0];
    }
    async function find_by_email(email) {
        const pool = await database.get_pool();
        const result = await pool.request().input('email', email).query(`SELECT CONVERT(varchar(20),tai_khoan_id) AS tai_khoan_id,email,ho_ten,vai_tro,mat_khau_hash,hoat_dong FROM dbo.TaiKhoan WHERE email=@email;`);
        return result.recordset[0];
    }
    async function create_session(session_id, account_id) {
        const pool = await database.get_pool();
        await pool.request().input('session_id', session_id).input('account_id', String(account_id)).query(`
            DELETE dbo.PhienDangNhap WHERE tai_khoan_id=@account_id AND het_han_luc<=SYSUTCDATETIME();
            INSERT dbo.PhienDangNhap(phien_id,tai_khoan_id,het_han_luc) VALUES(@session_id,@account_id,DATEADD(SECOND,3600,SYSUTCDATETIME()));
        `);
    }
    async function find_session(session_id, account_id) {
        const pool = await database.get_pool();
        const result = await pool.request().input('session_id', session_id).input('account_id', account_id).query(`
            SELECT CONVERT(varchar(20),a.tai_khoan_id) AS tai_khoan_id,a.email,a.ho_ten,a.vai_tro,a.hoat_dong
            FROM dbo.PhienDangNhap s INNER JOIN dbo.TaiKhoan a ON a.tai_khoan_id=s.tai_khoan_id
            WHERE s.phien_id=@session_id AND s.tai_khoan_id=@account_id AND s.het_han_luc>SYSUTCDATETIME();
        `);
        return result.recordset[0];
    }
    async function delete_session(session_id) {
        const pool = await database.get_pool();
        await pool.request().input('session_id', session_id).query('DELETE dbo.PhienDangNhap WHERE phien_id=@session_id;');
    }
    return { create_patient, find_by_email, create_session, find_session, delete_session };
}
