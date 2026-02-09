# EOTC Media - Database Setup Script
# Run this after installing PostgreSQL

Write-Host "🔧 EOTC Media - Database Setup" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
$pgVersion = psql --version 2>$null
if (-not $pgVersion) {
    Write-Host "❌ PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "   Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
Write-Host ""

# Prompt for database credentials
$dbUser = Read-Host "Enter PostgreSQL username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) {
    $dbUser = "postgres"
}

$dbPassword = Read-Host "Enter PostgreSQL password" -AsSecureString
$dbPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

$dbName = Read-Host "Enter database name (default: eotc_media)"
if ([string]::IsNullOrWhiteSpace($dbName)) {
    $dbName = "eotc_media"
}

Write-Host ""
Write-Host "📝 Creating database: $dbName" -ForegroundColor Cyan

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPasswordText

# Create database
$createDb = "CREATE DATABASE $dbName;" | psql -U $dbUser -h localhost 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database created successfully" -ForegroundColor Green
} else {
    if ($createDb -like "*already exists*") {
        Write-Host "⚠️  Database already exists" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed to create database: $createDb" -ForegroundColor Red
        exit 1
    }
}

# Clear password from environment
Remove-Item Env:PGPASSWORD

Write-Host ""
Write-Host "📝 Updating .env file" -ForegroundColor Cyan

# Update .env file
$envFile = ".\.env"
$connectionString = "DATABASE_URL=`"postgresql://$dbUser`:$dbPasswordText@localhost:5432/$dbName`""

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    $newContent = $envContent -replace 'DATABASE_URL=.*', $connectionString
    $newContent | Set-Content $envFile
    Write-Host "✅ .env file updated" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Running Prisma migrations" -ForegroundColor Cyan
npx prisma migrate dev --name init

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Generate a secret key: node -e `"console.log(require('crypto').randomBytes(32).toString('base64'))`"" -ForegroundColor Yellow
    Write-Host "  2. Update NEXTAUTH_SECRET in .env" -ForegroundColor Yellow
    Write-Host "  3. Run: npm run dev" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Migration failed. Please check the error above." -ForegroundColor Red
}
