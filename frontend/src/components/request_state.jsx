export default function request_state({ loading, error, retry, empty, empty_message = 'Chưa có dữ liệu để hiển thị.' }) {
    if (loading) return <div className="request_state" role="status">Đang tải dữ liệu…</div>;
    if (error) return <div className="request_state" role="alert"><p>{error}</p><button className="soft_button" onClick={retry}>Thử lại</button></div>;
    if (empty) return <div className="request_state"><p>{empty_message}</p></div>;
    return null;
}
