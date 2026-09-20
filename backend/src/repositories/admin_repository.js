import {bind_verification,insert_verification_sql} from './email_repository.js';
export function create_admin_repository(database) {
    async function dashboard() {
        const pool=await database.get_pool();
        return (await pool.request().query(`SELECT (SELECT COUNT(*) FROM dbo.BacSi) bac_si,(SELECT COUNT(*) FROM dbo.BenhNhan) benh_nhan,(SELECT COUNT(*) FROM dbo.LichHen) lich_hen;`)).recordset[0];
    }
    async function appointments() {
        const pool=await database.get_pool();
        return (await pool.request().query(`SELECT CONVERT(varchar(20),h.lich_hen_id) lich_hen_id,p.ho_ten benh_nhan,p.so_dien_thoai,n.dia_chi,d.ho_ten bac_si,c.ten_chuyen_khoa,h.trang_thai,CONVERT(varchar(19),k.bat_dau_luc,126)+'+07:00' bat_dau_luc,CONVERT(bit,CASE WHEN h.trang_thai=N'Đã đặt' AND k.bat_dau_luc>CONVERT(datetime2(0),SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') THEN 1 ELSE 0 END) co_the_huy FROM dbo.LichHen h JOIN dbo.BenhNhan n ON n.benh_nhan_id=h.benh_nhan_id JOIN dbo.TaiKhoan p ON p.tai_khoan_id=n.tai_khoan_id JOIN dbo.KhungGioKham k ON k.khung_gio_id=h.khung_gio_id JOIN dbo.BacSi b ON b.bac_si_id=k.bac_si_id JOIN dbo.TaiKhoan d ON d.tai_khoan_id=b.tai_khoan_id JOIN dbo.ChuyenKhoa c ON c.chuyen_khoa_id=b.chuyen_khoa_id ORDER BY k.bat_dau_luc DESC,h.lich_hen_id DESC;`)).recordset;
    }
    async function cancel(account_id,id) {
        const pool=await database.get_pool();
        await pool.request().input('account_id',account_id).input('id',id).query(`
            SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRANSACTION;
                IF NOT EXISTS(SELECT 1 FROM dbo.TaiKhoan WHERE tai_khoan_id=@account_id AND vai_tro='ADMIN' AND hoat_dong=1) THROW 51007,N'Không có quyền quản trị.',1;
                DECLARE @slot bigint=(SELECT khung_gio_id FROM dbo.LichHen WHERE lich_hen_id=@id),@start datetime2;
                IF @slot IS NULL THROW 51003,N'Không tìm thấy lịch hẹn.',1;
                SELECT @start=bat_dau_luc FROM dbo.KhungGioKham WITH(UPDLOCK,HOLDLOCK) WHERE khung_gio_id=@slot;
                UPDATE dbo.LichHen SET trang_thai=N'Đã hủy',nguoi_huy_id=@account_id,huy_luc=CONVERT(datetime2(0),SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') WHERE lich_hen_id=@id AND trang_thai=N'Đã đặt' AND @start>CONVERT(datetime2(0),SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time');
                IF @@ROWCOUNT<>1 THROW 51004,N'Không đủ điều kiện hủy.',1;
                UPDATE dbo.KhungGioKham SET so_cho_da_dat=so_cho_da_dat-1 WHERE khung_gio_id=@slot AND so_cho_da_dat>0;
                IF @@ROWCOUNT<>1 THROW 51004,N'Không thể giải phóng chỗ.',1;
                COMMIT;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT>0 ROLLBACK;
                THROW;
            END CATCH;`);
    }
    async function doctors() {
        const pool=await database.get_pool();
        return (await pool.request().query(`SELECT CONVERT(varchar(20),b.bac_si_id) bac_si_id,a.ho_ten,a.email,a.hoat_dong,c.ten_chuyen_khoa,b.anh_dai_dien FROM dbo.BacSi b JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id JOIN dbo.ChuyenKhoa c ON c.chuyen_khoa_id=b.chuyen_khoa_id ORDER BY b.bac_si_id;`)).recordset;
    }
    async function create_doctor(data) {
        const pool=await database.get_pool();
        const request=bind_verification(pool.request(),data.verification);for(const [key,value] of Object.entries(data))if(key!=='verification')request.input(key,value);
        return (await request.query(`SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRANSACTION;
                INSERT dbo.TaiKhoan(email,mat_khau_hash,ho_ten,vai_tro) VALUES(@email,@mat_khau_hash,@ho_ten,'BAC_SI');
                DECLARE @account bigint=SCOPE_IDENTITY();
                INSERT dbo.BacSi(tai_khoan_id,chuyen_khoa_id,bang_cap,kinh_nghiem,gioi_thieu,dia_chi_kham,anh_dai_dien,phi_kham) VALUES(@account,@chuyen_khoa_id,@bang_cap,@kinh_nghiem,@gioi_thieu,@dia_chi_kham,@anh_dai_dien,@phi_kham);
                DECLARE @id bigint=SCOPE_IDENTITY(),@email_account_id bigint=@account;
                ${insert_verification_sql}
                COMMIT;
                SELECT CONVERT(varchar(20),@id) bac_si_id;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT>0 ROLLBACK;
                THROW;
            END CATCH;`)).recordset[0];
    }
    async function specialties() {
        const pool=await database.get_pool();
        return (await pool.request().query(`SELECT CONVERT(varchar(20),c.chuyen_khoa_id) chuyen_khoa_id,c.ten_chuyen_khoa,c.mo_ta,c.anh_dai_dien,COUNT(b.bac_si_id) so_bac_si FROM dbo.ChuyenKhoa c LEFT JOIN dbo.BacSi b ON b.chuyen_khoa_id=c.chuyen_khoa_id GROUP BY c.chuyen_khoa_id,c.ten_chuyen_khoa,c.mo_ta,c.anh_dai_dien ORDER BY c.chuyen_khoa_id;`)).recordset;
    }
    async function save_specialty(id,data) {
        const pool=await database.get_pool();const request=pool.request().input('id',id);
        for(const [key,value] of Object.entries(data))request.input(key,value);
        return (await request.query(id?`UPDATE dbo.ChuyenKhoa SET ten_chuyen_khoa=@ten_chuyen_khoa,mo_ta=@mo_ta,anh_dai_dien=@anh_dai_dien OUTPUT CONVERT(varchar(20),inserted.chuyen_khoa_id) chuyen_khoa_id WHERE chuyen_khoa_id=@id;`:`INSERT dbo.ChuyenKhoa(ten_chuyen_khoa,mo_ta,anh_dai_dien) OUTPUT CONVERT(varchar(20),inserted.chuyen_khoa_id) chuyen_khoa_id VALUES(@ten_chuyen_khoa,@mo_ta,@anh_dai_dien);`)).recordset[0];
    }
    async function delete_specialty(id) {
        const pool=await database.get_pool();
        const result=await pool.request().input('id',id).query('DELETE dbo.ChuyenKhoa WHERE chuyen_khoa_id=@id;');
        return result.rowsAffected[0]>0;
    }
    return {dashboard,appointments,cancel,doctors,create_doctor,specialties,save_specialty,delete_specialty};
}
