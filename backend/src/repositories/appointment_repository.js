const local_now = "CONVERT(datetime2(0),SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time')";

export function create_appointment_repository(database) {
    async function list_patient_appointments(account_id) {
        const pool = await database.get_pool();
        const result = await pool.request().input('account_id', account_id).query(`
            SELECT CONVERT(varchar(20),h.lich_hen_id) lich_hen_id,
                CONVERT(varchar(20),b.bac_si_id) bac_si_id,a.ho_ten, c.ten_chuyen_khoa,b.dia_chi_kham,b.anh_dai_dien,
                CONVERT(varchar(19),k.bat_dau_luc,126)+'+07:00' bat_dau_luc,
                CONVERT(varchar(19),k.ket_thuc_luc,126)+'+07:00' ket_thuc_luc,
                h.trang_thai,q.noi_dung ket_qua,
                CONVERT(bit,CASE WHEN h.trang_thai=N'Đã đặt' AND k.bat_dau_luc>${local_now} THEN 1 ELSE 0 END) co_the_huy
            FROM dbo.LichHen h JOIN dbo.BenhNhan p ON p.benh_nhan_id=h.benh_nhan_id
            JOIN dbo.KhungGioKham k ON k.khung_gio_id=h.khung_gio_id
            JOIN dbo.BacSi b ON b.bac_si_id=k.bac_si_id JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id
            JOIN dbo.ChuyenKhoa c ON c.chuyen_khoa_id=b.chuyen_khoa_id
            LEFT JOIN dbo.KetQuaKham q ON q.lich_hen_id=h.lich_hen_id
            WHERE p.tai_khoan_id=@account_id ORDER BY k.bat_dau_luc DESC,h.lich_hen_id DESC;
        `);
        return result.recordset;
    }
    async function list_available_slots(doctor_id, day) {
        const pool = await database.get_pool();
        const result = await pool.request().input('doctor_id', doctor_id).input('day', day).query(`
            SELECT CONVERT(varchar(20),k.khung_gio_id) khung_gio_id,
                CONVERT(varchar(19),k.bat_dau_luc,126)+'+07:00' bat_dau_luc,
                CONVERT(varchar(19),k.ket_thuc_luc,126)+'+07:00' ket_thuc_luc
            FROM dbo.KhungGioKham k JOIN dbo.BacSi b ON b.bac_si_id=k.bac_si_id
            JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id
            JOIN dbo.LichLamViec l ON l.lich_lam_viec_id=k.lich_lam_viec_id
            WHERE k.bac_si_id=@doctor_id AND k.bat_dau_luc>=CONVERT(date,@day,23)
                AND k.bat_dau_luc<DATEADD(day,1,CONVERT(date,@day,23)) AND k.bat_dau_luc>${local_now}
                AND k.so_cho_da_dat<k.suc_chua AND a.hoat_dong=1 AND a.vai_tro='BAC_SI' AND l.hoat_dong=1
                AND NOT EXISTS (SELECT 1 FROM dbo.LichHen h WHERE h.khung_gio_id=k.khung_gio_id AND h.trang_thai<>N'Đã hủy')
            ORDER BY k.bat_dau_luc;
        `);
        return result.recordset;
    }
    async function book_appointment(account_id, slot_id) {
        const pool = await database.get_pool();
        const result = await pool.request().input('account_id', account_id).input('slot_id', slot_id).query(`
            SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRANSACTION;
                DECLARE @patient_id bigint=(SELECT benh_nhan_id FROM dbo.BenhNhan WHERE tai_khoan_id=@account_id);
                IF @patient_id IS NULL THROW 51001,N'Không tìm thấy hồ sơ bệnh nhân.',1;
                IF NOT EXISTS (SELECT 1 FROM dbo.KhungGioKham k WITH (UPDLOCK,HOLDLOCK)
                    JOIN dbo.LichLamViec l ON l.lich_lam_viec_id=k.lich_lam_viec_id
                    JOIN dbo.BacSi b ON b.bac_si_id=k.bac_si_id JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id
                    WHERE k.khung_gio_id=@slot_id AND k.so_cho_da_dat<k.suc_chua AND k.bat_dau_luc>${local_now}
                    AND l.hoat_dong=1 AND a.hoat_dong=1 AND a.vai_tro='BAC_SI')
                    THROW 51002,N'Khung giờ không còn khả dụng.',1;
                UPDATE dbo.KhungGioKham SET so_cho_da_dat=so_cho_da_dat+1 WHERE khung_gio_id=@slot_id;
                INSERT dbo.LichHen(benh_nhan_id,khung_gio_id,dat_luc) VALUES(@patient_id,@slot_id,${local_now});
                DECLARE @new_id bigint=SCOPE_IDENTITY();
                COMMIT;
                SELECT CONVERT(varchar(20),@new_id) lich_hen_id;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT>0 ROLLBACK;
                THROW;
            END CATCH;
        `);
        return result.recordset[0];
    }
    async function cancel_appointment(account_id, appointment_id) {
        const pool = await database.get_pool();
        await pool.request().input('account_id', account_id).input('appointment_id', appointment_id).query(`
            SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRANSACTION;
                DECLARE @slot_id bigint=(SELECT h.khung_gio_id FROM dbo.LichHen h
                    JOIN dbo.BenhNhan p ON p.benh_nhan_id=h.benh_nhan_id
                    WHERE h.lich_hen_id=@appointment_id AND p.tai_khoan_id=@account_id);
                IF @slot_id IS NULL THROW 51003,N'Không tìm thấy lịch hẹn.',1;
                DECLARE @start datetime2;
                SELECT @start=bat_dau_luc FROM dbo.KhungGioKham WITH(UPDLOCK,HOLDLOCK) WHERE khung_gio_id=@slot_id;
                UPDATE dbo.LichHen SET trang_thai=N'Đã hủy',nguoi_huy_id=@account_id,huy_luc=${local_now}
                WHERE lich_hen_id=@appointment_id AND trang_thai=N'Đã đặt' AND @start>${local_now};
                IF @@ROWCOUNT<>1 THROW 51004,N'Lịch hẹn không đủ điều kiện hủy.',1;
                UPDATE dbo.KhungGioKham SET so_cho_da_dat=so_cho_da_dat-1 WHERE khung_gio_id=@slot_id AND so_cho_da_dat>0;
                IF @@ROWCOUNT<>1 THROW 51004,N'Không thể giải phóng khung giờ.',1;
                COMMIT;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT>0 ROLLBACK;
                THROW;
            END CATCH;
        `);
    }
    return { list_patient_appointments, list_available_slots, book_appointment, cancel_appointment };
}
