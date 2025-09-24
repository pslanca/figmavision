# Technology Stack

## Figma Plugin (auto-exec/)
- **Language**: JavaScript (Figma Plugin API)
- **Execution**: Auto-runs on code.js file save
- **Key APIs**:
  - `figma.createFrame()`, `figma.createRectangle()`
  - Auto-layout: `layoutMode`, `layoutGrow`, `layoutAlign`
  - Color: HSL→RGB conversion, hue-based sorting
  - Selection: `figma.currentPage.selection`

## Visual Helper Service (visual-helper/)
- **Runtime**: Node.js + Express
- **Port**: 3001 (localhost only)
- **Features**:
  - Screenshot capture via macOS `screencapture`
  - Real-time monitoring (Server-Sent Events)
  - Web dashboard for image viewing
  - REST API for integration

## Development Tools
- **Version Control**: Git with clean commit history
- **IDE Integration**: Works with Figma for VS Code extension
- **Platform**: macOS (required for screen capture)

## Key Dependencies
```json
{
  "express": "Web server",
  "cors": "Cross-origin requests",
  "multer": "File uploads",
  "sharp": "Image processing (optional)"
}
```

## Auto-Layout Properties Reference
```javascript
// Container
layoutMode: 'HORIZONTAL' | 'VERTICAL'
primaryAxisSizingMode: 'FIXED' | 'AUTO'
counterAxisSizingMode: 'FIXED' | 'AUTO'
primaryAxisAlignItems: 'MIN' | 'CENTER' | 'MAX'

// Children
layoutGrow: 0 | 1  // Fill available space
layoutAlign: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH'
```