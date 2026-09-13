import express,{Router as create_router} from 'express';
import {mkdir,writeFile as write_file} from 'node:fs/promises';
import {fileURLToPath as file_url_to_path} from 'node:url';
import {randomUUID as random_uuid} from 'node:crypto';
import {join} from 'node:path';
import {create_auth_middleware,require_roles} from '../middleware/auth_middleware.js';
import {auth_error} from '../services/auth_service.js';
export const upload_directory=file_url_to_path(new URL('../../uploads/',import.meta.url));
export function create_upload_routes(auth_service,config){
    const router=create_router();
    router.post('/',create_auth_middleware(auth_service),require_roles('ADMIN'),(req,res,next)=>{
        if(req.get('origin')&&req.get('origin')!==config.app_origin||req.get('sec-fetch-site')==='cross-site')throw auth_error(403,'ORIGIN_NOT_ALLOWED','Nguồn yêu cầu không hợp lệ.');
        next();
    },express.raw({type:['image/png','image/jpeg'],limit:'2mb'}),async function upload_image(req,res){
        if(!Buffer.isBuffer(req.body)||req.body.length<12)throw auth_error(400,'INVALID_IMAGE','Chọn ảnh PNG hoặc JPEG hợp lệ.');
        const png=req.body.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
        const jpg=req.body[0]===255&&req.body[1]===216&&req.body[2]===255;
        if(!(png&&req.is('image/png')||jpg&&req.is('image/jpeg')))throw auth_error(400,'INVALID_IMAGE','Định dạng ảnh không hợp lệ.');
        await mkdir(upload_directory,{recursive:true});const name=`${random_uuid()}.${png?'png':'jpg'}`;
        await write_file(join(upload_directory,name),req.body,{flag:'wx'});
        res.status(201).json({url:`/uploads/${name}`});
    });
    return router;
}
