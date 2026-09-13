import {useState as use_state} from 'react';
export default function image_upload({value,on_change}){
    const [error,set_error]=use_state('');const [pending,set_pending]=use_state(false);
    async function upload_image(event){
        const file=event.target.files[0];if(!file)return;set_error('');
        if(!['image/png','image/jpeg'].includes(file.type)||file.size>2*1024*1024){set_error('Chọn ảnh PNG/JPEG tối đa 2 MB.');return;}
        set_pending(true);
        try{const response=await fetch('/api/uploads',{method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type},body:file});const data=await response.json();if(!response.ok)throw new Error(data.message);on_change(data.url);}catch(failure){set_error(failure.message);}finally{set_pending(false);}
    }
    return <div className="image_upload">{value&&<img src={value} alt="Ảnh đã chọn"/>}<label>Ảnh đại diện<input type="file" accept="image/png,image/jpeg" disabled={pending} onChange={upload_image}/></label>{pending&&<p role="status">Đang tải ảnh…</p>}{error&&<p role="alert" className="form_error">{error}</p>}</div>;
}
