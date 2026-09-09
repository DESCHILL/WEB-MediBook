USE MediBook;
GO
SELECT name AS Bang FROM sys.tables WHERE is_ms_shipped=0 ORDER BY name;
SELECT name AS KhoaNgoai, is_disabled AS BiVoHieu FROM sys.foreign_keys ORDER BY name;
SET XACT_ABORT OFF;
SET ANSI_NULLS ON;
SET ANSI_WARNINGS ON;
SET ANSI_PADDING ON;
SET QUOTED_IDENTIFIER ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ARITHABORT ON;
SET NUMERIC_ROUNDABORT OFF;
BEGIN TRANSACTION;
BEGIN TRY
    INSERT dbo.TaiKhoan(email,mat_khau_hash,ho_ten,vai_tro)
    VALUES ('test-patient@invalid.example','test','Test patient','BENH_NHAN');
    DECLARE @patientUser bigint=SCOPE_IDENTITY();
    INSERT dbo.BenhNhan(tai_khoan_id) VALUES(@patientUser);
    DECLARE @patient bigint=SCOPE_IDENTITY();
    INSERT dbo.TaiKhoan(email,mat_khau_hash,ho_ten,vai_tro)
    VALUES ('test-doctor@invalid.example','test','Test doctor','BAC_SI');
    DECLARE @doctorUser bigint=SCOPE_IDENTITY();
    INSERT dbo.ChuyenKhoa(ten_chuyen_khoa) VALUES(N'Test');
    DECLARE @specialty bigint=SCOPE_IDENTITY();
    INSERT dbo.BacSi(tai_khoan_id,chuyen_khoa_id) VALUES(@doctorUser,@specialty);
    DECLARE @doctor bigint=SCOPE_IDENTITY();
    INSERT dbo.LichLamViec(bac_si_id,thu_trong_tuan,gio_bat_dau,gio_ket_thuc)
    VALUES(@doctor,2,'08:00','17:00');
    DECLARE @schedule bigint=SCOPE_IDENTITY(), @rejected bit=0;
    BEGIN TRY
        INSERT dbo.KhungGioKham(lich_lam_viec_id,bac_si_id,bat_dau_luc,ket_thuc_luc)
        VALUES(@schedule,@doctor,'2099-01-05T08:00:00','2099-01-05T08:45:00');
    END TRY BEGIN CATCH
        IF ERROR_NUMBER()<>547 THROW;
        SET @rejected=1;
    END CATCH;
    IF @rejected=0 THROW 51000,N'Không chặn khung giờ sai thời lượng.',1;
    INSERT dbo.KhungGioKham(lich_lam_viec_id,bac_si_id,bat_dau_luc,ket_thuc_luc)
    VALUES(@schedule,@doctor,'2099-01-05T08:00:00','2099-01-05T08:30:00');
    DECLARE @slot bigint=SCOPE_IDENTITY();
    INSERT dbo.LichHen(benh_nhan_id,khung_gio_id) VALUES(@patient,@slot);
    DECLARE @appointment bigint=SCOPE_IDENTITY();
    SET @rejected=0;
    BEGIN TRY
        INSERT dbo.LichHen(benh_nhan_id,khung_gio_id) VALUES(@patient,@slot);
    END TRY BEGIN CATCH
        IF ERROR_NUMBER() NOT IN (2601,2627) THROW;
        SET @rejected=1;
    END CATCH;
    IF @rejected=0 THROW 51001,N'Không chặn đặt trùng khung giờ.',1;
    UPDATE dbo.LichHen SET trang_thai=N'Đã hủy',nguoi_huy_id=@patientUser,huy_luc=SYSDATETIME()
    WHERE lich_hen_id=@appointment;
    INSERT dbo.LichHen(benh_nhan_id,khung_gio_id) VALUES(@patient,@slot);
    ROLLBACK TRANSACTION;
    SELECT N'PASS: 30 phút; chặn đặt trùng; đặt lại sau hủy; dữ liệu thử đã rollback.' AS KetQua;
END TRY BEGIN CATCH
    IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
