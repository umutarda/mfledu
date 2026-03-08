# Sorium Deployment Script

# Stop and remove existing container if it exists
Write-Host "Stopping and removing existing sorium container..." -ForegroundColor Cyan
docker stop sorium 2>$null
docker rm sorium 2>$null

# Build the new image
Write-Host "Building sorium-frontend image..." -ForegroundColor Cyan
docker build -t sorium-frontend .

# Run the new container
Write-Host "Starting new sorium container on port 3000..." -ForegroundColor Cyan
docker run -d -p 3000:3000 --name sorium --restart always sorium-frontend

Write-Host "Deployment complete! App is running at http://localhost:3000" -ForegroundColor Green
