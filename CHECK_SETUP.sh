#!/bin/bash

echo "🔍 FigmaVision Setup Verification"
echo "================================="

# Check files exist
echo "📁 Checking core files..."
files=(
    "auto-exec/code.js"
    "auto-exec/manifest.json"
    "visual-helper/server.js"
    "visual-helper/package.json"
    "START_FIGMAVISION.sh"
    ".memory-bank/brief.md"
)

all_good=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
        all_good=false
    fi
done

# Check if node_modules exists
echo ""
echo "📦 Checking dependencies..."
if [ -d "visual-helper/node_modules" ]; then
    echo "✅ visual-helper/node_modules (dependencies installed)"
else
    echo "⚠️  visual-helper/node_modules missing"
    echo "   Run: cd visual-helper && npm install"
fi

# Check git status
echo ""
echo "📋 Git status..."
if git status --porcelain | grep -q .; then
    echo "⚠️  Uncommitted changes:"
    git status --porcelain
else
    echo "✅ Git clean, all changes committed"
fi

# Check current branch
current_branch=$(git branch --show-current)
echo "✅ Current branch: $current_branch"

# Memory bank check
echo ""
echo "🧠 Memory bank status..."
memory_files=(
    ".memory-bank/brief.md"
    ".memory-bank/product.md"
    ".memory-bank/context.md"
    ".memory-bank/architecture.md"
    ".memory-bank/tech.md"
)

for file in "${memory_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
        all_good=false
    fi
done

echo ""
if [ "$all_good" = true ]; then
    echo "🎉 SETUP COMPLETE - READY FOR NEXT SESSION!"
    echo ""
    echo "🚀 To start everything: ./START_FIGMAVISION.sh"
else
    echo "⚠️  Some issues found - please resolve before next session"
fi