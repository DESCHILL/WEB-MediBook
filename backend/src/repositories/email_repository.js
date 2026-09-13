export const insert_verification_sql = `
    INSERT dbo.XacMinhEmail(token_hash,tai_khoan_id,muc_dich,het_han_luc)
    VALUES(@token_hash,@email_account_id,@purpose,DATEADD(HOUR,24,SYSUTCDATETIME()));
    INSERT dbo.HangDoiEmail(tai_khoan_id,loai,du_lieu) VALUES(@email_account_id,@purpose,@email_payload);
`;

export function bind_verification(request, verification) {
    return request.input('token_hash',verification.token_hash).input('purpose',verification.purpose).input('email_payload',verification.payload);
}

export function create_email_repository(database) {
    async function resend(email, verification) {
        const pool = await database.get_pool();
        await bind_verification(pool.request(),verification).input('email',email).query(`
            SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRANSACTION;
                DECLARE @email_account_id bigint, @role varchar(20);
                SELECT @email_account_id=tai_khoan_id,@role=vai_tro FROM dbo.TaiKhoan WITH(UPDLOCK,HOLDLOCK)
                WHERE email=@email AND hoat_dong=1 AND email_xac_minh_luc IS NULL AND vai_tro IN ('BENH_NHAN','BAC_SI');
                IF @email_account_id IS NOT NULL AND NOT EXISTS(
                    SELECT 1 FROM dbo.XacMinhEmail WHERE tai_khoan_id=@email_account_id AND tao_luc>DATEADD(SECOND,-60,SYSUTCDATETIME()))
                BEGIN
                    DELETE dbo.XacMinhEmail WHERE tai_khoan_id=@email_account_id;
                    UPDATE dbo.HangDoiEmail SET trang_thai='CANCELLED',du_lieu=NULL WHERE tai_khoan_id=@email_account_id AND loai IN ('VERIFY','INVITE_DOCTOR') AND trang_thai IN ('PENDING','FAILED');
                    ${insert_verification_sql}
                END;
                COMMIT;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT>0 ROLLBACK;
                THROW;
            END CATCH;
        `);
    }
    async function find_pending_account(email) {
        const pool = await database.get_pool();
        return (await pool.request().input('email',email).query("SELECT vai_tro FROM dbo.TaiKhoan WHERE email=@email AND email_xac_minh_luc IS NULL AND hoat_dong=1 AND vai_tro IN ('BENH_NHAN','BAC_SI');")).recordset[0];
    }
    async function consume(token_hash, purpose, password_hash = null) {
        const pool = await database.get_pool();
        const result = await pool.request().input('hash',token_hash).input('purpose',purpose).input('password_hash',password_hash).query(`
            SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRANSACTION;
                DECLARE @id bigint;
                SELECT @id=a.tai_khoan_id FROM dbo.TaiKhoan a WITH(UPDLOCK,HOLDLOCK)
                JOIN dbo.XacMinhEmail v ON v.tai_khoan_id=a.tai_khoan_id
                WHERE v.token_hash=@hash AND v.muc_dich=@purpose AND v.het_han_luc>SYSUTCDATETIME()
                    AND a.email_xac_minh_luc IS NULL AND a.hoat_dong=1
                    AND ((@purpose='VERIFY' AND a.vai_tro='BENH_NHAN') OR (@purpose='INVITE_DOCTOR' AND a.vai_tro='BAC_SI' AND @password_hash IS NOT NULL));
                IF @id IS NULL THROW 51010,N'Liên kết không hợp lệ hoặc đã hết hạn.',1;
                UPDATE dbo.TaiKhoan SET email_xac_minh_luc=SYSUTCDATETIME(),mat_khau_hash=COALESCE(@password_hash,mat_khau_hash) WHERE tai_khoan_id=@id;
                DELETE dbo.XacMinhEmail WHERE tai_khoan_id=@id;
                DELETE dbo.PhienDangNhap WHERE tai_khoan_id=@id;
                UPDATE dbo.HangDoiEmail SET trang_thai='CANCELLED',du_lieu=NULL WHERE tai_khoan_id=@id AND loai IN ('VERIFY','INVITE_DOCTOR') AND trang_thai IN ('PENDING','FAILED');
                COMMIT;
                SELECT CONVERT(varchar(20),@id) tai_khoan_id;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT>0 ROLLBACK;
                THROW;
            END CATCH;
        `);
        return result.recordset[0];
    }
    async function claim(account_id = null) {
        const pool = await database.get_pool();
        return (await pool.request().input('account_id',account_id===null?null:String(account_id)).query(`
            UPDATE e SET trang_thai='CANCELLED',du_lieu=NULL FROM dbo.HangDoiEmail e
            WHERE e.trang_thai IN ('PENDING','FAILED') AND e.loai IN ('VERIFY','INVITE_DOCTOR')
                AND (@account_id IS NULL OR e.tai_khoan_id=@account_id)
                AND NOT EXISTS(SELECT 1 FROM dbo.XacMinhEmail v WHERE v.tai_khoan_id=e.tai_khoan_id AND v.het_han_luc>SYSUTCDATETIME());
            ;WITH next_email AS (
                SELECT TOP(1) * FROM dbo.HangDoiEmail WITH(UPDLOCK,READPAST,ROWLOCK)
                WHERE (@account_id IS NULL OR tai_khoan_id=@account_id) AND
                    ((trang_thai='PENDING' AND thu_lai_luc<=SYSUTCDATETIME()) OR (trang_thai='SENDING' AND khoa_den_luc<SYSUTCDATETIME()))
                ORDER BY email_id
            )
            UPDATE next_email SET trang_thai='SENDING',ma_khoa=NEWID(),khoa_den_luc=DATEADD(MINUTE,5,SYSUTCDATETIME()),so_lan_thu=so_lan_thu+1
            OUTPUT CONVERT(varchar(20),inserted.email_id) email_id,inserted.ma_khoa,inserted.tai_khoan_id,inserted.loai,inserted.du_lieu,inserted.so_lan_thu;
        `)).recordset[0];
    }
    async function recipient(account_id) {
        const pool = await database.get_pool();
        return (await pool.request().input('id',String(account_id)).query('SELECT email,ho_ten,hoat_dong,email_xac_minh_luc FROM dbo.TaiKhoan WHERE tai_khoan_id=@id;')).recordset[0];
    }
    async function finish(item, error_code = null) {
        const pool = await database.get_pool();
        await pool.request().input('id',item.email_id).input('lease',item.ma_khoa).input('error',error_code).query(`
            UPDATE dbo.HangDoiEmail SET trang_thai=CASE WHEN @error IS NULL THEN 'SENT' WHEN so_lan_thu>=8 THEN 'FAILED' ELSE 'PENDING' END,
                du_lieu=CASE WHEN @error IS NULL THEN NULL ELSE du_lieu END,
                gui_luc=CASE WHEN @error IS NULL THEN SYSUTCDATETIME() ELSE NULL END,ma_loi=@error,
                thu_lai_luc=DATEADD(MINUTE,CASE WHEN so_lan_thu>6 THEN 60 ELSE POWER(2,so_lan_thu) END,SYSUTCDATETIME()),khoa_den_luc=NULL
            WHERE email_id=@id AND ma_khoa=@lease AND trang_thai='SENDING';
        `);
    }
    return {resend,find_pending_account,consume,claim,recipient,finish};
}
