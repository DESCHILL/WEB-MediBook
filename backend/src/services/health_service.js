export function create_health_service(repository) {
    async function check_readiness() {
        await repository.check_connection();
        return { status: 'ok', database: 'connected' };
    }
    return { check_readiness };
}
