USE MediBook;
GO
SET XACT_ABORT ON;
GO
IF OBJECT_ID(N'dbo.TaiKhoan', N'U') IS NULL
    THROW 50003, N'Cần chạy schema 01_create_medibook.sql trước migration xác thực.', 1;
IF OBJECT_ID(N'dbo.PhienDangNhap', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PhienDangNhap (
        phien_id varchar(36) NOT NULL CONSTRAINT PK_PhienDangNhap PRIMARY KEY,
        tai_khoan_id bigint NOT NULL,
        tao_luc datetime2(0) NOT NULL CONSTRAINT DF_PhienDangNhap_TaoLuc DEFAULT SYSUTCDATETIME(),
        het_han_luc datetime2(0) NOT NULL,
        CONSTRAINT FK_PhienDangNhap_TaiKhoan FOREIGN KEY (tai_khoan_id) REFERENCES dbo.TaiKhoan(tai_khoan_id)
    );
    CREATE INDEX IX_PhienDangNhap_TaiKhoan ON dbo.PhienDangNhap(tai_khoan_id,het_han_luc);
END;
GO
