import nodemailer from 'nodemailer';
import {render_email} from './email_content_service.js';

export function create_mail_transport(config) {
    if (!config.smtp_host || !config.smtp_user || !config.smtp_password || !config.smtp_from) return null;
    return nodemailer.createTransport({host:config.smtp_host,port:config.smtp_port,secure:config.smtp_secure,
        requireTLS:!config.smtp_secure,auth:{user:config.smtp_user,pass:config.smtp_password},
        connectionTimeout:15000,greetingTimeout:15000,socketTimeout:30000,
        disableFileAccess:true,disableUrlAccess:true,logger:false,debug:false});
}

export function create_email_delivery_service(repository, config, transport = create_mail_transport(config)) {
    let busy = false;
    async function deliver_next() {
        if (!transport || busy) return false;
        busy = true;
        let item;
        try {
            item = await repository.claim();
            if (!item) return false;
            const account = await repository.recipient(item.tai_khoan_id);
            if (!account || !account.hoat_dong || (item.loai==='BOOKING' && !account.email_xac_minh_luc)) throw Object.assign(new Error('Recipient unavailable'),{code:'RECIPIENT_UNAVAILABLE'});
            const content = render_email({...item,...account},config);
            const result = await transport.sendMail({from:{address:config.smtp_from,name:'DoctorSewa'},to:{address:account.email,name:account.ho_ten},...content,messageId:`<medibook-${item.email_id}@${config.smtp_from.split('@')[1]}>`});
            if (!result.accepted?.length || result.rejected?.length) throw Object.assign(new Error('SMTP rejected'),{code:'SMTP_REJECTED'});
            await repository.finish(item);
            return true;
        } catch(error) {
            if (item) await repository.finish(item,/^[A-Z_]{1,40}$/.test(error.code||'')?error.code:'EMAIL_DELIVERY_FAILED');
            else throw error;
            return false;
        } finally { busy = false; }
    }
    function start() {
        if (!transport) {console.warn('Email chưa cấu hình SMTP; thư được giữ trong hàng đợi, chưa gửi ra ngoài.');return ()=>{};}
        async function tick() {try {await deliver_next();} catch {console.error('Không xử lý được hàng đợi email.');}}
        const timer = setInterval(tick,10000);timer.unref();void tick();
        return ()=>{clearInterval(timer);transport.close?.();};
    }
    return {deliver_next,start};
}
