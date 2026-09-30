$root = 'c:\dev\AI\azure-lab'
$py = Join-Path $root 'backend\.venv\Scripts\python.exe'

$b = Start-Process -FilePath $py `
    -ArgumentList '-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8001','--app-dir',(Join-Path $root 'backend') `
    -RedirectStandardOutput (Join-Path $root 'uv.out.txt') `
    -RedirectStandardError  (Join-Path $root 'uv.err.txt') `
    -WindowStyle Hidden -PassThru
Write-Host "backend pid $($b.Id)"

$f = Start-Process -FilePath 'C:\Program Files\nodejs\npm.cmd' `
    -ArgumentList 'run','dev','--','--port','5174','--strictPort' `
    -WorkingDirectory (Join-Path $root 'frontend') `
    -RedirectStandardOutput (Join-Path $root 'vite.out.txt') `
    -RedirectStandardError  (Join-Path $root 'vite.err.txt') `
    -WindowStyle Hidden -PassThru
Write-Host "frontend pid $($f.Id)"
