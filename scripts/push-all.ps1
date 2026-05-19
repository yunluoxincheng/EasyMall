$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

$ImagePrefix = "yunluoxincheng"

Write-Host "========== Build and Push All Images =========="

Write-Host ""
Write-Host ">>> Building backend image..."
docker build -t "${ImagePrefix}/easymall-backend:latest" "$ProjectDir/easymall-backend"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host ">>> Pushing backend image..."
docker push "${ImagePrefix}/easymall-backend:latest"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host ">>> Building frontend image..."
docker build -t "${ImagePrefix}/easymall-frontend:latest" "$ProjectDir/easymall-frontend"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host ">>> Pushing frontend image..."
docker push "${ImagePrefix}/easymall-frontend:latest"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "========== All Done =========="
docker images "${ImagePrefix}/easymall-*" --format "table {{.Repository}}`t{{.Tag}}`t{{.Size}}"
