$ErrorActionPreference = 'SilentlyContinue'
foreach ($port in 8001,5174,5175) {
    $conns = Get-NetTCPConnection -State Listen -LocalPort $port
    foreach ($c in $conns) {
        $procId = $c.OwningProcess
        $p = Get-Process -Id $procId
        Write-Host "Killing port $port -> PID $procId ($($p.ProcessName))"
        Stop-Process -Id $procId -Force
    }
}
Start-Sleep -Milliseconds 800
Write-Host "Remaining listeners on target ports:"
Get-NetTCPConnection -State Listen -LocalPort 8001,5174,5175 | Select-Object LocalPort,OwningProcess | Format-Table
