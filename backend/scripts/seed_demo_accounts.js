import {mkdir,readFile as read_file,writeFile as write_file} from 'node:fs/promises';
import {fileURLToPath as file_url_to_path} from 'node:url';
import {randomBytes as random_bytes} from 'node:crypto';
import bcrypt from 'bcrypt';
import {create_database} from '../src/config/database.js';
import {read_environment} from '../src/config/environment.js';
import {create_schedule_repository} from '../src/repositories/schedule_repository.js';
import {create_schedule_service} from '../src/services/schedule_service.js';
if(process.env.NODE_ENV==='production')throw new Error('Không seed production.');
const directory=file_url_to_path(new URL('../../local_data/',import.meta.url));
const file=file_url_to_path(new URL('../../local_data/demo_accounts.json',import.meta.url));
await mkdir(directory,{recursive:true});
let accounts;
try{accounts=JSON.parse(await read_file(file,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;accounts=['ADMIN','BENH_NHAN','BAC_SI'].map((role)=>({vai_tro:role,email:`demo_${role.toLowerCase()}@example.test`,mat_khau:random_bytes(18).toString('base64url')}));await write_file(file,JSON.stringify(accounts,null,2),{flag:'wx'});}
const database=create_database(read_environment());
try{
    const pool=await database.get_pool();
    for(const account of accounts){
        const hash=await bcrypt.hash(account.mat_khau,12);
        await pool.request().input('email',account.email).input('hash',hash).input('role',account.vai_tro).query(`
            SET XACT_ABORT ON;
            BEGIN TRY
                BEGIN TRANSACTION;
                IF NOT EXISTS(SELECT 1 FROM dbo.TaiKhoan WITH(UPDLOCK,HOLDLOCK) WHERE email=@email)
                BEGIN
                    INSERT dbo.TaiKhoan(email,mat_khau_hash,ho_ten,vai_tro) VALUES(@email,@hash,N'Tài khoản demo '+@role,@role);
                    DECLARE @id bigint=SCOPE_IDENTITY();
                    IF @role='BENH_NHAN' INSERT dbo.BenhNhan(tai_khoan_id) VALUES(@id);
                    IF @role='BAC_SI'
                    BEGIN
                        DECLARE @specialty bigint=(SELECT TOP 1 chuyen_khoa_id FROM dbo.ChuyenKhoa ORDER BY chuyen_khoa_id);
                        IF @specialty IS NULL THROW 51003,N'Chạy seed catalog trước.',1;
                        INSERT dbo.BacSi(tai_khoan_id,chuyen_khoa_id,phi_kham,gioi_thieu,dia_chi_kham) VALUES(@id,@specialty,150000,N'Bác sĩ giả lập phục vụ demo đồ án.',N'Phòng khám minh họa');
                    END
                END
                COMMIT;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT>0 ROLLBACK;
                THROW;
            END CATCH;
        `);
    }
    const doctor=(await pool.request().query("SELECT CONVERT(varchar(20),b.bac_si_id) id FROM dbo.BacSi b JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id WHERE a.email='demo_bac_si@example.test';")).recordset[0];
    const schedule=create_schedule_service(create_schedule_repository(database));
    for(let day=2;day<=8;day++){try{await schedule.create(doctor.id,{thu_trong_tuan:day,gio_bat_dau:'08:00',gio_ket_thuc:'17:00'});}catch(error){if(error.code!=='SCHEDULE_OVERLAP')throw error;}}
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    await schedule.generate(doctor.id,{ngay_bat_dau:today,so_ngay:14});
    console.log('Đã chuẩn bị ba vai trò demo. Thông tin đăng nhập chỉ lưu trong local_data/demo_accounts.json, được Git bỏ qua.');
}finally{await database.close_pool();}
