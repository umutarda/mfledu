# Remote Deploy Script for DigitalOcean Server
param(
    [switch]$NoBuild
)
$ErrorActionPreference = "Stop"

$SERVER_IP = "167.99.136.40"
$SSH_USER = "root"
$SSH_KEY = "C:\Users\umut.tuncar\.ssh\digital_ocean"
$REMOTE_DIR = "~/frontend_image"
$TAR_NAME = "mfledu-frontend.tar"

if (-not $NoBuild) {
    Write-Host "Building the Docker image locally..." -ForegroundColor Cyan
    docker build -t mfledu-frontend .
}
else {
    # Verify the image exists locally even if we skip build
    $imageExists = docker images -q mfledu-frontend 2>$null
    if (-not $imageExists) {
        Write-Error "Error: Docker image 'mfledu-frontend' not found locally. Run without -NoBuild first."
        exit 1
    }
    Write-Host "Skipping build, using existing local image." -ForegroundColor Yellow
}

Write-Host "Saving the image to a tarball ($TAR_NAME)..." -ForegroundColor Cyan
docker save -o $TAR_NAME mfledu-frontend

Write-Host "Ensuring remote directory exists..." -ForegroundColor Cyan
ssh -i $SSH_KEY ${SSH_USER}@${SERVER_IP} "mkdir -p $REMOTE_DIR"

Write-Host "Uploading Docker image to server (this may take a few minutes)..." -ForegroundColor Cyan
scp -i $SSH_KEY $TAR_NAME ${SSH_USER}@${SERVER_IP}:${REMOTE_DIR}/${TAR_NAME}

Write-Host "Connecting to server to load and run image..." -ForegroundColor Cyan
$remoteCmds = @"
cd $REMOTE_DIR
echo 'Loading Docker image...'
docker load -i $TAR_NAME

echo 'Stopping existing container (if running)...'
docker stop mfledu 2>/dev/null || true
docker rm mfledu 2>/dev/null || true

echo 'Starting new container...'
docker run -d -p 3000:3000 --name mfledu --restart always mfledu-frontend

echo 'Cleaning up remote tar file to save space...'
rm $TAR_NAME
echo 'Done!'
"@

$remoteCmds = $remoteCmds -replace "`r", ""

ssh -i $SSH_KEY ${SSH_USER}@${SERVER_IP} $remoteCmds

Write-Host "Cleaning up local tar file..." -ForegroundColor Cyan
Remove-Item -Path $TAR_NAME -ErrorAction SilentlyContinue

Write-Host "Remote deployment completed successfully!" -ForegroundColor Green
