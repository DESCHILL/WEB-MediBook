export function create_doctor_repository(database) {
    async function list(account_id) {
        const pool=await database.get_pool();
        return (await pool.request().input('account_id',account_id).query(`
            SELECT CONVERT(varchar(20),h.lich_hen_id) lich_hen_id,CONVERT(varchar(20),p.benh_nhan_id) benh_nhan_id,a.ho_ten,
                CASE WHEN p.ngay_sinh IS NULL THEN NULL ELSE DATEDIFF(year,p.ngay_sinh,CAST(k.bat_dau_luc AS date))-CASE WHEN DATEADD(year,DATEDIFF(year,p.ngay_sinh,CAST(k.bat_dau_luc AS date)),p.ngay_sinh)>CAST(k.bat_dau_luc AS date) THEN 1 ELSE 0 END END tuoi,
                CONVERT(varchar(19),k.bat_dau_luc,126)+'+07:00' bat_dau_luc,CONVERT(varchar(19),k.ket_thuc_luc,126)+'+07:00' ket_thuc_luc,
                h.trang_thai,q.noi_dung ket_qua,CONVERT(bit,CASE WHEN h.trang_thai=N'Đã đặt' AND k.bat_dau_luc<=CONVERT(datetime2(0),SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') THEN 1 ELSE 0 END) co_the_ghi_ket_qua
            FROM dbo.LichHen h JOIN dbo.KhungGioKham k ON k.khung_gio_id=h.khung_gio_id JOIN dbo.BacSi b ON b.bac_si_id=k.bac_si_id
            JOIN dbo.BenhNhan p ON p.benh_nhan_id=h.benh_nhan_id JOIN dbo.TaiKhoan a ON a.tai_khoan_id=p.tai_khoan_id
            LEFT JOIN dbo.KetQuaKham q ON q.lich_hen_id=h.lich_hen_id
            WHERE b.tai_khoan_id=@account_id ORDER BY k.bat_dau_luc DESC,h.lich_hen_id DESC;
        `)).recordset;
    }
    async function save_result(account_id,id,content) {
        const pool=await database.get_pool();
        await pool.request().input('account_id',account_id).input('id',id).input('content',content).query(`
            SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRANSACTION;
                DECLARE @slot bigint=(SELECT h.khung_gio_id FROM dbo.LichHen h JOIN dbo.KhungGioKham k ON k.khung_gio_id=h.khung_gio_id JOIN dbo.BacSi b ON b.bac_si_id=k.bac_si_id WHERE h.lich_hen_id=@id AND b.tai_khoan_id=@account_id);
                IF @slot IS NULL THROW 51003,N'Không tìm thấy lịch phụ trách.',1;
                DECLARE @start datetime2;
                SELECT @start=bat_dau_luc FROM dbo.KhungGioKham WITH(UPDLOCK,HOLDLOCK) WHERE khung_gio_id=@slot;
                UPDATE dbo.LichHen SET trang_thai=N'Đã khám' WHERE lich_hen_id=@id AND trang_thai=N'Đã đặt' AND @start<=CONVERT(datetime2(0),SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time');
                IF @@ROWCOUNT<>1 THROW 51006,N'Lịch chưa đủ điều kiện ghi kết quả.',1;
                INSERT dbo.KetQuaKham(lich_hen_id,noi_dung,tao_luc) VALUES(@id,@content,CONVERT(datetime2(0),SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time'));
                COMMIT;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT>0 ROLLBACK;
                THROW;
            END CATCH;
        `);
    }
    return {list,save_result};
}
