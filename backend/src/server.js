import { create_app } from './app.js';
import { read_environment } from './config/environment.js';
import { create_database } from './config/database.js';

const config = read_environment();
const database = create_database(config);
const app = create_app(database);
const server = app.listen(config.port, config.host, () => {
    console.log(`MediBook API: http://${config.host}:${config.port}/api/health`);
});
server.on('error', (error) => {
    console.error(`Không mở được API (${error.code ?? 'UNKNOWN'}).`);
    process.exitCode = 1;
});

let stopping = false;
function shutdown() {
    if (stopping) return;
    stopping = true;
    const timeout = setTimeout(() => process.exit(1), 12000);
    timeout.unref();
    server.close(async () => {
        try {
            await database.close_pool();
        } catch {
            process.exitCode = 1;
        } finally {
            clearTimeout(timeout);
        }
    });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
