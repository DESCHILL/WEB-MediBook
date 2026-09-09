function escape_odbc_value(value) {
    return `{${String(value).replaceAll('}', '}}')}}`;
}

export function create_database(config) {
    let pool_promise;

    async function get_pool() {
        if (!pool_promise) {
            pool_promise = connect_pool().catch((error) => {
                pool_promise = undefined;
                throw error;
            });
        }
        return pool_promise;
    }

    async function connect_pool() {
        const driver_name = 'mssql/msnodesqlv8.js';
        const { default: sql } = await import(driver_name);
        let options;
        if (config.db_auth === 'windows') {
            const connection_string = [
                `Driver=${escape_odbc_value(config.db_driver)}`,
                `Server=${escape_odbc_value(config.db_server)}`,
                `Database=${escape_odbc_value(config.db_database)}`,
                'Trusted_Connection=Yes',
                `Encrypt=${config.db_encrypt ? 'Yes' : 'No'}`,
                `TrustServerCertificate=${config.db_trust_certificate ? 'Yes' : 'No'}`,
            ].join(';');
            options = { connectionString: connection_string };
        } else {
            const connection_string = [
                `Driver=${escape_odbc_value(config.db_driver)}`,
                `Server=${escape_odbc_value(config.db_server)}`,
                `Database=${escape_odbc_value(config.db_database)}`,
                `UID=${escape_odbc_value(config.db_user)}`,
                `PWD=${escape_odbc_value(config.db_password)}`,
                `Encrypt=${config.db_encrypt ? 'Yes' : 'No'}`,
                `TrustServerCertificate=${config.db_trust_certificate ? 'Yes' : 'No'}`,
            ].join(';');
            options = { connectionString: connection_string };
        }
        const pool = new sql.ConnectionPool({
            ...options,
            connectionTimeout: 10000,
            requestTimeout: 10000,
            pool: { min: 0, max: 5, idleTimeoutMillis: 30000 },
        });
        pool.on('error', () => console.error('Kết nối SQL Server gặp lỗi.'));
        try {
            return await pool.connect();
        } catch (error) {
            await pool.close().catch(() => {});
            throw error;
        }
    }

    async function close_pool() {
        const pending = pool_promise;
        pool_promise = undefined;
        if (pending) await (await pending).close();
    }

    return { get_pool, close_pool };
}
