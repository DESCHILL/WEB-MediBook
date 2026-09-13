export function create_profile_repository(database) {
    async function get(account_id) {
        const pool=await database.get_pool();
        return (await pool.request().input('account_id',account_id).query(`SELECT CONVERT(varchar(20),p.benh_nhan_id) benh_nhan_id,a.ho_ten,a.email,a.so_dien_thoai,CONVERT(varchar(10),p.ngay_sinh,23) ngay_sinh,p.gioi_tinh,p.dia_chi FROM dbo.BenhNhan p JOIN dbo.TaiKhoan a ON a.tai_khoan_id=p.tai_khoan_id WHERE p.tai_khoan_id=@account_id;`)).recordset[0];
    }
    async function update(account_id, data) {
        const pool=await database.get_pool();
        const request=pool.request().input('account_id',account_id);
        for (const [key,value] of Object.entries(data)) request.input(key,value || null);
        await request.query(`SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRANSACTION;
                IF NOT EXISTS(SELECT 1 FROM dbo.BenhNhan WHERE tai_khoan_id=@account_id) THROW 51003,N'Không tìm thấy hồ sơ.',1;
                UPDATE dbo.TaiKhoan SET ho_ten=@ho_ten,so_dien_thoai=@so_dien_thoai WHERE tai_khoan_id=@account_id;
                UPDATE dbo.BenhNhan SET ngay_sinh=CONVERT(date,@ngay_sinh,23),gioi_tinh=@gioi_tinh,dia_chi=@dia_chi WHERE tai_khoan_id=@account_id;
                COMMIT;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT>0 ROLLBACK;
                THROW;
            END CATCH;`);
        return get(account_id);
    }
    return {get,update};
}
