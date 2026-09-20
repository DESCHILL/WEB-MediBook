export function create_doctor_controller(service) {
    async function list(request,response) {response.json(await service.list(request.auth.account.tai_khoan_id));}
    async function save_result(request,response) {await service.save_result(request.auth.account.tai_khoan_id,request.params.id,request.body);response.status(204).end();}
    return {list,save_result};
}
