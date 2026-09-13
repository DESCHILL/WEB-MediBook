USE MediBook;
GO
SET XACT_ABORT ON;
GO
IF COL_LENGTH('dbo.TaiKhoan','email_xac_minh_luc') IS NULL
    ALTER TABLE dbo.TaiKhoan ADD email_xac_minh_luc datetime2(0) NULL;
GO
IF OBJECT_ID('dbo.XacMinhEmail','U') IS NULL
BEGIN
    CREATE TABLE dbo.XacMinhEmail (
        token_hash varchar(64) NOT NULL PRIMARY KEY,
        tai_khoan_id bigint NOT NULL UNIQUE,
        muc_dich varchar(20) NOT NULL CHECK(muc_dich IN ('VERIFY','INVITE_DOCTOR')),
        tao_luc datetime2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
        het_han_luc datetime2(0) NOT NULL,
        FOREIGN KEY(tai_khoan_id) REFERENCES dbo.TaiKhoan(tai_khoan_id) ON DELETE CASCADE
    );
END;
IF OBJECT_ID('dbo.HangDoiEmail','U') IS NULL
BEGIN
    CREATE TABLE dbo.HangDoiEmail (
        email_id bigint IDENTITY PRIMARY KEY,
        tai_khoan_id bigint NOT NULL,
        loai varchar(20) NOT NULL CHECK(loai IN ('VERIFY','INVITE_DOCTOR','BOOKING')),
        du_lieu nvarchar(max) NULL CHECK(du_lieu IS NULL OR ISJSON(du_lieu)=1),
        trang_thai varchar(12) NOT NULL DEFAULT 'PENDING' CHECK(trang_thai IN ('PENDING','SENDING','SENT','FAILED','CANCELLED')),
        so_lan_thu int NOT NULL DEFAULT 0,
        tao_luc datetime2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
        thu_lai_luc datetime2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
        khoa_den_luc datetime2(0) NULL,
        ma_khoa uniqueidentifier NULL,
        gui_luc datetime2(0) NULL,
        ma_loi varchar(40) NULL,
        FOREIGN KEY(tai_khoan_id) REFERENCES dbo.TaiKhoan(tai_khoan_id) ON DELETE CASCADE
    );
    CREATE INDEX IX_HangDoiEmail_ChoGui ON dbo.HangDoiEmail(trang_thai,thu_lai_luc);
END;
GO
