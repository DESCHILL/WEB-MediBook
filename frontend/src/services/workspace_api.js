export async function send_workspace_request(path,body={},method='POST'){
    const response=await fetch(`/api/${path}`,{method,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(response.status===204)return;
    const data=await response.json();
    if(!response.ok)throw Object.assign(new Error(data.message||'Không thể xử lý yêu cầu.'),{fields:data.fields,status:response.status});
    return data;
}
