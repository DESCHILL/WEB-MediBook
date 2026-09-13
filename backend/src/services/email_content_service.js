import {randomBytes as random_bytes, createHash as create_hash} from 'node:crypto';

export function hash_email_token(token) {
    return create_hash('sha256').update(token).digest('hex');
}

export function prepare_email_verification(config = {}, purpose = 'VERIFY') {
    const token = random_bytes(32).toString('hex');
    const path = purpose === 'INVITE_DOCTOR' ? '/kich_hoat_bac_si' : '/xac_minh_email';
    const link = `${config.app_origin || 'http://127.0.0.1:5173'}${path}#token=${token}`;
    return {token_hash: hash_email_token(token), purpose, payload: JSON.stringify({link})};
}

export function render_email(item, config) {
    const data = JSON.parse(item.du_lieu);
    if (item.loai === 'BOOKING') {
        const time = new Intl.DateTimeFormat('vi-VN', {dateStyle:'full',timeStyle:'short',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(data.bat_dau_luc));
        return {subject:'DoctorSewa — Xác nhận đặt lịch khám',text:`Xin chào ${item.ho_ten},\n\nBạn đã đặt lịch khám thành công.\nMã lịch hẹn: ${data.lich_hen_id}\nBác sĩ: ${data.bac_si}\nChuyên khoa: ${data.chuyen_khoa}\nThời gian: ${time} (giờ Việt Nam)\nThời lượng: 30 phút\nĐịa chỉ: ${data.dia_chi || 'Vui lòng liên hệ phòng khám'}\n\nXem trạng thái hiện tại: ${config.app_origin}/lich_hen\nDoctorSewa`};
    }
    const doctor = item.loai === 'INVITE_DOCTOR';
    return {
        subject: doctor ? 'DoctorSewa — Kích hoạt tài khoản bác sĩ' : 'DoctorSewa — Xác minh địa chỉ email',
        text:`Xin chào ${item.ho_ten},\n\n${doctor ? 'Admin đã tạo tài khoản bác sĩ cho bạn.' : 'Vui lòng xác minh email để sử dụng tài khoản.'}\nEmail đăng nhập: ${item.email}\n${doctor ? 'Mở liên kết sau để xác minh email và tự đặt mật khẩu:' : 'Mở liên kết sau và bấm Xác minh email:'}\n${data.link}\n\nLiên kết có hiệu lực 24 giờ và chỉ dùng một lần.\nTrang đăng nhập: ${config.app_origin}/dang_nhap\nNếu liên kết hết hạn, chọn Gửi lại email xác minh tại trang đăng nhập.\nNếu bạn không yêu cầu thao tác này, hãy bỏ qua email.\nDoctorSewa`
    };
}
