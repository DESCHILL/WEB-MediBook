export function create_schedule_controller(service) {
    async function list(request,response) { response.json(await service.list(request.params.doctor_id)); }
    async function create(request,response) { response.status(201).json(await service.create(request.params.doctor_id,request.body)); }
    async function generate(request,response) { response.json(await service.generate(request.params.doctor_id,request.body)); }
    return { list, create, generate };
}
