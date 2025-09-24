# FigmaVision Quick Start Guide

## Instant Setup (Next Session)
```bash
# One command to start everything:
./START_FIGMAVISION.sh
```

## Current State (Ready to Go)
- ✅ **Plugin**: Perfect Medium hero grid generator
- ✅ **Service**: Visual helper on port 3001
- ✅ **Git**: Clean, all changes committed
- ✅ **Code**: Production-ready, documented

## What You Get
1. **1140×600px container** with perfect spacing
2. **Two auto-filling grids** side-by-side
3. **64 color squares each** (random vs organized)
4. **Visual feedback capture** via web service
5. **Auto-execution** on file save

## Memory Bank System
The `.memory-bank/` directory contains:
- `brief.md` - Project overview
- `product.md` - User goals and vision
- `context.md` - Current work focus
- `architecture.md` - System design
- `tech.md` - Technology stack

## File Structure
```
FigmaVision/
├── START_FIGMAVISION.sh    # ← Run this!
├── auto-exec/
│   ├── code.js            # Perfect Medium hero generator
│   └── manifest.json      # Plugin config
├── visual-helper/         # Service (port 3001)
├── .memory-bank/         # Session context
└── docs/                 # Documentation
```

## Workflow
1. Run `./START_FIGMAVISION.sh`
2. Import plugin: Figma → Plugins → Development → Import → `auto-exec/manifest.json`
3. Edit `auto-exec/code.js` (plugin auto-executes)
4. View results at `http://localhost:3001`
5. Export hero image for Medium article

## Auto-Layout Mastery
Key properties that make it work:
```javascript
// Container
container.primaryAxisAlignItems = 'CENTER';
container.counterAxisAlignItems = 'CENTER';

// Children
leftGrid.layoutGrow = 1;        // Fill space
leftGrid.layoutAlign = 'STRETCH'; // Full height
```

## Troubleshooting
- **Port 3001 busy**: `lsof -ti:3001 | xargs kill -9`
- **Plugin not working**: Re-import manifest.json
- **Missing dependencies**: `cd visual-helper && npm install`