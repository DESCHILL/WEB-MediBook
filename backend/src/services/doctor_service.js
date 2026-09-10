import {auth_error} from './auth_service.js';
import {parse_resource_id} from './appointment_service.js';
export function create_doctor_service(repository) {
    async function list(id) {return {items:await repository.list(id)};}
    async function save_result(account_id,id,body) {
        parse_resource_id(id);
        if (!body || typeof body.noi_dung!=='string' || Object.keys(body).some((key)=>key!=='noi_dung') || !body.noi_dung.trim() || body.noi_dung.trim().length>4000) throw auth_error(400,'INVALID_RESULT','Kết quả khám cần từ 1 đến 4000 ký tự.');
        try {await repository.save_result(account_id,id,body.noi_dung.trim());} catch(error) {
            if(error.number===51003) throw auth_error(404,'NOT_FOUND','Không tìm thấy lịch hẹn do bạn phụ trách.');
            if(error.number===51006) throw auth_error(409,'CANNOT_SAVE_RESULT','Chỉ ghi kết quả cho lịch Đã đặt đã đến giờ khám.');
            throw error;
        }
    }
    return {list,save_result};
}
