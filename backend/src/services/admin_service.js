import bcrypt from 'bcrypt';
import {randomBytes as random_bytes} from 'node:crypto';
import {prepare_email_verification} from './email_content_service.js';
import {auth_error} from './auth_service.js';
import {parse_resource_id} from './resource_id_service.js';
function invalid(message,fields) {return auth_error(400,'INVALID_INPUT',message,fields);}
export function create_admin_service(repository, config = {}) {
    async function run(action) {
        try{return await action();}catch(error){
            if([2601,2627].includes(error.number))throw auth_error(409,'DUPLICATE','Email hoặc tên chuyên khoa đã tồn tại.');
            if(error.number===547)throw auth_error(409,'REFERENCE_CONFLICT','Chuyên khoa không tồn tại hoặc đang được bác sĩ sử dụng.');
            if(error.number===51003)throw auth_error(404,'NOT_FOUND','Không tìm thấy dữ liệu.');
            if(error.number===51004)throw auth_error(409,'CANNOT_CANCEL','Chỉ hủy lịch Đã đặt trước giờ bắt đầu.');
            if(error.number===51007)throw auth_error(403,'FORBIDDEN','Không có quyền quản trị.');
            throw error;
        }
    }
    async function dashboard(){return repository.dashboard();}
    async function appointments(){return {items:await repository.appointments()};}
    async function doctors(){return {items:await repository.doctors()};}
    async function specialties(){return {items:await repository.specialties()};}
    async function cancel(account_id,id){parse_resource_id(id);await run(()=>repository.cancel(account_id,id));}
    async function create_doctor(body){
        const keys=['ho_ten','email','chuyen_khoa_id','bang_cap','kinh_nghiem','gioi_thieu','dia_chi_kham','anh_dai_dien','phi_kham'];
        if(!body||Array.isArray(body)||Object.keys(body).some((key)=>!keys.includes(key)))throw invalid('Dữ liệu bác sĩ không hợp lệ.');
        const fields={};
        const limits={ho_ten:150,email:254,bang_cap:250,kinh_nghiem:500,gioi_thieu:4000,dia_chi_kham:500,anh_dai_dien:1000};
        const data={};
        for(const [key,max]of Object.entries(limits)){data[key]=typeof body[key]==='string'?body[key].trim():'';if(data[key].length>max)fields[key]=`Không quá ${max} ký tự.`;}
        data.email=data.email.toLowerCase();
        if(data.ho_ten.length<2)fields.ho_ten='Vui lòng nhập họ tên.';
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))fields.email='Email không hợp lệ.';
        if(data.anh_dai_dien&&!/^\/uploads\/[a-f0-9-]+\.(png|jpg)$/.test(data.anh_dai_dien))fields.anh_dai_dien='Vui lòng tải ảnh bằng biểu mẫu.';
        data.phi_kham=Number(body.phi_kham);
        if(!Number.isFinite(data.phi_kham)||data.phi_kham<0||data.phi_kham>9999999999.99)fields.phi_kham='Phí khám không hợp lệ.';
        if(Object.keys(fields).length)throw invalid('Vui lòng kiểm tra thông tin bác sĩ.',fields);
        data.chuyen_khoa_id=parse_resource_id(body.chuyen_khoa_id);
        data.mat_khau_hash=await bcrypt.hash(random_bytes(32).toString('hex'),12);
        data.verification=prepare_email_verification(config,'INVITE_DOCTOR');
        return run(()=>repository.create_doctor(data));
    }
    async function save_specialty(id,body){
        if(id)parse_resource_id(id);
        if(!body||Array.isArray(body)||Object.keys(body).some((key)=>!['ten_chuyen_khoa','mo_ta','anh_dai_dien'].includes(key)))throw invalid('Dữ liệu chuyên khoa không hợp lệ.');
        const data={ten_chuyen_khoa:typeof body.ten_chuyen_khoa==='string'?body.ten_chuyen_khoa.trim():'',mo_ta:typeof body.mo_ta==='string'?body.mo_ta.trim():'',anh_dai_dien:typeof body.anh_dai_dien==='string'?body.anh_dai_dien:''};
        if(!data.ten_chuyen_khoa||data.ten_chuyen_khoa.length>150||data.mo_ta.length>2000||data.anh_dai_dien.length>1000||data.anh_dai_dien&&!/^\/uploads\/[a-f0-9-]+\.(png|jpg)$/.test(data.anh_dai_dien))throw invalid('Tên chuyên khoa tối đa 150 ký tự, mô tả tối đa 2000 ký tự; ảnh tải từ biểu mẫu.');
        const result=await run(()=>repository.save_specialty(id,data));if(!result)throw auth_error(404,'NOT_FOUND','Không tìm thấy chuyên khoa.');return result;
    }
    async function delete_specialty(id){parse_resource_id(id);if(!await run(()=>repository.delete_specialty(id)))throw auth_error(404,'NOT_FOUND','Không tìm thấy chuyên khoa.');}
    return {dashboard,appointments,doctors,specialties,cancel,create_doctor,save_specialty,delete_specialty};
}
