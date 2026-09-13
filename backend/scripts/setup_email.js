import {readFile as read_file,writeFile as write_file} from 'node:fs/promises';
const file=new URL('../.env',import.meta.url);
let content=await read_file(file,'utf8');
const defaults={SMTP_HOST:'smtp.gmail.com',SMTP_PORT:'465',SMTP_SECURE:'true',SMTP_USER:'',SMTP_PASSWORD:'',SMTP_FROM:''};
for(const [key,value] of Object.entries(defaults))if(!new RegExp(`^${key}=`, 'm').test(content))content+=`\n${key}=${value}`;
await write_file(file,content+'\n',{mode:0o600});
console.log('Đã bổ sung các khóa SMTP còn thiếu, giữ nguyên cấu hình hiện có. Nhập SMTP_USER, SMTP_PASSWORD và SMTP_FROM trực tiếp trong backend/.env.');
