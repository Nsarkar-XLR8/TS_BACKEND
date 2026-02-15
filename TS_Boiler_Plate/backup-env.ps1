# 🔐 .env Backup Script (PowerShell)
# This script creates a backup of your .env file

param(
    [switch]$Restore,
    [string]$BackupFile
)

$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

Write-Host "🔐 .env Backup Script" -ForegroundColor $Green
Write-Host "================================" -ForegroundColor $Green
Write-Host ""

$BackupDir = "$env:USERPROFILE\.env-backups\ts-backend"

if ($Restore) {
    if (-not $BackupFile) {
        Write-Host "📋 Available backups:" -ForegroundColor $Yellow
        Get-ChildItem -Path $BackupDir -Filter "*.env.backup" | Sort-Object LastWriteTime -Descending | Select-Object -First 10 | Format-Table Name, LastWriteTime, Length -AutoSize
        $BackupFile = Read-Host "Enter backup filename to restore"
    }
    
    $FullBackupPath = Join-Path $BackupDir $BackupFile
    
    if (-not (Test-Path $FullBackupPath)) {
        Write-Host "❌ Backup file not found: $FullBackupPath" -ForegroundColor $Red
        exit 1
    }
    
    Write-Host "📥 Restoring from: $BackupFile" -ForegroundColor $Yellow
    
    if (Test-Path ".env") {
        $CurrentBackup = ".env.before-restore.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item ".env" $CurrentBackup
        Write-Host "💾 Current .env backed up to: $CurrentBackup" -ForegroundColor $Yellow
    }
    
    Copy-Item $FullBackupPath ".env"
    Write-Host "✅ Restored successfully!" -ForegroundColor $Green
}
else {
    if (-not (Test-Path ".env")) {
        Write-Host "❌ Error: .env file not found!" -ForegroundColor $Red
        exit 1
    }
    
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    }
    
    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $BackupFileName = ".env.backup.$Timestamp"
    $BackupPath = Join-Path $BackupDir $BackupFileName
    
    Write-Host "📦 Creating backup..." -ForegroundColor $Yellow
    Copy-Item ".env" $BackupPath
    
    if (Test-Path $BackupPath) {
        Write-Host "✅ Backup created successfully!" -ForegroundColor $Green
        Write-Host "📁 Location: $BackupPath" -ForegroundColor $Green
        
        $Size = (Get-Item $BackupPath).Length
        $SizeKB = [math]::Round($Size / 1KB, 2)
        Write-Host "📊 Size: $SizeKB KB" -ForegroundColor $Green
        
        Write-Host ""
        Write-Host "📋 Recent backups:" -ForegroundColor $Yellow
        Get-ChildItem -Path $BackupDir -Filter "*.env.backup" | Sort-Object LastWriteTime -Descending | Select-Object -First 5 | Format-Table Name, LastWriteTime, @{Name = "Size (KB)"; Expression = { [math]::Round($_.Length / 1KB, 2) } } -AutoSize
        
        Write-Host "🧹 Cleaning up old backups (keeping last 10)..." -ForegroundColor $Yellow
        Get-ChildItem -Path $BackupDir -Filter "*.env.backup" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 10 | Remove-Item -Force -ErrorAction SilentlyContinue
        
        Write-Host "✅ Done!" -ForegroundColor $Green
        Write-Host ""
        Write-Host "💡 Tip: Store this backup in your password manager or encrypted cloud storage!" -ForegroundColor $Yellow
    }
    else {
        Write-Host "❌ Backup failed!" -ForegroundColor $Red
        exit 1
    }
}

Write-Host ""
Write-Host "📚 Usage:" -ForegroundColor $Yellow
Write-Host "  Backup:  .\backup-env.ps1" -ForegroundColor $Yellow
Write-Host "  Restore: .\backup-env.ps1 -Restore" -ForegroundColor $Yellow
Write-Host "  Restore specific: .\backup-env.ps1 -Restore -BackupFile '.env.backup.20260216_120000'" -ForegroundColor $Yellow
