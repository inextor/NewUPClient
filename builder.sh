#!/bin/bash

# builder.sh - Production build script for NewUPClient
# Deployment target: uniformesprofesionales.mx/semprainfraestructura
# API endpoint: uniformesprofesionales.mx/semprainfraestructura/api

set -e  # Exit on any error

echo "=========================================="
echo "NewUPClient Production Build Script"
echo "=========================================="
echo ""
echo "Target: uniformesprofesionales.mx/semprainfraestructura"
echo "API: uniformesprofesionales.mx/semprainfraestructura/api"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Running npm install..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Clean previous build
if [ -d "dist" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf dist
    echo "✅ Previous build cleaned"
    echo ""
fi

# Run production build
echo "🔨 Building for production..."
echo ""
ng build --configuration=production

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Build completed successfully!"
    echo "=========================================="
    echo ""
    echo "Output directory: dist/new-upclient/browser"
    echo ""
    echo "📦 Build artifacts:"
    ls -lh dist/new-upclient/browser/
    echo ""
    echo "=========================================="
    echo "🚀 DEPLOYMENT CONFIRMATION"
    echo "=========================================="
    echo ""
    echo "Deploy to: enlinea.cloud:/var/www/html/uniformesprofesionales.mx/semprainfraestructura"
    echo ""
    echo "⚠️  WARNING: This will overwrite files on the production server!"
    echo ""
    echo -n "Type exactly 'YES' to deploy (anything else will exit): "
    read -r DEPLOY_CONFIRM
    echo ""

    if [ "$DEPLOY_CONFIRM" = "YES" ]; then
        echo "🚀 Deploying to production server..."
        echo ""

        # Deploy using rsync (without --delete to prevent file deletion)
        rsync -avz --progress dist/new-upclient/browser/ enlinea.cloud:/var/www/html/uniformesprofesionales.mx/semprainfraestructura/

        if [ $? -eq 0 ]; then
            echo ""
            echo "=========================================="
            echo "✅ Deployment completed successfully!"
            echo "=========================================="
            echo ""
            echo "🌐 Application URL: https://uniformesprofesionales.mx/semprainfraestructura"
            echo ""
        else
            echo ""
            echo "❌ Deployment failed!"
            exit 1
        fi
    else
        echo "❌ Deployment cancelled."
        echo "   You entered: '$DEPLOY_CONFIRM'"
        echo "   Expected: 'YES' (exact match)"
        echo ""
        echo "Build artifacts are available in: dist/new-upclient/browser/"
        exit 0
    fi
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
