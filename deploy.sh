#!/bin/bash

# Deployment script for production server
# This script builds and deploys the application to production

echo "=================================="
echo "Production Deployment Script"
echo "=================================="
echo ""
echo "Select deployment target:"
echo "  1) semprainfraestructura"
echo "  2) store"
echo ""
echo -n "Enter choice (1 or 2): "
read -r choice

case $choice in
    1)
        TARGET="semprainfraestructura"
        ;;
    2)
        TARGET="store"
        ;;
    *)
        echo ""
        echo "Invalid choice. Deployment cancelled."
        exit 1
        ;;
esac

echo ""
echo "Target: enlinea.cloud:/var/www/html/uniformesprofesionales.mx/${TARGET}/"
echo ""
echo "This will:"
echo "  1. Build the production version with baseHref /${TARGET}/"
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
echo "Building production version for /${TARGET}/..."
ng build --base-href "/${TARGET}/"

if [ $? -ne 0 ]; then
    echo ""
    echo "Build failed! Deployment cancelled."
    exit 1
fi

echo ""
echo "Deploying to production server..."
rsync -avz --progress dist/new-upclient/browser/ "enlinea.cloud:/var/www/html/uniformesprofesionales.mx/${TARGET}/"

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================="
    echo "Deployment completed successfully!"
    echo "=================================="
    echo ""
    echo "Your application is now live at:"
    echo "https://uniformesprofesionales.mx/${TARGET}/"
    echo ""
else
    echo ""
    echo "Deployment failed!"
    exit 1
fi
