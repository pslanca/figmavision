#!/usr/bin/env node

// CLI tool for quick screen captures
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const execPromise = util.promisify(exec);

async function capture(type = 'screen') {
  const timestamp = Date.now();
  const capturesDir = path.join(__dirname, 'captures');

  // Ensure directory exists
  await fs.mkdir(capturesDir, { recursive: true });

  if (type === 'interactive') {
    // Interactive capture - user selects area
    const filename = `interactive_${timestamp}.png`;
    const filepath = path.join(capturesDir, filename);

    console.log('📸 Click and drag to select area to capture...');
    await execPromise(`screencapture -i -x "${filepath}"`);
    console.log(`✓ Saved to: ${filename}`);

  } else if (type === 'figma') {
    // Capture Figma window specifically
    const filename = `figma_${timestamp}.png`;
    const filepath = path.join(capturesDir, filename);

    try {
      // Bring Figma to front and capture
      const script = `
        tell application "Figma"
          activate
          delay 0.5
        end tell
      `;
      await execPromise(`osascript -e '${script.replace(/\n/g, ' ')}'`);
      await execPromise(`screencapture -x "${filepath}"`);
      console.log(`✓ Figma captured: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to capture Figma:', error.message);
    }

  } else {
    // Full screen capture
    const filename = `screen_${timestamp}.png`;
    const filepath = path.join(capturesDir, filename);

    await execPromise(`screencapture -x "${filepath}"`);
    console.log(`✓ Screen captured: ${filename}`);
  }

  // Open captures folder
  await execPromise(`open "${capturesDir}"`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const type = args[0] || 'screen';

console.log('🎬 Figma Visual Capture Tool');
console.log('----------------------------');

capture(type).catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});

// Show usage if help requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node capture-cli.js [type]

Types:
  screen      - Capture entire screen (default)
  interactive - Click and drag to select area
  figma       - Capture Figma window

Examples:
  node capture-cli.js                  # Full screen
  node capture-cli.js interactive      # Select area
  node capture-cli.js figma           # Figma window
`);
  process.exit(0);
}