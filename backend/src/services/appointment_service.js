import { auth_error } from './auth_service.js';
import {parse_resource_id} from './resource_id_service.js';
function translate_database_error(error) {
    const number = error.number ?? error.originalError?.info?.number;
    if ([51002, 2601, 2627].includes(number)) throw auth_error(409, 'SLOT_UNAVAILABLE', 'Khung giờ vừa được đặt hoặc không còn khả dụng. Vui lòng chọn lại.');
    if ([51001, 51003].includes(number)) throw auth_error(404, 'NOT_FOUND', 'Không tìm thấy dữ liệu thuộc tài khoản của bạn.');
    if (number === 51004) throw auth_error(409, 'CANNOT_CANCEL', 'Chỉ có thể hủy lịch Đã đặt trước giờ bắt đầu.');
    throw error;
}
export function create_appointment_service(repository) {
    async function list(account_id) { return { items: await repository.list_patient_appointments(account_id) }; }
    async function slots(doctor_id, query) {
        parse_resource_id(doctor_id);
        const day = query.ngay;
        if (Object.keys(query).some((key) => key !== 'ngay') || typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)
            || !Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day)
            throw auth_error(400, 'INVALID_DATE', 'Ngày khám phải hợp lệ và có định dạng YYYY-MM-DD.');
        return { items: await repository.list_available_slots(doctor_id, day) };
    }
    async function book(account_id, body) {
        if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some((key) => key !== 'khung_gio_id'))
            throw auth_error(400, 'INVALID_BODY', 'Chỉ gửi mã khung giờ cần đặt.');
        const slot_id = parse_resource_id(body.khung_gio_id);
        try { return await repository.book_appointment(account_id, slot_id); } catch (error) { translate_database_error(error); }
    }
    async function cancel(account_id, id) {
        parse_resource_id(id);
        try { await repository.cancel_appointment(account_id, id); } catch (error) { translate_database_error(error); }
    }
    return { list, slots, book, cancel };
}
