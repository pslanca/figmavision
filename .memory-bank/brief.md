# FigmaVision Project Brief

## Overview
FigmaVision is an intelligent Figma plugin system that gives AI assistants visual awareness of their design creations. It bridges the gap between programmatic design generation and visual understanding.

## Core Problem Solved
AI assistants can manipulate Figma designs programmatically but are "blind" to their visual output. They can set RGB values but can't see if colors harmonize, position elements but can't detect visual overlaps.

## Current Status
- ✅ **Production-ready Medium hero grid generator** (1140×600px, perfect auto-layout)
- ✅ **Clean, streamlined codebase** (single working plugin)
- ✅ **Visual helper service** for screenshot capture and analysis
- ✅ **Auto-executing plugin** that runs on file save
- ✅ **Perfect git history** with working configurations

## Key Components
1. **auto-exec/**: Single Figma plugin with Medium hero grid generator
2. **visual-helper/**: Local service for visual feedback (port 3001)
3. **docs/**: Documentation including Medium article content
4. **Perfect auto-layout implementation** with layoutGrow and CENTER alignment

## Ready State
Everything is configured and ready for immediate use - plugin works, services can start, git is clean.