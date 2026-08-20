# CivicResolve AI — Convenience Launch Script
# Run this if npm is not in your PATH

$nodePath = "C:\Users\chpol\Downloads\node-v20.18.0-win-x64"
$env:PATH = "$nodePath;" + $env:PATH

Write-Host "Node version: $(node --version)" -ForegroundColor Green
Write-Host "npm version: $(npm --version)" -ForegroundColor Green

Set-Location $PSScriptRoot

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting CivicResolve AI dev server..." -ForegroundColor Cyan
Write-Host "Open: http://localhost:5173" -ForegroundColor Green
npm run dev
