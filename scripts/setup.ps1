#!/usr/bin/env pwsh

# Self-Directed IRA Registration Platform - Setup Script (PowerShell)

Write-Host "🚀 Self-Directed IRA Registration Platform - Setup Script`n" -ForegroundColor Green

# Check .NET SDK
try {
  $dotnetVersion = dotnet --version
  Write-Host "✓ .NET SDK $dotnetVersion detected`n" -ForegroundColor Green
} catch {
  Write-Host "❌ .NET SDK not found. Please install .NET 7 SDK.`n" -ForegroundColor Red
  exit 1
}

# Check Node.js
try {
  $nodeVersion = node --version
  Write-Host "✓ Node.js $nodeVersion detected`n" -ForegroundColor Green
} catch {
  Write-Host "❌ Node.js not found. Please install Node.js 18+.`n" -ForegroundColor Red
  exit 1
}

# Create .env.local if missing
if (-not (Test-Path ".env.local")) {
  Write-Host "📝 Creating .env.local from template..." -ForegroundColor Yellow
  Copy-Item ".env.local.example" ".env.local"
  Write-Host "✓ .env.local created`n" -ForegroundColor Green
}

# Verify directories
Write-Host "📁 Verifying directory structure..." -ForegroundColor Yellow
$requiredDirs = @(
  "pages", "components/registration", "lib/api", "lib/hooks", "lib/utils",
  "types", "styles", "api", "api/Models", "api/DTOs", "api/Controllers",
  "api/Services", "api/Data"
)

$missingDirs = @()
foreach ($dir in $requiredDirs) {
  if (-not (Test-Path $dir)) {
    $missingDirs += $dir
  }
}

if ($missingDirs.Count -gt 0) {
  Write-Host "⚠️  Missing directories: $($missingDirs -join ', ')" -ForegroundColor Yellow
} else {
  Write-Host "✓ All required directories present`n" -ForegroundColor Green
}

# Verify key files
Write-Host "📄 Verifying key files..." -ForegroundColor Yellow
$requiredFiles = @(
  "package.json", ".env.local.example", "next.config.js",
  "api/Program.cs", "api/SelfDirectedIRA.Api.csproj",
  "docker-compose.yml", "README.md"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) {
    $missingFiles += $file
  }
}

if ($missingFiles.Count -gt 0) {
  Write-Host "⚠️  Missing files: $($missingFiles -join ', ')`n" -ForegroundColor Yellow
} else {
  Write-Host "✓ All key files present`n" -ForegroundColor Green
}

Write-Host "✅ Setup complete!`n" -ForegroundColor Green
Write-Host "📚 Next steps:" -ForegroundColor Cyan
Write-Host "  1. npm ci              # Install dependencies"
Write-Host "  2. cd api && dotnet restore  # Restore C# dependencies"
Write-Host "  3. docker-compose up   # Start full stack (optional)"
Write-Host "`n📖 See README.md for detailed instructions.`n" -ForegroundColor Cyan
