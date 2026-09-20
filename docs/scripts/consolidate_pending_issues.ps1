$ErrorActionPreference = 'Stop'
$project_root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$backlog_path = Join-Path $project_root 'docs/project/feature_backlog.json'
$features = @(Get-Content -LiteralPath $backlog_path -Raw -Encoding UTF8 | ConvertFrom-Json)
$groups = @(
    @{ number=11; members=@(11,12); title='Hồ sơ cá nhân bệnh nhân'; key='patient_profile' },
    @{ number=13; members=@(13,14); title='Lịch làm việc và khung giờ khám 30 phút'; key='working_schedule' },
    @{ number=15; members=@(15,16,17); title='Đặt, theo dõi và hủy lịch hẹn của bệnh nhân'; key='patient_appointments' },
    @{ number=18; members=@(18,19,20); title='Hai trang bác sĩ và ghi nhận kết quả khám'; key='doctor_workspace' },
    @{ number=21; members=@(21,22,23,24,25,26,27,28); title='Quản trị bác sĩ, chuyên khoa và lịch hẹn'; key='admin_workspace' },
    @{ number=29; members=@(29); title='Kiểm thử toàn hệ thống và đóng gói demo'; key='integration_delivery' },
    @{ number=30; members=@(30); title='Đồng bộ SRS API ERD và báo cáo'; key='final_documentation' }
)
$existing = gh issue list --repo DESCHILL/WEB-MediBook --state all --limit 100 --json number,state | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'Không đọc được issue.' }
foreach ($group in $groups) {
    $items = @($features | Where-Object { $_.issue -in $group.members })
    if ($items.Count -eq 0) { throw 'Thiếu thông tin phạm vi.' }
    $batch = $items[0].batch
    $criteria = ($items | ForEach-Object { '- ' + $_.acceptance }) -join "`n"
    $body = "## Mục tiêu`n`n$($group.title), bám UI/UX và nghiệp vụ trong báo cáo.`n`n## Phạm vi và tiêu chí nghiệm thu`n`n$criteria`n`n## Kiểm thử`n`nKiểm tra luồng thành công, dữ liệu không hợp lệ, quyền truy cập và lỗi hệ thống; chạy các test liên quan và build frontend. Không hiển thị kết quả thành công giả.`n`n## Quy trình thực hiện`n`n- Đợt $batch/8; branch codex/issue_$($group.number)_$($group.key) được tạo trước khi xử lý phạm vi.`n- Chia React component dùng lại; tên file/hàm snake_case; commit tiếng Việt tham chiếu issue.`n- Tiếp tục hoàn thiện trên máy; chỉ push đúng một đợt khi người dùng yêu cầu, tạo PR rồi hợp nhất vào main.`n- Issue này chỉ hoàn thành khi mã đã vào main. Các issue nhỏ được gộp giữ lại lịch sử, không coi là đã triển khai.`n- Khách/bệnh nhân: Trang chủ, Bác sĩ và chuyên khoa, Quản lý lịch hẹn; quản lý lịch cá nhân cần đăng nhập. Bác sĩ chỉ có Quản lý lịch hẹn và Danh sách bệnh nhân.`n"
    $body | gh issue edit $group.number --repo DESCHILL/WEB-MediBook --title "[Đợt $batch] $($group.title)" --body-file -
    if ($LASTEXITCODE -ne 0) { throw 'Không cập nhật được issue.' }
    foreach ($number in $group.members) {
        if ($number -eq $group.number) { continue }
        if (($existing | Where-Object number -eq $number).state -eq 'OPEN') {
            gh issue close $number --repo DESCHILL/WEB-MediBook --reason 'not planned' --comment "Gộp phạm vi vào #$($group.number) theo yêu cầu giảm số lượng issue. Giữ lịch sử; đóng để tránh theo dõi trùng, không có nghĩa chức năng đã hoàn thành."
            if ($LASTEXITCODE -ne 0) { throw 'Không đóng được issue trùng phạm vi.' }
        }
    }
}
