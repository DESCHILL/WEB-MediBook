"""Tách bản phát triển cục bộ thành các mốc bàn giao; không có lệnh push."""
from pathlib import Path
import os
import subprocess
import sys

project_root = Path(__file__).resolve().parents[2]
release_root = project_root / 'local_data' / 'release_tree'
source_ref = sys.argv[1]


def run(arguments, cwd=project_root):
    result = subprocess.run(arguments, cwd=cwd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if result.returncode:
        raise RuntimeError(result.stdout + result.stderr)
    return result.stdout.strip()


def source_text(path, ref=source_ref):
    return run(['git', 'show', f'{ref}:{path}']) + '\n'


def copy_source(path, ref=source_ref):
    data = subprocess.check_output(['git', 'show', f'{ref}:{path}'], cwd=project_root)
    destination = release_root / path
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)


def add_module(name):
    for folder, suffix in [('repositories', 'repository'), ('services', 'service'), ('controllers', 'controller'), ('routes', 'routes')]:
        copy_source(f'backend/src/{folder}/{name}_{suffix}.js')


def write_apps(batch):
    backend = source_text('backend/src/app.js', '03c7f47')
    modules = [('profile', 3), ('schedule', 4), ('appointment', 5), ('doctor', 6), ('admin', 7)]
    imports = ''
    mounts = ''
    for name, first in modules:
        if batch < first:
            continue
        for folder, suffix in [('repositories', 'repository'), ('services', 'service'), ('controllers', 'controller'), ('routes', 'routes')]:
            imports += f"import {{create_{name}_{suffix}}} from './{folder}/{name}_{suffix}.js';\n"
        if name == 'appointment':
            backend = backend.replace('catalog_repository } = {}', 'catalog_repository, appointment_repository } = {}')
            mounts += "const appointment_service=create_appointment_service(appointment_repository??create_appointment_repository(database));\napp.use('/api',create_appointment_routes(create_appointment_controller(appointment_service),auth_service,auth_config));\n"
        else:
            route = {'profile': '/api/profile', 'schedule': '/api/admin/doctors', 'doctor': '/api/doctor', 'admin': '/api/admin'}[name]
            mounts += f"app.use('{route}',create_{name}_routes(create_{name}_controller(create_{name}_service(create_{name}_repository(database))),auth_service,auth_config));\n"
    backend = imports + backend
    backend = backend.replace('    const repository = create_health_repository(database);', mounts + '    const repository = create_health_repository(database);')
    if batch >= 7:
        backend = source_text('backend/src/app.js')
    (release_root / 'backend/src/app.js').write_text(backend, encoding='utf-8')

    frontend = source_text('frontend/src/app.jsx', '03c7f47')
    if batch >= 5:
        frontend = "import Appointment_page from './pages/appointment_page.jsx';\n" + frontend
        frontend = frontend.replace('    else if (doctor_match)', "    else if(path==='/lich_hen')page=<Appointment_page auth={auth}/>;\n    else if (doctor_match)")
        frontend = frontend.replace('doctor_id={doctor_match[1]} />', 'doctor_id={doctor_match[1]} auth={auth} />')
    if batch >= 6:
        frontend = "import Doctor_workspace from './pages/doctor_workspace.jsx';\n" + frontend
        frontend = frontend.replace('    else if (doctor_match)', "    else if(['/bac_si/lich_hen','/bac_si/benh_nhan'].includes(path))page=<Doctor_workspace auth={auth} path={path}/>;\n    else if (doctor_match)")
        frontend = frontend.replace('!auth_page && <Site_footer', "!auth_page && !['/bac_si/lich_hen','/bac_si/benh_nhan'].includes(path) && <Site_footer")
    if batch >= 7:
        frontend = source_text('frontend/src/app.jsx')
    (release_root / 'frontend/src/app.jsx').write_text(frontend, encoding='utf-8')


def verify_and_commit(batch, title):
    run(['git', 'diff', '--check'], release_root)
    npm = 'npm.cmd' if os.name == 'nt' else 'npm'
    run([npm, 'test'], release_root)
    run([npm, 'run', 'build'], release_root)
    run(['git', 'add', '.'], release_root)
    run(['git', 'commit', '-m', title], release_root)
    print(f'Đợt {batch}: test và build đạt, {run(["git", "rev-parse", "--short", "HEAD"], release_root)}', flush=True)


if release_root.exists():
    raise RuntimeError('Worktree bàn giao đã tồn tại; không ghi đè. Kiểm tra trạng thái trước khi tiếp tục.')
run(['git', 'worktree', 'add', '-b', 'codex/release_preparation', str(release_root), 'codex/dot_02_tra_cuu'])
header = source_text('frontend/src/components/site_header.jsx', '03c7f47')
header = header.replace('href="/lich_hen"', 'href="/lich_hen" aria-disabled="true" tabIndex={-1} onClick={(event)=>event.preventDefault()}')
(release_root / 'frontend/src/components/site_header.jsx').write_text(header, encoding='utf-8')
verify_and_commit(2, 'Chốt giao diện tra cứu và giới hạn điều hướng trong phạm vi đợt hai (#10)')
run(['git', 'branch', '-f', 'codex/dot_02_tra_cuu', 'HEAD'], release_root)

branches = {3: 'ho_so', 4: 'khung_gio', 5: 'lich_hen', 6: 'bac_si', 7: 'quan_tri', 8: 'ban_giao'}
titles = {3: 'Bàn giao module hồ sơ cá nhân bệnh nhân (#11)', 4: 'Bàn giao lịch làm việc và sinh khung giờ 30 phút (#13)', 5: 'Bàn giao đặt theo dõi và hủy lịch bệnh nhân (#15)', 6: 'Bàn giao hai trang bác sĩ và lưu kết quả khám (#18)', 7: 'Bàn giao quản trị bác sĩ chuyên khoa và lịch hẹn (#21)', 8: 'Bàn giao kiểm thử tích hợp hướng dẫn demo và tài liệu (#29, #30)'}
for batch in range(3, 9):
    run(['git', 'switch', '-c', f'codex/dot_{batch:02d}_{branches[batch]}'], release_root)
    if batch == 3:
        add_module('profile')
        for path in ['frontend/src/pages/profile_page.jsx', 'backend/tests/profile_test.js', 'docs/ui_ux/profile_reference.png']:
            copy_source(path)
        copy_source('frontend/src/pages/account_page.jsx', 'a137824')
        copy_source('frontend/src/styles.css')
    if batch == 4:
        add_module('schedule')
        for path in ['backend/src/services/resource_id_service.js', 'backend/scripts/seed_schedules.js']:
            copy_source(path)
    if batch == 5:
        add_module('appointment')
        for path in ['backend/tests/appointment_test.js', 'frontend/src/pages/appointment_page.jsx', 'frontend/src/components/booking_form.jsx', 'frontend/src/services/appointment_api.js', 'frontend/src/pages/doctor_detail_page.jsx', 'docs/architecture/appointment_api.md', 'docs/ui_ux/catalog_reference_7.png']:
            copy_source(path)
        copy_source('backend/tests/appointment_database_test.js', 'f75ca88')
        copy_source('frontend/src/pages/auth_page.jsx', 'f75ca88')
        copy_source('frontend/src/components/site_header.jsx')
    if batch == 6:
        add_module('doctor')
        for path in ['frontend/src/pages/doctor_workspace.jsx', 'frontend/src/components/doctor_calendar.jsx', 'frontend/src/components/workspace_layout.jsx', 'docs/ui_ux/workspace_reference_8.png', 'docs/ui_ux/workspace_reference_9.png']:
            copy_source(path)
        login = source_text('frontend/src/pages/auth_page.jsx').replace("data.account.vai_tro==='ADMIN'?'/quan_tri':", '')
        (release_root / 'frontend/src/pages/auth_page.jsx').write_text(login, encoding='utf-8')
    if batch == 7:
        add_module('admin')
        paths = run(['git', 'ls-tree', '-r', '--name-only', source_ref]).splitlines()
        for path in paths:
            if path.startswith('frontend/src/pages/admin_') or path.startswith('docs/ui_ux/workspace_reference_'):
                copy_source(path)
        for path in ['backend/src/routes/upload_routes.js', 'frontend/src/components/image_upload.jsx', 'frontend/src/services/workspace_api.js', 'frontend/src/pages/auth_page.jsx', 'frontend/src/pages/account_page.jsx', 'frontend/vite_config.js']:
            copy_source(path)
    if batch < 8:
        write_apps(batch)
    else:
        run(['git', 'restore', '--source', source_ref, '--staged', '--worktree', '.'], release_root)
    verify_and_commit(batch, titles[batch])

for number, key, batch in [(11, 'patient_profile', 3), (13, 'working_schedule', 4), (15, 'patient_appointments', 5), (18, 'doctor_workspace', 6), (21, 'admin_workspace', 7)]:
    branch = f'codex/issue_{number}_{key}'
    run(['git', 'branch', '-m', branch, f'codex/local_history/issue_{number}_{key}'])
    run(['git', 'branch', branch, f'codex/dot_{batch:02d}_{branches[batch]}'])
print('Đã tách các mốc bàn giao. Không push, không thay đổi main.', flush=True)
