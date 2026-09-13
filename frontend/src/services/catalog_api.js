export async function get_catalog(path, signal) {
    const response = await fetch(`/api/${path}`, { signal, credentials: 'same-origin' });
    let result;
    try { result = await response.json(); } catch { throw new Error('Không thể tải dữ liệu. Vui lòng thử lại.'); }
    if (!response.ok) throw Object.assign(new Error(result.message ?? 'Không thể tải dữ liệu.'), { status: response.status });
    return result;
}
