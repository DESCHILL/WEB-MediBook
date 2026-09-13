export async function send_appointment_request(path, body = {}) {
    const response = await fetch(`/api/appointments${path}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (response.status === 204) return;
    const data = await response.json();
    if (!response.ok) throw Object.assign(new Error(data.message || 'Không thể xử lý lịch hẹn.'), { status: response.status });
    return data;
}
