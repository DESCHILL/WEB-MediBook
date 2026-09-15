import { create_database } from '../src/config/database.js';
import { read_environment } from '../src/config/environment.js';
import { create_schedule_repository } from '../src/repositories/schedule_repository.js';
import { create_schedule_service } from '../src/services/schedule_service.js';
if (process.env.NODE_ENV==='production') throw new Error('Không seed môi trường production.');
const database=create_database(read_environment());
try {
    const pool=await database.get_pool();
    const doctors=(await pool.request().query("SELECT CONVERT(varchar(20),b.bac_si_id) id FROM dbo.BacSi b JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id WHERE a.email LIKE 'catalog_demo[_][0-9][0-9]@example.test' AND a.vai_tro='BAC_SI';")).recordset;
    const service=create_schedule_service(create_schedule_repository(database));
    const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    let created=0;
    for (const doctor of doctors) {
        for (let weekday=2;weekday<=7;weekday++) {
            for (const [start,end] of [['08:00','11:30'],['13:30','17:00']]) {
                try { await service.create(doctor.id,{thu_trong_tuan:weekday,gio_bat_dau:start,gio_ket_thuc:end}); }
                catch(error) { if (error.code!=='SCHEDULE_OVERLAP') throw error; }
            }
        }
        created+=(await service.generate(doctor.id,{ngay_bat_dau:day,so_ngay:14})).created;
    }
    console.log(`Đã tạo ${created} khung giờ demo cho ${doctors.length} bác sĩ giả lập.`);
} finally { await database.close_pool(); }
