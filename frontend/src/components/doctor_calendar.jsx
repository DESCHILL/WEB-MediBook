export default function doctor_calendar({date,items}) {
    if(!date)return <p>Chọn ngày để xem lịch.</p>;
    const anchor=new Date(`${date}T00:00:00Z`);
    anchor.setUTCDate(anchor.getUTCDate()-(anchor.getUTCDay()+6)%7);
    const days=Array.from({length:7},(_,index)=>{const value=new Date(anchor);value.setUTCDate(value.getUTCDate()+index);return value.toISOString().slice(0,10);});
    const visible=items.filter((item)=>days.includes(item.bat_dau_luc.slice(0,10))&&item.trang_thai!=='Đã hủy');
    const times=new Set(Array.from({length:20},(_,index)=>`${String(8+Math.floor(index/2)).padStart(2,'0')}:${index%2?'30':'00'}`));
    for(const item of visible)times.add(item.bat_dau_luc.slice(11,16));
    return <div className="table_scroll"><table className="calendar_week"><thead><tr><th>Giờ</th>{days.map((day,index)=><th key={day}>{index===6?'Chủ nhật':`Thứ ${index+2}`}<br/>{day.slice(8)}/{day.slice(5,7)}</th>)}</tr></thead><tbody>{[...times].sort().map((time)=><tr key={time}><th>{time}</th>{days.map((day)=><td key={day}>{visible.filter((item)=>item.bat_dau_luc.slice(0,10)===day&&item.bat_dau_luc.slice(11,16)===time).map((item)=><a key={item.lich_hen_id} href="/bac_si/benh_nhan">{item.ho_ten}<br/>{item.trang_thai}</a>)}</td>)}</tr>)}</tbody></table></div>;
}
