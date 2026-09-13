export async function send_auth_request(path, body) {
    let response;
    try {
        response = await fetch(`/api/auth/${path}`, {
            method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin',
            ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
        });
    } catch {
        throw new Error('Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.');
    }
    if (response.status === 204) return null;
    let data;
    try { data = await response.json(); } catch { throw new Error('Hệ thống chưa sẵn sàng. Vui lòng thử lại sau.'); }
    if (!response.ok) throw Object.assign(new Error(data.message || 'Không thể xử lý yêu cầu.'), { status: response.status, fields: data.fields ?? {} });
    return data;
}
