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
    return { list_specialties };
}
