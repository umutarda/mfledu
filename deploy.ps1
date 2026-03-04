# MFLEdu Deployment Script

# Stop and remove existing container if it exists
Write-Host "Stopping and removing existing eafledu container..." -ForegroundColor Cyan
docker stop eafledu 2>$null
docker rm eafledu 2>$null

# Build the new image
Write-Host "Building mfledu-frontend image..." -ForegroundColor Cyan
docker build -t mfledu-frontend .

# Run the new container
Write-Host "Starting new eafledu container on port 3000..." -ForegroundColor Cyan
docker run -d -p 3000:3000 --name eafledu --restart always mfledu-frontend

Write-Host "Deployment complete! App is running at http://localhost:3000" -ForegroundColor Green
