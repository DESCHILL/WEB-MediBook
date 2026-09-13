export function create_catalog_controller(service) {
    async function list_specialties(request, response) {
        response.json({ items: await service.list_specialties() });
    }
    async function list_doctors(request, response) { response.json(await service.list_doctors(request.query)); }
    async function get_doctor(request, response) { response.json({ doctor: await service.get_doctor(request.params.doctor_id) }); }
    return { list_specialties, list_doctors, get_doctor };
}
