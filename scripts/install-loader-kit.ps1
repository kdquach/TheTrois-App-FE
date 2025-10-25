# Script tự động cài đặt và cấu hình react-native-loader-kit
# PowerShell script for Windows

Write-Host "🎨 Installing react-native-loader-kit..." -ForegroundColor Cyan

# Step 1: Install package
Write-Host "`n📦 Step 1: Installing package..." -ForegroundColor Yellow
try {
    npm install react-native-loader-kit --legacy-peer-deps
    Write-Host "✅ Package installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install. Trying with yarn..." -ForegroundColor Red
    yarn add react-native-loader-kit
}

# Step 2: Backup old file
Write-Host "`n💾 Step 2: Backing up old LoadingIndicator..." -ForegroundColor Yellow
if (Test-Path "components\LoadingIndicator.js") {
    Copy-Item "components\LoadingIndicator.js" "components\LoadingIndicator_backup.js"
    Write-Host "✅ Backup created: LoadingIndicator_backup.js" -ForegroundColor Green
}

# Step 3: Replace with new file
Write-Host "`n🔄 Step 3: Replacing LoadingIndicator..." -ForegroundColor Yellow
if (Test-Path "components\LoadingIndicator_new.js") {
    Remove-Item "components\LoadingIndicator.js" -Force
    Rename-Item "components\LoadingIndicator_new.js" "LoadingIndicator.js"
    Write-Host "✅ LoadingIndicator replaced!" -ForegroundColor Green
} else {
    Write-Host "⚠️  LoadingIndicator_new.js not found!" -ForegroundColor Yellow
}

# Step 4: Clear Metro cache
Write-Host "`n🧹 Step 4: Clearing Metro cache..." -ForegroundColor Yellow
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cache cleared!" -ForegroundColor Green

Write-Host "`n✨ Installation complete!" -ForegroundColor Green
Write-Host "`n⚠️  IMPORTANT: Don't forget to:" -ForegroundColor Yellow
Write-Host "   1. Uncomment the import statements in LoadingIndicator.js" -ForegroundColor White
Write-Host "   2. Uncomment the renderLoading switch case" -ForegroundColor White
Write-Host "   3. Remove the temporary code" -ForegroundColor White
Write-Host "   4. Restart Metro bundler: npm run dev" -ForegroundColor White
Write-Host "`n📖 See docs/LOADING_KIT_INSTALLATION.md for details" -ForegroundColor Cyan
