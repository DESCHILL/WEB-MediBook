import { readFile as read_file, writeFile as write_file } from 'node:fs/promises';
import { randomBytes as random_bytes } from 'node:crypto';

const env_url = new URL('../.env', import.meta.url);
let content;
try { content = await read_file(env_url, 'utf8'); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    content = await read_file(new URL('../.env.example', import.meta.url), 'utf8');
}
if (!/^JWT_SECRET=.+$/m.test(content)) {
    content = content.replace(/^JWT_SECRET=.*\r?\n?/gm, '');
    content += `\nJWT_SECRET=${random_bytes(48).toString('base64url')}\n`;
    await write_file(env_url, content, { mode: 0o600 });
    console.log('Đã tạo JWT_SECRET trong backend/.env. Không đưa file .env lên Git.');
} else {
    console.log('JWT_SECRET đã tồn tại; giữ nguyên cấu hình.');
}
