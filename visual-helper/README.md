# 🎨 Figma Visual Helper Service

A local service that provides visual feedback to AI assistants working with Figma designs. This bridges the gap between what the AI can programmatically access and what's actually visible on screen.

## 🚀 The Problem It Solves

When AI assistants (like Claude) work with Figma plugins, they're essentially "blind" - they can only see:
- Node properties (x, y, width, height)
- Colors as RGB values
- Text content
- Layer structure

But they CAN'T see:
- The actual visual result
- How elements look together
- If colors clash
- If layouts are balanced
- Overlapping elements visually

This service solves that by capturing screenshots and providing visual feedback!

## 🛠 Architecture

```
┌─────────────────────┐       ┌──────────────────────┐
│                     │       │                      │
│   Figma Plugin      │──────►│  Visual Helper       │
│   (code.js)         │       │  Service (Port 3001) │
│                     │       │                      │
└─────────────────────┘       └──────────────────────┘
         │                              │
         │ exportAsync()                │ Screenshot
         ▼                              ▼
   ┌──────────────┐            ┌──────────────┐
   │ Base64 Images│            │ PNG Files    │
   └──────────────┘            └──────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │ AI Assistant     │
                              │ (Analyzes Images)│
                              └──────────────────┘
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Create captures directory
mkdir captures

# Start the service
npm start
```

## 🎯 Features

### 1. **Screen Capture**
- Full screen capture
- Figma window specific capture
- Interactive area selection
- Automatic file management

### 2. **Figma Plugin Integration**
The plugin can export elements and send them to the service:

```javascript
// In your Figma plugin
const bytes = await node.exportAsync({ format: 'PNG' });
const base64 = btoa(String.fromCharCode(...bytes));

fetch('http://localhost:3001/visual-feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    exports: [{ name, image: base64 }],
    viewport: figma.viewport.bounds
  })
});
```

### 3. **Real-time Monitoring**
Connect to the SSE endpoint for continuous screenshots:

```javascript
const eventSource = new EventSource('http://localhost:3001/monitor');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('New capture:', data.url);
};
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/capture` | POST | Capture current screen or Figma window |
| `/visual-feedback` | POST | Receive exports from Figma plugin |
| `/history` | GET | Get recent captures |
| `/monitor` | GET | Real-time monitoring (SSE) |
| `/compare` | POST | Compare two images |
| `/health` | GET | Service health check |

## 💡 Usage Examples

### Quick Capture from Terminal

```bash
# Full screen
node capture-cli.js

# Interactive selection
node capture-cli.js interactive

# Figma window
node capture-cli.js figma
```

### From Another Service

```javascript
// Capture screen
const response = await fetch('http://localhost:3001/capture', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ target: 'figma' })
});

const { url } = await response.json();
console.log('Screenshot available at:', url);
```

## 🔮 Future Enhancements

### AI Vision Integration
```javascript
// Planned: Integrate with vision APIs
async function analyzeWithAI(imagePath) {
  // Could use:
  // - OpenAI Vision API
  // - Google Cloud Vision
  // - AWS Rekognition
  // - Local ML models (YOLO, etc.)

  return {
    description: "A color palette with 12 swatches",
    elements: ["grid", "cards", "text"],
    issues: ["overlap detected", "low contrast"],
    suggestions: ["increase spacing", "adjust colors"]
  };
}
```

### Visual Regression Testing
```javascript
// Planned: Compare designs over time
const differences = await compareImages(before, after);
if (differences.percentage > 5) {
  console.log('Significant visual changes detected!');
}
```

## 🤖 How AI Assistants Can Use This

1. **Before making changes**: Capture current state
2. **After changes**: Capture new state
3. **Compare**: Check if changes had desired effect
4. **Iterate**: Adjust based on visual feedback

Example workflow:
```javascript
// 1. Capture before state
await captureScreen();

// 2. Make changes in Figma
await createColorGrid();

// 3. Capture after state
await captureScreen();

// 4. Analyze results
const analysis = await analyzeChanges();
console.log('Visual changes:', analysis);
```

## 🚨 Security Considerations

- Service runs locally only (localhost)
- No external connections by default
- Screenshots stored locally
- Add authentication if exposing to network

## 📝 Notes

- **macOS only**: Uses native `screencapture` command
- **Permissions**: Grant screen recording permission in System Preferences
- **Performance**: Lower resolution exports for faster processing
- **Storage**: Clean up old captures periodically

## 🎯 Real-World Use Case

When I (the AI assistant) create a color grid in Figma:

1. I create frames and set RGB values
2. But I can't see if colors look good together
3. The Visual Helper captures the result
4. I could then analyze the image to understand:
   - Color harmony
   - Visual balance
   - Spacing issues
   - Overlapping elements

This creates a feedback loop that helps me improve designs iteratively!

## 🔗 Integration with FigmaVision

Add to your Figma plugin to enable visual feedback:

```javascript
// After creating elements
setTimeout(async () => {
  const captures = await captureVisualFeedback();
  console.log('Visual feedback captured:', captures.length);
}, 1000);
```

## 📊 Metrics & Monitoring

The service tracks:
- Number of captures
- Processing time
- Storage usage
- API calls
- Error rates

Access metrics at: `http://localhost:3001/health`

---

**Built to give AI assistants eyes in the design world! 👁️**