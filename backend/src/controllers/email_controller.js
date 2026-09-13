export function create_email_controller(service) {
    async function resend(req,res) {res.status(202).json(await service.resend(req.body));}
    async function verify(req,res) {res.json(await service.verify(req.body));}
    async function activate_doctor(req,res) {res.json(await service.verify(req.body,true));}
    return {resend,verify,activate_doctor};
}
