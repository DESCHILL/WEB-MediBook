export function create_admin_controller(service){
    async function dashboard(req,res){res.json(await service.dashboard());}
    async function appointments(req,res){res.json(await service.appointments());}
    async function doctors(req,res){res.json(await service.doctors());}
    async function specialties(req,res){res.json(await service.specialties());}
    async function cancel(req,res){await service.cancel(req.auth.account.tai_khoan_id,req.params.id);res.status(204).end();}
    async function create_doctor(req,res){res.status(201).json(await service.create_doctor(req.body));}
    async function save_specialty(req,res){res.status(req.params.id?200:201).json(await service.save_specialty(req.params.id||null,req.body));}
    async function delete_specialty(req,res){await service.delete_specialty(req.params.id);res.status(204).end();}
    return {dashboard,appointments,doctors,specialties,cancel,create_doctor,save_specialty,delete_specialty};
}
