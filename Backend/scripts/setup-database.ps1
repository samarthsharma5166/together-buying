# Run once to create database + user, then push schema and seed.
# Usage: .\scripts\setup-database.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$sqlFile = Join-Path $PSScriptRoot "setup-database.sql"

Write-Host "Setting up MySQL database for GroupBuying..." -ForegroundColor Cyan
Write-Host "Enter your MySQL ROOT password when prompted." -ForegroundColor Yellow

Get-Content $sqlFile | mysql -u root -p

if ($LASTEXITCODE -ne 0) {
  Write-Host "MySQL setup failed. Make sure MySQL is running and root password is correct." -ForegroundColor Red
  exit 1
}

Set-Location $root
Write-Host "Pushing Prisma schema..." -ForegroundColor Cyan
npx prisma db push

Write-Host "Seeding database..." -ForegroundColor Cyan
npm run db:seed

Write-Host "Done! Restart backend with: npm run dev" -ForegroundColor Green
