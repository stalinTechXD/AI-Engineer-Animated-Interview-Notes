# Starts the Azure AI Foundry labs backend (:8001) and frontend (:5174).
# Run from anywhere: powershell -File c:\dev\AI\azure-lab\start-all.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$py = Join-Path $root 'backend\.venv\Scripts\python.exe'

if (-not (Test-Path $py)) {
    Write-Host "Backend venv missing. Run: python -m venv `"$root\backend\.venv`"" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting backend on http://127.0.0.1:8001 ..." -ForegroundColor Cyan
Start-Process -FilePath $py `
    -ArgumentList '-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8001','--app-dir',(Join-Path $root 'backend') `
    -WindowStyle Minimized

Write-Host "Starting frontend on http://localhost:5174 ..." -ForegroundColor Cyan
Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory (Join-Path $root 'frontend') -WindowStyle Minimized

Start-Sleep -Seconds 2
Write-Host "Open http://localhost:5174/ and go to Setup & Status." -ForegroundColor Green
