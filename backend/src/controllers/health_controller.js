export function create_health_controller(service) {
    function get_health(request, response) {
        response.json({ status: 'ok' });
    }

    async function get_readiness(request, response) {
        try {
            response.json(await service.check_readiness());
        } catch {
            response.status(503).json({
                status: 'unavailable',
                message: 'Chưa kết nối được cơ sở dữ liệu.',
            });
        }
    }
    return { get_health, get_readiness };
}
