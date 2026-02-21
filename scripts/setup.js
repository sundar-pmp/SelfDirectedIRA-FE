#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🚀 Self-Directed IRA Registration Platform - Setup\n');

// Check Node.js version
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0]);
if (majorVersion < 18) {
  console.error(`❌ Node.js 18+ required (current: ${nodeVersion})\n`);
  process.exit(1);
}
console.log(`✓ Node.js ${nodeVersion}\n`);

// Create .env.local from template if missing
const envPath = path.join(__dirname, '../.env.local');
const envExamplePath = path.join(__dirname, '../.env.local.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('📝 Creating .env.local...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✓ .env.local created\n');
}

// Verify required directories
const requiredDirs = [
  'pages', 'components/registration', 'lib/api', 'lib/hooks', 'lib/utils',
  'types', 'styles', 'api', 'api/Models', 'api/DTOs', 'api/Controllers',
  'api/Services', 'api/Data'
];

console.log('📁 Verifying directories...');
requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '../', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});
console.log('✓ All directories ready\n');

// Verify key files
const requiredFiles = [
  'package.json', '.env.local.example', 'next.config.js',
  'api/Program.cs', 'api/SelfDirectedIRA.Api.csproj',
  'docker-compose.yml', 'README.md'
];

console.log('📄 Verifying key files...');
const missingFiles = [];
requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, '../', file);
  if (!fs.existsSync(fullPath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(`⚠️  Missing files: ${missingFiles.join(', ')}`);
} else {
  console.log('✓ All key files present\n');
}

console.log('✅ Setup complete!\n');
console.log('📚 Next steps:');
console.log('  1. npm ci                     # Install frontend dependencies');
console.log('  2. cd api && dotnet restore  # Install API dependencies');
console.log('  3. npm run dev                # Start frontend on :3000');
console.log('  4. cd api && dotnet watch run # Start API on :5000');
console.log('\n💡 Or use: docker-compose up --build\n');
