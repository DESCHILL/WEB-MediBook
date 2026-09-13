import { defineConfig as define_config } from 'vite';
import react from '@vitejs/plugin-react';

export default define_config({
    plugins: [react()],
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        proxy: { '/api': 'http://127.0.0.1:3000', '/uploads': 'http://127.0.0.1:3000' },
    },
});
