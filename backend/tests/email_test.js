import {test} from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {create_auth_service} from '../src/services/auth_service.js';
import {create_email_verification_service} from '../src/services/email_verification_service.js';
import {create_email_delivery_service} from '../src/services/email_delivery_service.js';
import {prepare_email_verification,hash_email_token,render_email} from '../src/services/email_content_service.js';
const config={app_origin:'http://127.0.0.1:5173',jwt_secret:'test_only_secret_with_more_than_32_bytes',smtp_from:'sender@example.test'};

test('email chưa xác minh chặn đăng nhập và cả JWT cũ; Admin vẫn truy cập được',async()=>{
    const account={tai_khoan_id:'1',email:'user@example.test',ho_ten:'Test',vai_tro:'BENH_NHAN',hoat_dong:true,email_xac_minh_luc:null,mat_khau_hash:await bcrypt.hash('TestPassword123!',4)};
    let created=false;
    const service=create_auth_service({find_by_email:async()=>account,create_session:async()=>{created=true;},find_session:async()=>account},config);
    await assert.rejects(service.login({email:account.email,mat_khau:'TestPassword123!'}),{status:403,code:'EMAIL_NOT_VERIFIED'});
    const token=jwt.sign({},config.jwt_secret,{subject:'1',jwtid:'a'.repeat(36),issuer:'medibook',audience:'medibook_web',expiresIn:3600});
    await assert.rejects(service.authenticate(token),{status:401});assert.equal(created,false);
    account.vai_tro='BAC_SI';await assert.rejects(service.login({email:account.email,mat_khau:'TestPassword123!'}),{status:403});
    account.vai_tro='ADMIN';await service.login({email:account.email,mat_khau:'TestPassword123!'});assert.equal(created,true);
});

test('liên kết ngẫu nhiên chứa token trong fragment, chỉ hash dùng để tra cứu, mật khẩu bác sĩ được băm',async()=>{
    const prepared=prepare_email_verification(config,'INVITE_DOCTOR');
    const link=new URL(JSON.parse(prepared.payload).link);const token=link.hash.slice(7);
    assert.equal(link.pathname,'/kich_hoat_bac_si');assert.equal(link.search,'');
    assert.equal(hash_email_token(token),prepared.token_hash);assert.notEqual(token,prepared.token_hash);
    let received;
    const service=create_email_verification_service({consume:async(...args)=>{received=args;}},config);
    await service.verify({token,mat_khau:'TestPassword123!'},true);
    assert.equal(received[0],prepared.token_hash);assert.equal(received[1],'INVITE_DOCTOR');
    assert.equal(await bcrypt.compare('TestPassword123!',received[2]),true);
    await assert.rejects(service.verify({token,mat_khau:'tiny'},true),{status:400});
    await assert.rejects(service.verify({token:'wrong'}),{status:400});
    const invalid=create_email_verification_service({consume:async()=>{throw {number:51010};}},config);
    await assert.rejects(invalid.verify({token}),{status:400,code:'INVALID_TOKEN'});
});

test('gửi lại không tiết lộ tài khoản có tồn tại và giữ đúng loại thư bác sĩ',async()=>{
    let pending,prepared;
    const service=create_email_verification_service({find_pending_account:async()=>pending,resend:async(email,data)=>{prepared=data;}},config);
    const unknown=await service.resend({email:'user@example.test'});assert.equal(prepared,undefined);
    pending={vai_tro:'BAC_SI'};const known=await service.resend({email:'user@example.test'});
    assert.deepEqual(unknown,known);assert.equal(prepared.purpose,'INVITE_DOCTOR');
    await assert.rejects(service.resend({email:'user@example.test',vai_tro:'ADMIN'}),{status:400});
});

test('SMTP thất bại giữ thư để thử lại; SMTP chấp nhận mới đánh dấu đã gửi; không cấu hình không gửi giả',async()=>{
    const item={email_id:'12',tai_khoan_id:'1',loai:'VERIFY',du_lieu:prepare_email_verification(config).payload};
    let calls=0;const completions=[];
    const repo={claim:async()=>{calls++;return item;},recipient:async()=>({email:'user@example.test',ho_ten:'Test',hoat_dong:true}),finish:async(row,error)=>completions.push(error??null)};
    await create_email_delivery_service(repo,config,null).deliver_next();assert.equal(calls,0);
    const bad=create_email_delivery_service(repo,config,{sendMail:async()=>{throw Object.assign(new Error('secret SMTP data'),{code:'EAUTH'});}});
    assert.equal(await bad.deliver_next(),false);assert.deepEqual(completions,['EAUTH']);
    let sent;
    const good=create_email_delivery_service(repo,config,{sendMail:async(data)=>{sent=data;return {accepted:['user@example.test'],rejected:[]};}});
    assert.equal(await good.deliver_next(),true);assert.equal(completions[1],null);assert.equal(sent.to.address,'user@example.test');
    assert.doesNotMatch(sent.text,/secret SMTP data/);
    const content=render_email({...item,loai:'BOOKING',ho_ten:'Bệnh nhân',du_lieu:JSON.stringify({lich_hen_id:'42',bac_si:'Bác sĩ A',chuyen_khoa:'Đa khoa',bat_dau_luc:'2026-09-20T08:00:00+07:00',dia_chi:'Phòng khám'})},config);
    assert.match(content.text,/42/);assert.match(content.text,/30 phút/);assert.match(content.text,/08:00/);
});
