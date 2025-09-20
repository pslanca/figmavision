// Visual Helper Service - Captures screens and provides visual feedback to AI
// This runs locally and bridges the visual gap for AI-assisted design

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const screenshot = require('screenshot-desktop');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/captures', express.static('captures'));
app.use(express.static(__dirname));

// Store for visual feedback
const visualHistory = [];

// macOS Screenshot using native screencapture command
async function captureScreen() {
  const timestamp = Date.now();
  const filename = `screen_${timestamp}.png`;
  const filepath = path.join(__dirname, 'captures', filename);

  try {
    // Ensure captures directory exists
    await fs.mkdir(path.join(__dirname, 'captures'), { recursive: true });

    // Use macOS native screencapture command
    // -i: interactive mode (select area)
    // -x: no sound
    // -r: capture to clipboard
    // Without -i: captures entire screen
    await execPromise(`screencapture -x "${filepath}"`);

    console.log(`📸 Screen captured: ${filename}`);
    return { filename, filepath, timestamp };
  } catch (error) {
    console.error('Screenshot failed:', error);

    // Fallback to screenshot-desktop package
    try {
      const img = await screenshot({ format: 'png' });
      await fs.writeFile(filepath, img);
      console.log(`📸 Screen captured (fallback): ${filename}`);
      return { filename, filepath, timestamp };
    } catch (fallbackError) {
      console.error('Fallback screenshot also failed:', fallbackError);
      throw fallbackError;
    }
  }
}

// Capture specific Figma window
async function captureFigmaWindow() {
  const timestamp = Date.now();
  const filename = `figma_${timestamp}.png`;
  const filepath = path.join(__dirname, 'captures', filename);

  try {
    await fs.mkdir(path.join(__dirname, 'captures'), { recursive: true });

    // Use AppleScript to find and capture Figma window
    const script = `
      tell application "System Events"
        tell process "Figma"
          set frontmost to true
          delay 0.5
        end tell
      end tell
      do shell script "screencapture -x -l$(osascript -e 'tell app \\"Figma\\" to id of window 1') \\"${filepath}\\""
    `;

    await execPromise(`osascript -e '${script.replace(/\n/g, ' ')}'`);

    console.log(`🎨 Figma window captured: ${filename}`);
    return { filename, filepath, timestamp, app: 'Figma' };
  } catch (error) {
    console.error('Figma capture failed, falling back to full screen:', error);
    return captureScreen();
  }
}

// Analyze image for spatial information
async function analyzeImage(filepath) {
  // This could integrate with image analysis APIs
  // For now, return basic metadata
  const stats = await fs.stat(filepath);
  return {
    size: stats.size,
    created: stats.birthtime,
    analysis: {
      // Placeholder for AI vision analysis
      // Could integrate with OpenAI Vision, Google Vision API, etc.
      description: 'Image captured successfully',
      elements: [],
      colors: [],
      layout: 'unknown'
    }
  };
}

// Routes

// Serve dashboard at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Capture current screen
app.post('/capture', async (req, res) => {
  try {
    const { target = 'screen' } = req.body;

    const capture = target === 'figma'
      ? await captureFigmaWindow()
      : await captureScreen();

    const analysis = await analyzeImage(capture.filepath);

    visualHistory.push({
      ...capture,
      analysis,
      url: `/captures/${capture.filename}`
    });

    res.json({
      success: true,
      capture: {
        ...capture,
        analysis,
        url: `/captures/${capture.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Receive visual feedback from Figma plugin
app.post('/visual-feedback', async (req, res) => {
  try {
    const { exports, viewport, timestamp } = req.body;

    // Save each exported image
    const saved = [];
    for (const item of exports) {
      const filename = `figma_export_${timestamp}_${item.name.replace(/[^a-z0-9]/gi, '_')}.png`;
      const filepath = path.join(__dirname, 'captures', filename);

      // Decode base64 and save
      const buffer = Buffer.from(item.image.replace('...', ''), 'base64');
      await fs.writeFile(filepath, buffer);

      saved.push({
        ...item,
        filename,
        url: `/captures/${filename}`
      });
    }

    visualHistory.push({
      type: 'figma-export',
      timestamp,
      viewport,
      items: saved
    });

    console.log(`📦 Received ${exports.length} Figma exports`);

    res.json({
      success: true,
      saved: saved.length,
      urls: saved.map(s => s.url)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get visual history
app.get('/history', (req, res) => {
  res.json({
    total: visualHistory.length,
    history: visualHistory.slice(-10) // Last 10 captures
  });
});

// Real-time monitoring endpoint
app.get('/monitor', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Send screenshots periodically
  const interval = setInterval(async () => {
    try {
      const capture = await captureFigmaWindow();
      res.write(`data: ${JSON.stringify({
        event: 'capture',
        ...capture,
        url: `/captures/${capture.filename}`
      })}\n\n`);
    } catch (error) {
      res.write(`data: ${JSON.stringify({
        event: 'error',
        error: error.message
      })}\n\n`);
    }
  }, 5000); // Every 5 seconds

  req.on('close', () => {
    clearInterval(interval);
  });
});

// Comparison endpoint for visual regression
app.post('/compare', async (req, res) => {
  const { before, after } = req.body;

  // This could use image comparison libraries like pixelmatch
  // For now, return placeholder
  res.json({
    similarity: 0.95,
    differences: [],
    analysis: 'Images are visually similar'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'running',
    captures: visualHistory.length,
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Visual Helper Service running on http://localhost:${PORT}`);
  console.log('📸 Ready to capture screens and provide visual feedback');
  console.log('\nEndpoints:');
  console.log('  POST /capture - Capture current screen');
  console.log('  POST /visual-feedback - Receive Figma exports');
  console.log('  GET /history - View capture history');
  console.log('  GET /monitor - Real-time monitoring (SSE)');
  console.log('  POST /compare - Compare two images');
  console.log('  GET /health - Service health check');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Visual Helper Service');
  process.exit(0);
});