$ErrorActionPreference = 'SilentlyContinue'
function Probe($url) {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        return "$url = $($r.StatusCode)"
    } catch {
        return "$url FAIL: $($_.Exception.Message)"
    }
}
Probe 'http://127.0.0.1:8001/api/config'
Probe 'http://localhost:5174/'
Probe 'http://localhost:5175/'
"python pids: " + ((Get-Process python).Id -join ',')
"node pids: " + ((Get-Process node).Id -join ',')
