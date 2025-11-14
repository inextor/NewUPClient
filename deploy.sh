#!/bin/bash

# Deployment script for production server
# This script builds and deploys the application to production

echo "=================================="
echo "Production Deployment Script"
echo "=================================="
echo ""
echo "Target: enlinea.cloud:/var/www/html/uniformesprofesionales.mx/semprainfraestructura/"
echo ""
echo "This will:"
echo "  1. Build the production version"
echo "  2. Deploy to the production server"
echo ""
echo -n "Are you sure you want to deploy? (type exactly 'YES' to confirm): "
read -r confirmation

if [ "$confirmation" != "YES" ]; then
    echo ""
    echo "Deployment cancelled. You must type exactly 'YES' to confirm."
    exit 1
fi

echo ""
echo "Building production version..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "Build failed! Deployment cancelled."
    exit 1
fi

echo ""
echo "Deploying to production server..."
rsync -avz --progress dist/new-upclient/browser/ enlinea.cloud:/var/www/html/uniformesprofesionales.mx/semprainfraestructura/

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================="
    echo "Deployment completed successfully!"
    echo "=================================="
    echo ""
    echo "Your application is now live at:"
    echo "https://uniformesprofesionales.mx/semprainfraestructura/"
    echo ""
else
    echo ""
    echo "Deployment failed!"
    exit 1
fi
