export function catalog_error(status, code, message) {
    return Object.assign(new Error(message), { status, code });
}

export function create_catalog_service(repository) {
    async function list_specialties() { return repository.list_specialties(); }
    async function list_doctors(query) {
        if (Object.keys(query).some((key) => !['page', 'page_size'].includes(key))) throw catalog_error(400, 'INVALID_FILTER', 'Bộ lọc không hợp lệ.');
        const page = parse_page(query.page, 1, 10000);
        const page_size = parse_page(query.page_size, 12, 24);
        const result = await repository.list_doctors({ offset: (page - 1) * page_size, page_size });
        return { items: result.items.map(public_doctor), total: result.total, page, page_size };
    }
    return { list_specialties, list_doctors };
}

function parse_page(value, fallback, maximum) {
    if (value === undefined) return fallback;
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value) || Number(value) > maximum) throw catalog_error(400, 'INVALID_PAGE', 'Phân trang không hợp lệ.');
    return Number(value);
}

export function public_doctor(row) {
    return { bac_si_id: String(row.bac_si_id), ho_ten: row.ho_ten, chuyen_khoa_id: String(row.chuyen_khoa_id),
        ten_chuyen_khoa: row.ten_chuyen_khoa, anh_dai_dien: row.anh_dai_dien,
        bang_cap: row.bang_cap, kinh_nghiem: row.kinh_nghiem, phi_kham: row.phi_kham,
        dia_chi_kham: row.dia_chi_kham, gioi_thieu: row.gioi_thieu };
}
