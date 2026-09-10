import {auth_error} from './auth_service.js';
export function parse_resource_id(value) {
    if(typeof value!=='string'||!/^[1-9]\d{0,18}$/.test(value)||BigInt(value)>9223372036854775807n)
        throw auth_error(400,'INVALID_ID','Mã dữ liệu không hợp lệ.');
    return value;
}
