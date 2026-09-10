import { parse_resource_id } from './resource_id_service.js';
import { auth_error } from './auth_service.js';
function invalid() { return auth_error(400, 'INVALID_SCHEDULE', 'Lịch làm việc cần thứ 2–8, giờ HH:mm theo bước 30 phút; ngày bắt đầu hợp lệ và số ngày từ 1–31.'); }
export function create_schedule_service(repository) {
    async function handle_database(action) {
        try { return await action(); } catch (error) {
            if ([51005,2601,2627].includes(error.number)) throw auth_error(409, 'SCHEDULE_OVERLAP', 'Lịch làm việc đã có hoặc bị chồng lấn.');
            if (error.number === 51003) throw auth_error(404, 'DOCTOR_NOT_FOUND', 'Không tìm thấy bác sĩ.');
            throw error;
        }
    }
    async function list(id) { return { items: await repository.list(parse_resource_id(id)) }; }
    async function create(id, body) {
        parse_resource_id(id);
        if (!body || Array.isArray(body) || Object.keys(body).some((key) => !['thu_trong_tuan','gio_bat_dau','gio_ket_thuc'].includes(key)) || !Number.isInteger(body.thu_trong_tuan) || body.thu_trong_tuan<2 || body.thu_trong_tuan>8 || !/^([01]\d|2[0-3]):(00|30)$/.test(body.gio_bat_dau) || !/^([01]\d|2[0-3]):(00|30)$/.test(body.gio_ket_thuc) || body.gio_ket_thuc<=body.gio_bat_dau) throw invalid();
        return handle_database(() => repository.create(id, body));
    }
    async function generate(id, body) {
        parse_resource_id(id);
        if (!body || Array.isArray(body) || Object.keys(body).some((key) => !['ngay_bat_dau','so_ngay'].includes(key)) || typeof body.ngay_bat_dau !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.ngay_bat_dau) || !Number.isFinite(Date.parse(body.ngay_bat_dau)) || new Date(body.ngay_bat_dau).toISOString().slice(0,10)!==body.ngay_bat_dau || !Number.isInteger(body.so_ngay) || body.so_ngay<1 || body.so_ngay>31) throw invalid();
        return handle_database(() => repository.generate(id, body.ngay_bat_dau, body.so_ngay));
    }
    return { list, create, generate };
}
