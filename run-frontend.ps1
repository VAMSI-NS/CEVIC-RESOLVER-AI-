$nodePath = "C:\Users\chpol\Downloads\node-v20.18.0-win-x64"
$env:PATH = "$nodePath;" + $env:PATH
Set-Location $PSScriptRoot
Write-Host "Starting CivicResolve Frontend on http://localhost:5173..." -ForegroundColor Cyan
npm run dev:client