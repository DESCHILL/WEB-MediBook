$ErrorActionPreference = 'Stop'
$repository = 'DESCHILL/WEB-MediBook'
$project_root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$features = Get-Content -LiteralPath (Join-Path $project_root 'docs/project/feature_backlog.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$existing = gh issue list --repo $repository --state all --limit 200 --json number,title,url | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'Không đọc được issue trên GitHub.' }
foreach ($feature in $features) {
    $title = '[Đợt ' + $feature.batch + '] ' + $feature.title
    $match = $existing | Where-Object { $_.title -eq $title } | Select-Object -First 1
    if ($match) { Write-Output ($match.number.ToString() + ' ' + $title); continue }
    $body = "## Chức năng`n`n$($feature.title).`n`n## Tiêu chí nghiệm thu`n`n$($feature.acceptance)`n`n## Quy trình`n`n- Đợt bàn giao: $($feature.batch)/8.`n- Tạo branch codex/issue_<số_issue>_$($feature.key) trước khi tiếp tục code chức năng.`n- Tên hàm và file snake_case; giao diện chia React component dùng lại, bám UI/UX trong báo cáo.`n- Commit bằng tiếng Việt; kiểm thử chức năng và build.`n- Chưa push code. Chỉ đưa đúng một đợt lên GitHub khi người dùng yêu cầu push.`n- Issue giữ mở đến khi PR được hợp nhất vào main.`n"
    $body | gh issue create --repo $repository --title $title --body-file -
    if ($LASTEXITCODE -ne 0) { throw ('Không tạo được issue: ' + $title) }
}
