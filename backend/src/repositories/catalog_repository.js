export function create_catalog_repository(database) {
    async function list_specialties() {
        const pool = await database.get_pool();
        const result = await pool.request().query(`
            SELECT CONVERT(varchar(20),chuyen_khoa_id) AS chuyen_khoa_id,
                ten_chuyen_khoa,mo_ta,anh_dai_dien
            FROM dbo.ChuyenKhoa ORDER BY chuyen_khoa_id;
        `);
        return result.recordset;
    }
    async function specialty_exists(specialty_id) {
        const pool = await database.get_pool();
        const result = await pool.request().input('specialty_id', specialty_id).query('SELECT chuyen_khoa_id FROM dbo.ChuyenKhoa WHERE chuyen_khoa_id=@specialty_id;');
        return result.recordset.length > 0;
    }
    async function list_doctors({ offset, page_size, specialty_id }) {
        const pool = await database.get_pool();
        const result = await pool.request().input('offset', offset).input('page_size', page_size).input('specialty_id', specialty_id).query(`
            SELECT COUNT(*) AS total FROM dbo.BacSi b JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id
            WHERE a.hoat_dong=1 AND a.vai_tro='BAC_SI' AND (@specialty_id IS NULL OR b.chuyen_khoa_id=@specialty_id);
            SELECT ${doctor_columns} FROM dbo.BacSi b
            JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id
            JOIN dbo.ChuyenKhoa c ON c.chuyen_khoa_id=b.chuyen_khoa_id
            WHERE a.hoat_dong=1 AND a.vai_tro='BAC_SI' AND (@specialty_id IS NULL OR b.chuyen_khoa_id=@specialty_id)
            ORDER BY b.bac_si_id OFFSET @offset ROWS FETCH NEXT @page_size ROWS ONLY;
        `);
        return { total: result.recordsets[0][0].total, items: result.recordsets[1] };
    }
    async function get_doctor(id) {
        const pool = await database.get_pool();
        const result = await pool.request().input('doctor_id', id).query(`
            SELECT ${doctor_columns} FROM dbo.BacSi b
            JOIN dbo.TaiKhoan a ON a.tai_khoan_id=b.tai_khoan_id
            JOIN dbo.ChuyenKhoa c ON c.chuyen_khoa_id=b.chuyen_khoa_id
            WHERE b.bac_si_id=@doctor_id AND a.hoat_dong=1 AND a.vai_tro='BAC_SI';
        `);
        return result.recordset[0];
    }
    return { list_specialties, list_doctors, specialty_exists, get_doctor };
}

const doctor_columns = `CONVERT(varchar(20),b.bac_si_id) AS bac_si_id,a.ho_ten,
    CONVERT(varchar(20),b.chuyen_khoa_id) AS chuyen_khoa_id,c.ten_chuyen_khoa,
    b.anh_dai_dien,b.bang_cap,b.kinh_nghiem,b.gioi_thieu,b.dia_chi_kham,b.phi_kham`;
