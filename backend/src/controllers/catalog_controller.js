export function create_catalog_controller(service) {
    async function list_specialties(request, response) {
        response.json({ items: await service.list_specialties() });
    }
    return { list_specialties };
}
