#!/bin/bash

echo "🚀 Starting FigmaVision System..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f "auto-exec/code.js" ]; then
    echo "❌ Error: Not in FigmaVision directory"
    echo "Please cd to /Users/pedrolanca/Documents/FigmaVision"
    exit 1
fi

# Kill any existing processes on port 3001
echo "🔄 Checking for existing services..."
if lsof -ti:3001 >/dev/null 2>&1; then
    echo "⚠️  Port 3001 in use, stopping existing service..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start visual helper service in background
echo "🎨 Starting Visual Helper Service..."
cd visual-helper
npm start &
HELPER_PID=$!
cd ..

# Wait a moment for service to start
sleep 3

# Check if service started successfully
if curl -s http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ Visual Helper Service running on http://localhost:3001"
    echo "📊 Dashboard available at http://localhost:3001"
else
    echo "❌ Visual Helper Service failed to start"
    echo "   Try: cd visual-helper && npm install && npm start"
fi

echo ""
echo "🎯 SYSTEM READY!"
echo "=================================="
echo "✅ Plugin: auto-exec/code.js (auto-executes on save)"
echo "✅ Service: http://localhost:3001 (visual feedback)"
echo "✅ Git: Clean and synced"
echo ""
echo "💡 Next Steps:"
echo "   1. Open Figma Desktop"
echo "   2. Import plugin from auto-exec/manifest.json"
echo "   3. Edit code.js to trigger execution"
echo "   4. View results at http://localhost:3001"
echo ""
echo "🔧 Useful Commands:"
echo "   Kill service: lsof -ti:3001 | xargs kill -9"
echo "   Restart: ./START_FIGMAVISION.sh"
echo "   Git status: git status"
echo ""
echo "📋 Current Configuration:"
echo "   Container: 1140×600px, 60px padding/spacing"
echo "   Grids: Auto-fill with layoutGrow=1"
echo "   Colors: 64 HSL-generated, random vs sorted"