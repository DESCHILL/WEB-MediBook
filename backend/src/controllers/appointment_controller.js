export function create_appointment_controller(service) {
    async function list(request, response) { response.json(await service.list(request.auth.account.tai_khoan_id)); }
    async function slots(request, response) { response.json(await service.slots(request.params.doctor_id, request.query)); }
    async function book(request, response) { response.status(201).json(await service.book(request.auth.account.tai_khoan_id, request.body)); }
    async function cancel(request, response) { await service.cancel(request.auth.account.tai_khoan_id, request.params.appointment_id); response.status(204).end(); }
    return { list, slots, book, cancel };
}
