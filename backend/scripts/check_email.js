import {read_environment} from '../src/config/environment.js';
import {create_mail_transport} from '../src/services/email_delivery_service.js';
const config=read_environment();
const transport=create_mail_transport(config);
if(!transport){console.error('Chưa đủ SMTP_USER, SMTP_PASSWORD, SMTP_FROM trong backend/.env. Chưa thể gửi email thật.');process.exitCode=1;}
else {
    try{await transport.verify();console.log('Gmail/SMTP đã kết nối và xác thực thành công. Chưa gửi email thử.');}
    catch(error){console.error(`Không kết nối được SMTP (${error.code||'UNKNOWN'}). Kiểm tra Gmail và Mật khẩu ứng dụng.`);process.exitCode=1;}
    finally{transport.close?.();}
}
