Write-Output "======================================"
Write-Output "Cleaning /out folder (PowerShell unlock)..."
Write-Output "======================================"

if (Test-Path .\out) {
    Get-ChildItem -Path .\out -Recurse -Force | ForEach-Object { $_.Attributes = 'Normal' }
    Remove-Item -Path .\out -Recurse -Force
    Write-Output "✅ /out folder cleaned successfully."
} else {
    Write-Output "No /out folder found to clean."
}

Write-Output "======================================"
