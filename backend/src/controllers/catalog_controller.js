export function create_catalog_controller(service) {
    async function list_specialties(request, response) {
        response.json({ items: await service.list_specialties() });
    }
    async function list_doctors(request, response) { response.json(await service.list_doctors(request.query)); }
    return { list_specialties, list_doctors };
}
