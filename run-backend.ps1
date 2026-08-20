$nodePath = "C:\Users\chpol\Downloads\node-v20.18.0-win-x64"
$env:PATH = "$nodePath;" + $env:PATH
Set-Location $PSScriptRoot
Write-Host "Starting CivicResolve Backend Server on http://localhost:5000..." -ForegroundColor Green
npm run dev:server