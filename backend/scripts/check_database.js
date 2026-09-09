import { read_environment } from '../src/config/environment.js';
import { create_database } from '../src/config/database.js';

const database = create_database(read_environment());
try {
    const pool = await database.get_pool();
    const result = await pool.request().query(`
        SELECT name FROM sys.tables
        WHERE schema_id = SCHEMA_ID('dbo') AND is_ms_shipped = 0
        ORDER BY name
    `);
    const expected = ['BacSi', 'BenhNhan', 'ChuyenKhoa', 'KetQuaKham', 'KhungGioKham', 'LichHen', 'LichLamViec', 'TaiKhoan'];
    const actual = result.recordset.map((row) => row.name);
    const missing = expected.filter((name) => !actual.includes(name));
    if (missing.length) throw new Error(`Thiếu bảng: ${missing.join(', ')}`);
    console.log(`Kết nối SQL Server thành công; có đủ ${expected.length} bảng nghiệp vụ.`);
    console.log(actual.join(', '));
} catch (error) {
    console.error(`Kiểm tra database thất bại: ${error.message}`);
    process.exitCode = 1;
} finally {
    await database.close_pool().catch(() => {});
}
