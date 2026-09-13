import { randomBytes as random_bytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import sql from 'mssql/msnodesqlv8.js';
import { create_database } from '../src/config/database.js';
import { read_environment } from '../src/config/environment.js';

if (process.env.NODE_ENV === 'production') throw new Error('Seed chỉ dùng cho database phát triển.');
const database = create_database(read_environment());
const specialties = ['Đa khoa', 'Phụ khoa', 'Da liễu', 'Nhi khoa', 'Thần kinh', 'Tiêu hóa'];
const names = ['Nguyễn Minh An', 'Trần Ngọc Mai', 'Lê Hoàng Nam', 'Phạm Thanh Hà', 'Đỗ Minh Khang', 'Vũ Thu Trang', 'Bùi Quốc Huy', 'Ngô Bảo Ngọc', 'Đặng Anh Tuấn', 'Hoàng Thùy Linh', 'Nguyễn Đức Minh', 'Trần Khánh Vy'];
let transaction;
try {
    const pool = await database.get_pool();
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const password_hash = await bcrypt.hash(random_bytes(32).toString('hex'), 12);
    for (let index = 0; index < names.length; index++) {
        const request = new sql.Request(transaction);
        await request.input('specialty', specialties[index % 6]).input('name', names[index])
            .input('email', `catalog_demo_${String(index + 1).padStart(2, '0')}@example.test`).input('hash', password_hash)
            .input('experience', `${3 + index} năm kinh nghiệm`).input('fee', 150000 + (index % 4) * 50000)
            .input('bio', 'Hồ sơ minh họa phục vụ trình bày đồ án. Thông tin bác sĩ, kinh nghiệm và địa chỉ trong hồ sơ này là dữ liệu giả lập.')
            .query(`
                IF NOT EXISTS (SELECT 1 FROM dbo.ChuyenKhoa WHERE ten_chuyen_khoa=@specialty)
                    INSERT dbo.ChuyenKhoa(ten_chuyen_khoa,mo_ta) VALUES(@specialty,N'Danh mục chuyên khoa phục vụ tra cứu bác sĩ.');
                IF NOT EXISTS (SELECT 1 FROM dbo.TaiKhoan WHERE email=@email)
                BEGIN
                    INSERT dbo.TaiKhoan(email,mat_khau_hash,ho_ten,vai_tro) VALUES(@email,@hash,@name,'BAC_SI');
                    DECLARE @account_id bigint=SCOPE_IDENTITY();
                    INSERT dbo.BacSi(tai_khoan_id,chuyen_khoa_id,bang_cap,kinh_nghiem,gioi_thieu,dia_chi_kham,phi_kham)
                    SELECT @account_id,chuyen_khoa_id,N'Bác sĩ chuyên khoa',@experience,@bio,N'Phòng khám minh họa MediBook',@fee
                    FROM dbo.ChuyenKhoa WHERE ten_chuyen_khoa=@specialty;
                END;
            `);
    }
    await transaction.commit(); transaction = undefined;
    console.log('Đã chuẩn bị 6 chuyên khoa và 12 hồ sơ bác sĩ minh họa; không sửa tài khoản có sẵn. Mật khẩu ngẫu nhiên không được lưu hay xuất ra.');
} catch (error) {
    if (transaction) await transaction.rollback().catch(() => {});
    console.error('Không thể tạo dữ liệu minh họa; transaction đã được hủy.');
    process.exitCode = 1;
} finally { await database.close_pool(); }
