export function create_health_repository(database) {
    async function check_connection() {
        const pool = await database.get_pool();
        await pool.request().query('SELECT 1 AS connected');
    }
    return { check_connection };
}
