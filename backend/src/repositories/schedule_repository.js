export function create_schedule_repository(database) {
    async function list(doctor_id) {
        const pool = await database.get_pool();
        return (await pool.request().input('doctor_id', doctor_id).query(`SELECT CONVERT(varchar(20),lich_lam_viec_id) lich_lam_viec_id,thu_trong_tuan,CONVERT(varchar(5),gio_bat_dau,108) gio_bat_dau,CONVERT(varchar(5),gio_ket_thuc,108) gio_ket_thuc,hoat_dong FROM dbo.LichLamViec WHERE bac_si_id=@doctor_id ORDER BY thu_trong_tuan,gio_bat_dau;`)).recordset;
    }
    async function create(doctor_id, input) {
        const pool = await database.get_pool();
        return (await pool.request().input('doctor_id', doctor_id).input('weekday', input.thu_trong_tuan).input('start', input.gio_bat_dau).input('end', input.gio_ket_thuc).query(`
            SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRANSACTION;
                IF NOT EXISTS(SELECT 1 FROM dbo.BacSi WITH(UPDLOCK,HOLDLOCK) WHERE bac_si_id=@doctor_id) THROW 51003,N'Không tìm thấy bác sĩ.',1;
                IF EXISTS(SELECT 1 FROM dbo.LichLamViec WITH(UPDLOCK,HOLDLOCK) WHERE bac_si_id=@doctor_id AND thu_trong_tuan=@weekday AND hoat_dong=1 AND gio_bat_dau<CAST(@end AS time) AND gio_ket_thuc>CAST(@start AS time)) THROW 51005,N'Lịch làm việc bị chồng lấn.',1;
                INSERT dbo.LichLamViec(bac_si_id,thu_trong_tuan,gio_bat_dau,gio_ket_thuc) VALUES(@doctor_id,@weekday,CAST(@start AS time),CAST(@end AS time));
                DECLARE @id bigint=SCOPE_IDENTITY();
                COMMIT;
                SELECT CONVERT(varchar(20),@id) lich_lam_viec_id;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT>0 ROLLBACK;
                THROW;
            END CATCH;
        `)).recordset[0];
    }
    async function generate(doctor_id, start_day, days) {
        const pool = await database.get_pool();
        return (await pool.request().input('doctor_id', doctor_id).input('start_day', start_day).input('days', days).query(`
            SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRANSACTION;
                IF NOT EXISTS(SELECT 1 FROM dbo.BacSi WITH(UPDLOCK,HOLDLOCK) WHERE bac_si_id=@doctor_id) THROW 51003,N'Không tìm thấy bác sĩ.',1;
                ;WITH dates AS (SELECT CONVERT(date,@start_day,23) day_value,1 n UNION ALL SELECT DATEADD(day,1,day_value),n+1 FROM dates WHERE n<@days),
                minutes AS(SELECT 0 n UNION ALL SELECT n+30 FROM minutes WHERE n<1410),
                slots AS(SELECT l.lich_lam_viec_id,l.bac_si_id,
                    DATEADD(minute,DATEDIFF(minute,CAST('00:00' AS time),l.gio_bat_dau)+m.n,CAST(d.day_value AS datetime2(0))) start_time
                    FROM dates d JOIN dbo.LichLamViec l ON l.bac_si_id=@doctor_id AND l.hoat_dong=1
                        AND l.thu_trong_tuan=((DATEDIFF(day,CONVERT(date,'19000101'),d.day_value)%7+7)%7)+2
                    CROSS JOIN minutes m WHERE m.n+30<=DATEDIFF(minute,l.gio_bat_dau,l.gio_ket_thuc))
                INSERT dbo.KhungGioKham(lich_lam_viec_id,bac_si_id,bat_dau_luc,ket_thuc_luc)
                SELECT s.lich_lam_viec_id,s.bac_si_id,s.start_time,DATEADD(minute,30,s.start_time) FROM slots s
                WHERE s.start_time>CONVERT(datetime2(0),SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time')
                    AND NOT EXISTS(SELECT 1 FROM dbo.KhungGioKham k WITH(UPDLOCK,HOLDLOCK) WHERE k.bac_si_id=s.bac_si_id AND k.bat_dau_luc<DATEADD(minute,30,s.start_time) AND k.ket_thuc_luc>s.start_time)
                OPTION(MAXRECURSION 100);
                DECLARE @created int=@@ROWCOUNT;
                COMMIT;
                SELECT @created created;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT>0 ROLLBACK;
                THROW;
            END CATCH;
        `)).recordset[0];
    }
    return { list, create, generate };
}
