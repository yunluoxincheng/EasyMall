$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

$Image = "yunluoxincheng/easymall-frontend:latest"

Write-Host "========== Build and Push Frontend Image =========="

Write-Host ""
Write-Host ">>> Building frontend image..."
docker build -t $Image "$ProjectDir/easymall-frontend"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host ">>> Pushing frontend image..."
docker push $Image
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "========== Done =========="
docker images $Image --format "table {{.Repository}}`t{{.Tag}}`t{{.Size}}"
