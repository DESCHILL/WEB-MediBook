USE master;
GO
IF DB_ID(N'MediBook') IS NULL
    EXEC(N'CREATE DATABASE MediBook');
GO
USE MediBook;
GO
SET XACT_ABORT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ARITHABORT ON;
SET NUMERIC_ROUNDABORT OFF;
GO
IF EXISTS (SELECT 1 FROM sys.tables WHERE is_ms_shipped=0)
    THROW 50001, N'Database đã có bảng. Dừng để bảo vệ dữ liệu hiện có.', 1;

BEGIN TRANSACTION;

CREATE TABLE dbo.TaiKhoan (
    tai_khoan_id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_TaiKhoan PRIMARY KEY,
    email nvarchar(254) NOT NULL CONSTRAINT UQ_TaiKhoan_Email UNIQUE,
    mat_khau_hash varchar(255) NOT NULL,
    ho_ten nvarchar(150) NOT NULL,
    so_dien_thoai varchar(20) NULL,
    vai_tro varchar(20) NOT NULL,
    hoat_dong bit NOT NULL CONSTRAINT DF_TaiKhoan_HoatDong DEFAULT 1,
    tao_luc datetime2(0) NOT NULL CONSTRAINT DF_TaiKhoan_TaoLuc DEFAULT SYSDATETIME(),
    CONSTRAINT CK_TaiKhoan_VaiTro CHECK (vai_tro IN ('BENH_NHAN','BAC_SI','ADMIN'))
);

CREATE TABLE dbo.BenhNhan (
    benh_nhan_id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_BenhNhan PRIMARY KEY,
    tai_khoan_id bigint NOT NULL CONSTRAINT UQ_BenhNhan_TaiKhoan UNIQUE,
    ngay_sinh date NULL,
    gioi_tinh nvarchar(20) NULL,
    dia_chi nvarchar(500) NULL,
    CONSTRAINT FK_BenhNhan_TaiKhoan FOREIGN KEY (tai_khoan_id) REFERENCES dbo.TaiKhoan(tai_khoan_id)
);

CREATE TABLE dbo.ChuyenKhoa (
    chuyen_khoa_id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_ChuyenKhoa PRIMARY KEY,
    ten_chuyen_khoa nvarchar(150) NOT NULL CONSTRAINT UQ_ChuyenKhoa_Ten UNIQUE,
    mo_ta nvarchar(2000) NULL,
    anh_dai_dien nvarchar(1000) NULL
);

CREATE TABLE dbo.BacSi (
    bac_si_id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_BacSi PRIMARY KEY,
    tai_khoan_id bigint NOT NULL CONSTRAINT UQ_BacSi_TaiKhoan UNIQUE,
    chuyen_khoa_id bigint NOT NULL,
    bang_cap nvarchar(250) NULL,
    kinh_nghiem nvarchar(500) NULL,
    gioi_thieu nvarchar(4000) NULL,
    dia_chi_kham nvarchar(500) NULL,
    anh_dai_dien nvarchar(1000) NULL,
    phi_kham decimal(12,2) NOT NULL CONSTRAINT DF_BacSi_PhiKham DEFAULT 0,
    CONSTRAINT CK_BacSi_PhiKham CHECK (phi_kham >= 0),
    CONSTRAINT FK_BacSi_TaiKhoan FOREIGN KEY (tai_khoan_id) REFERENCES dbo.TaiKhoan(tai_khoan_id),
    CONSTRAINT FK_BacSi_ChuyenKhoa FOREIGN KEY (chuyen_khoa_id) REFERENCES dbo.ChuyenKhoa(chuyen_khoa_id)
);

CREATE TABLE dbo.LichLamViec (
    lich_lam_viec_id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_LichLamViec PRIMARY KEY,
    bac_si_id bigint NOT NULL,
    thu_trong_tuan tinyint NOT NULL,
    gio_bat_dau time(0) NOT NULL,
    gio_ket_thuc time(0) NOT NULL,
    hoat_dong bit NOT NULL CONSTRAINT DF_LichLamViec_HoatDong DEFAULT 1,
    CONSTRAINT CK_LichLamViec_Thu CHECK (thu_trong_tuan BETWEEN 2 AND 8),
    CONSTRAINT CK_LichLamViec_Gio CHECK (gio_ket_thuc > gio_bat_dau),
    CONSTRAINT UQ_LichLamViec_IdBacSi UNIQUE (lich_lam_viec_id,bac_si_id),
    CONSTRAINT UQ_LichLamViec_BatDau UNIQUE (bac_si_id,thu_trong_tuan,gio_bat_dau),
    CONSTRAINT FK_LichLamViec_BacSi FOREIGN KEY (bac_si_id) REFERENCES dbo.BacSi(bac_si_id)
);

CREATE TABLE dbo.KhungGioKham (
    khung_gio_id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_KhungGioKham PRIMARY KEY,
    lich_lam_viec_id bigint NOT NULL,
    bac_si_id bigint NOT NULL,
    bat_dau_luc datetime2(0) NOT NULL,
    ket_thuc_luc datetime2(0) NOT NULL,
    suc_chua tinyint NOT NULL CONSTRAINT DF_KhungGioKham_SucChua DEFAULT 1,
    so_cho_da_dat tinyint NOT NULL CONSTRAINT DF_KhungGioKham_SoCho DEFAULT 0,
    CONSTRAINT CK_KhungGioKham_30Phut CHECK (ket_thuc_luc = DATEADD(MINUTE,30,bat_dau_luc)),
    CONSTRAINT CK_KhungGioKham_SucChua CHECK (suc_chua=1 AND so_cho_da_dat BETWEEN 0 AND 1),
    CONSTRAINT UQ_KhungGioKham_BacSiBatDau UNIQUE (bac_si_id,bat_dau_luc),
    CONSTRAINT FK_KhungGioKham_LichLamViec FOREIGN KEY (lich_lam_viec_id,bac_si_id) REFERENCES dbo.LichLamViec(lich_lam_viec_id,bac_si_id),
    CONSTRAINT FK_KhungGioKham_BacSi FOREIGN KEY (bac_si_id) REFERENCES dbo.BacSi(bac_si_id)
);

CREATE TABLE dbo.LichHen (
    lich_hen_id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_LichHen PRIMARY KEY,
    benh_nhan_id bigint NOT NULL,
    khung_gio_id bigint NOT NULL,
    nguoi_huy_id bigint NULL,
    trang_thai nvarchar(20) NOT NULL CONSTRAINT DF_LichHen_TrangThai DEFAULT N'Đã đặt',
    dat_luc datetime2(0) NOT NULL CONSTRAINT DF_LichHen_DatLuc DEFAULT SYSDATETIME(),
    huy_luc datetime2(0) NULL,
    CONSTRAINT CK_LichHen_TrangThai CHECK (trang_thai IN (N'Đã đặt',N'Đã hủy',N'Đã khám')),
    CONSTRAINT CK_LichHen_Huy CHECK (
        (trang_thai=N'Đã hủy' AND nguoi_huy_id IS NOT NULL AND huy_luc IS NOT NULL)
        OR (trang_thai<>N'Đã hủy' AND nguoi_huy_id IS NULL AND huy_luc IS NULL)),
    CONSTRAINT FK_LichHen_BenhNhan FOREIGN KEY (benh_nhan_id) REFERENCES dbo.BenhNhan(benh_nhan_id),
    CONSTRAINT FK_LichHen_KhungGio FOREIGN KEY (khung_gio_id) REFERENCES dbo.KhungGioKham(khung_gio_id),
    CONSTRAINT FK_LichHen_NguoiHuy FOREIGN KEY (nguoi_huy_id) REFERENCES dbo.TaiKhoan(tai_khoan_id)
);

CREATE UNIQUE INDEX UX_LichHen_KhungGioConHieuLuc ON dbo.LichHen(khung_gio_id)
    WHERE trang_thai <> N'Đã hủy';
CREATE INDEX IX_LichHen_BenhNhan ON dbo.LichHen(benh_nhan_id,dat_luc);

CREATE TABLE dbo.KetQuaKham (
    ket_qua_id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_KetQuaKham PRIMARY KEY,
    lich_hen_id bigint NOT NULL CONSTRAINT UQ_KetQuaKham_LichHen UNIQUE,
    noi_dung nvarchar(4000) NOT NULL,
    tao_luc datetime2(0) NOT NULL CONSTRAINT DF_KetQuaKham_TaoLuc DEFAULT SYSDATETIME(),
    CONSTRAINT CK_KetQuaKham_NoiDung CHECK (LEN(LTRIM(RTRIM(noi_dung)))>0),
    CONSTRAINT FK_KetQuaKham_LichHen FOREIGN KEY (lich_hen_id) REFERENCES dbo.LichHen(lich_hen_id)
);

COMMIT TRANSACTION;
GO
