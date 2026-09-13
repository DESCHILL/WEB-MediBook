$ErrorActionPreference = 'Stop'
$project_root = Split-Path $PSScriptRoot -Parent
$node_command = Get-Command node -ErrorAction SilentlyContinue
$node_path = if ($node_command) { $node_command.Source } else { Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' }
if (-not (Test-Path -LiteralPath $node_path)) { throw 'Chưa có Node.js trong PATH. Cài Node.js rồi mở lại PowerShell.' }
$local_directory = Join-Path $project_root 'local_data'
New-Item -ItemType Directory -Path $local_directory -Force | Out-Null
$backend_directory = Join-Path $project_root 'backend'
$frontend_directory = Join-Path $project_root 'frontend'
if (-not (Test-Path -LiteralPath (Join-Path $backend_directory '.env'))) { throw 'Tạo backend/.env từ .env.example và cấu hình SQL Server, JWT trước.' }
$vite_path = Join-Path $project_root 'node_modules/vite/bin/vite.js'
if (-not (Test-Path -LiteralPath $vite_path)) { throw 'Chạy npm ci tại thư mục project trước.' }
if (-not (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)) {
    $backend_process = Start-Process -FilePath $node_path -ArgumentList @('--env-file-if-exists=.env','src/server.js') -WorkingDirectory $backend_directory -WindowStyle Hidden -RedirectStandardOutput (Join-Path $local_directory 'backend_stdout.log') -RedirectStandardError (Join-Path $local_directory 'backend_stderr.log') -PassThru
    $backend_process.Id | Set-Content (Join-Path $local_directory 'backend.pid')
}
if (-not (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)) {
    $frontend_process = Start-Process -FilePath $node_path -ArgumentList @(('"' + $vite_path + '"'),'--config','vite_config.js') -WorkingDirectory $frontend_directory -WindowStyle Hidden -RedirectStandardOutput (Join-Path $local_directory 'frontend_stdout.log') -RedirectStandardError (Join-Path $local_directory 'frontend_stderr.log') -PassThru
    $frontend_process.Id | Set-Content (Join-Path $local_directory 'frontend.pid')
}
Write-Output 'Website: http://127.0.0.1:5173'
Write-Output 'Kiểm tra SQL: http://127.0.0.1:3000/api/health/ready'
Write-Output 'Nhật ký tiến trình nằm trong local_data. Không tự khởi động cùng Windows.'
