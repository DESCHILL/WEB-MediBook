import { auth_error } from './auth_service.js';
export function create_profile_service(repository) {
    async function get(id) {
        const profile=await repository.get(id);
        if (!profile) throw auth_error(404,'PROFILE_NOT_FOUND','Không tìm thấy hồ sơ bệnh nhân.');
        return {profile};
    }
    async function update(id,body) {
        const keys=['ho_ten','so_dien_thoai','ngay_sinh','gioi_tinh','dia_chi'];
        if (!body || Array.isArray(body) || Object.keys(body).some((key)=>!keys.includes(key))) throw auth_error(400,'INVALID_PROFILE','Chỉ gửi thông tin hồ sơ được phép sửa.');
        const data=Object.fromEntries(keys.map((key)=>[key,typeof body[key]==='string'?body[key].trim():'']));
        const fields={};
        if (data.ho_ten.length<2 || data.ho_ten.length>150 || /[\x00-\x1f]/.test(data.ho_ten)) fields.ho_ten='Họ tên cần từ 2–150 ký tự.';
        if (data.so_dien_thoai && !/^\+?[0-9 ()-]{8,20}$/.test(data.so_dien_thoai)) fields.so_dien_thoai='Số điện thoại không hợp lệ.';
        if (data.dia_chi.length>500) fields.dia_chi='Địa chỉ không quá 500 ký tự.';
        if (data.gioi_tinh && !['Nam','Nữ','Khác'].includes(data.gioi_tinh)) fields.gioi_tinh='Giới tính không hợp lệ.';
        const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
        if (data.ngay_sinh && (!/^\d{4}-\d{2}-\d{2}$/.test(data.ngay_sinh) || !Number.isFinite(Date.parse(data.ngay_sinh)) || new Date(data.ngay_sinh).toISOString().slice(0,10)!==data.ngay_sinh || data.ngay_sinh>today || data.ngay_sinh<'1900-01-01')) fields.ngay_sinh='Ngày sinh phải hợp lệ, từ năm 1900 và không ở tương lai.';
        if (Object.keys(fields).length) throw auth_error(400,'INVALID_PROFILE','Vui lòng kiểm tra thông tin.',fields);
        await get(id);
        return {profile:await repository.update(id,data)};
    }
    return {get,update};
}
