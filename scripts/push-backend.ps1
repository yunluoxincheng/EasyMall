$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

$Image = "yunluoxincheng/easymall-backend:latest"

Write-Host "========== Build and Push Backend Image =========="

Write-Host ""
Write-Host ">>> Building backend image..."
docker build -t $Image "$ProjectDir/easymall-backend"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host ">>> Pushing backend image..."
docker push $Image
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "========== Done =========="
docker images $Image --format "table {{.Repository}}`t{{.Tag}}`t{{.Size}}"
