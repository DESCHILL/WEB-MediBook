export default function specialty_list({ items }) {
    return <div className="specialty_list">{items.map((item, index) =>
        <a className="specialty_item" key={item.chuyen_khoa_id} href={`/bac_si?chuyen_khoa_id=${item.chuyen_khoa_id}`}>
            <span className={`specialty_icon specialty_tone_${index % 3}`} aria-hidden="true">
                <svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="22" r="11" fill="#f5d3b9"/><path d="M12 58V49c0-12 40-12 40 0v9" fill="#6265ff"/><path d="M27 35 32 49 37 35M24 40v9a5 5 0 0 0 10 0v-6" stroke="white" strokeWidth="3"/><circle cx="37" cy="46" r="3" stroke="white" strokeWidth="2"/></svg>
            </span>
            <span>{item.ten_chuyen_khoa}</span>
        </a>)}</div>;
}
