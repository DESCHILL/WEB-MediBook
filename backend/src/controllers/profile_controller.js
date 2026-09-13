export function create_profile_controller(service) {
    async function get(request,response) { response.json(await service.get(request.auth.account.tai_khoan_id)); }
    async function update(request,response) { response.json(await service.update(request.auth.account.tai_khoan_id,request.body)); }
    return {get,update};
}
