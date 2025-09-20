// Extract and display colors from DS19 library in a grid

// Advanced collision detection using AABB algorithm
function checkCollision(boundsA, boundsB) {
  if (!boundsA || !boundsB) return false;

  return !(
    boundsA.x + boundsA.width < boundsB.x ||
    boundsB.x + boundsB.width < boundsA.x ||
    boundsA.y + boundsA.height < boundsB.y ||
    boundsB.y + boundsB.height < boundsA.y
  );
}

// Get intersection area between two bounds
function getIntersection(boundsA, boundsB) {
  if (!boundsA || !boundsB) return null;

  const x = Math.max(boundsA.x, boundsB.x);
  const y = Math.max(boundsA.y, boundsB.y);
  const right = Math.min(boundsA.x + boundsA.width, boundsB.x + boundsB.width);
  const bottom = Math.min(boundsA.y + boundsA.height, boundsB.y + boundsB.height);

  if (x < right && y < bottom) {
    return {
      x: x,
      y: y,
      width: right - x,
      height: bottom - y
    };
  }

  return null;
}

// Document scanner - analyzes entire page structure
function scanDocument() {
  const pageAnalysis = {
    totalElements: 0,
    elementTypes: {},
    spatialZones: [],
    colorPalette: new Map(),
    textStyles: new Map(),
    componentInstances: [],
    libraryElements: []
  };

  // Recursive function to analyze node tree
  function analyzeNode(node, depth = 0) {
    pageAnalysis.totalElements++;

    // Count element types
    pageAnalysis.elementTypes[node.type] = (pageAnalysis.elementTypes[node.type] || 0) + 1;

    // Analyze colors
    if ('fills' in node && node.fills && node.fills.length > 0) {
      node.fills.forEach(fill => {
        if (fill.type === 'SOLID') {
          const colorKey = `${fill.color.r.toFixed(2)}-${fill.color.g.toFixed(2)}-${fill.color.b.toFixed(2)}`;
          const count = pageAnalysis.colorPalette.get(colorKey) || 0;
          pageAnalysis.colorPalette.set(colorKey, count + 1);
        }
      });
    }

    // Analyze text styles
    if (node.type === 'TEXT') {
      const styleKey = `${node.fontSize}-${node.fontName.family}-${node.fontName.style}`;
      const count = pageAnalysis.textStyles.get(styleKey) || 0;
      pageAnalysis.textStyles.set(styleKey, count + 1);
    }

    // Track component instances
    if (node.type === 'INSTANCE') {
      pageAnalysis.componentInstances.push({
        name: node.name,
        mainComponentId: node.mainComponent?.id,
        bounds: node.absoluteBoundingBox
      });
    }

    // Track library elements
    if (node.remote) {
      pageAnalysis.libraryElements.push({
        name: node.name,
        type: node.type,
        key: node.key
      });
    }

    // Recursively analyze children
    if ('children' in node && node.children) {
      node.children.forEach(child => analyzeNode(child, depth + 1));
    }
  }

  // Start analysis
  figma.currentPage.children.forEach(node => analyzeNode(node));

  // Identify spatial zones (quadrants)
  const viewport = figma.viewport.bounds;
  pageAnalysis.spatialZones = [
    { name: 'top-left', x: viewport.x, y: viewport.y, width: viewport.width/2, height: viewport.height/2 },
    { name: 'top-right', x: viewport.x + viewport.width/2, y: viewport.y, width: viewport.width/2, height: viewport.height/2 },
    { name: 'bottom-left', x: viewport.x, y: viewport.y + viewport.height/2, width: viewport.width/2, height: viewport.height/2 },
    { name: 'bottom-right', x: viewport.x + viewport.width/2, y: viewport.y + viewport.height/2, width: viewport.width/2, height: viewport.height/2 }
  ];

  return pageAnalysis;
}

// Extract and display colors from DS19 library in a grid

// Find a clear area on the canvas using advanced spatial analysis
function findClearSpace(width, height) {
  const nodes = figma.currentPage.children;
  const occupiedAreas = [];

  // Collect all occupied areas with render bounds for accuracy
  nodes.forEach(node => {
    if ('absoluteBoundingBox' in node && node.visible !== false) {
      // Use render bounds if available for more accurate collision detection
      const bounds = node.absoluteRenderBounds || node.absoluteBoundingBox;
      if (bounds) {
        occupiedAreas.push({
          x: bounds.x,
          y: bounds.y,
          right: bounds.x + bounds.width,
          bottom: bounds.y + bounds.height,
          width: bounds.width,
          height: bounds.height,
          name: node.name,
          node: node
        });
      }
    }
  });

  console.log(`Document scan: ${occupiedAreas.length} visible elements found`);

  // If no elements exist, start at origin
  if (occupiedAreas.length === 0) {
    return { x: 100, y: 100, zone: 'empty-canvas' };
  }

  // Strategy 1: Try to find gaps between existing elements
  const padding = 100;
  const proposedBounds = { x: 0, y: 0, width: width, height: height };

  // Sort areas by position for systematic scanning
  const sortedByX = [...occupiedAreas].sort((a, b) => a.x - b.x);
  const sortedByY = [...occupiedAreas].sort((a, b) => a.y - b.y);

  // Find vertical gaps
  for (let i = 0; i < sortedByY.length - 1; i++) {
    const current = sortedByY[i];
    const next = sortedByY[i + 1];
    const gapStart = current.bottom + padding;
    const gapEnd = next.y - padding;

    if (gapEnd - gapStart >= height) {
      // Found a vertical gap
      proposedBounds.x = current.x;
      proposedBounds.y = gapStart;

      // Check if this position has any collisions
      const hasCollision = occupiedAreas.some(area =>
        checkCollision(proposedBounds, area)
      );

      if (!hasCollision) {
        console.log(`Found vertical gap at (${proposedBounds.x}, ${proposedBounds.y})`);
        return { x: proposedBounds.x, y: proposedBounds.y, zone: 'vertical-gap' };
      }
    }
  }

  // Strategy 2: Place above all content
  const topmost = sortedByY[0];
  proposedBounds.y = topmost.y - height - padding;
  proposedBounds.x = topmost.x;

  if (proposedBounds.y > -3000) { // Reasonable vertical limit
    const hasCollision = occupiedAreas.some(area =>
      checkCollision(proposedBounds, area)
    );

    if (!hasCollision) {
      console.log(`Placing above content at (${proposedBounds.x}, ${proposedBounds.y})`);
      return { x: proposedBounds.x, y: proposedBounds.y, zone: 'above' };
    }
  }

  // Strategy 3: Place to the right of all content
  const rightmost = sortedByX[sortedByX.length - 1];
  proposedBounds.x = rightmost.right + padding;
  proposedBounds.y = rightmost.y;

  console.log(`Placing to the right at (${proposedBounds.x}, ${proposedBounds.y})`);
  return { x: proposedBounds.x, y: proposedBounds.y, zone: 'right' };
}

async function createColorShowcase() {
  try {
    console.log('Starting DS19 color extraction...');
    console.log('Note: Only library styles that have been used in the document will appear.');
    console.log('To see all DS19 colors, first use them in your design.');

    // Perform document analysis first
    console.log('\n📊 Document Analysis:');
    const analysis = scanDocument();
    console.log(`- Total elements: ${analysis.totalElements}`);
    console.log(`- Element types: ${Object.entries(analysis.elementTypes).map(([type, count]) => `${type}(${count})`).join(', ')}`);
    console.log(`- Unique colors found: ${analysis.colorPalette.size}`);
    console.log(`- Text styles: ${analysis.textStyles.size}`);
    console.log(`- Component instances: ${analysis.componentInstances.length}`);
    console.log(`- Library elements: ${analysis.libraryElements.length}`);

    // Get all paint styles (includes library styles that are loaded)
    const paintStyles = figma.getLocalPaintStyles();
    console.log(`Found ${paintStyles.length} paint styles (local + imported library styles)`);

    // Get color variables
    const variables = figma.variables.getLocalVariables('COLOR');
    console.log(`Found ${variables.length} color variables`);

    // Try to access library collections if available
    let libraryColors = [];
    try {
      // Note: This requires 'teamlibrary' permission in manifest.json
      if (figma.teamLibrary && figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync) {
        const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
        console.log(`Found ${collections.length} library variable collections`);

        for (const collection of collections) {
          if (collection.libraryName && collection.libraryName.includes('DS19')) {
            console.log(`Found DS19 collection: ${collection.libraryName}`);
            try {
              const vars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collection.key);
              libraryColors = libraryColors.concat(vars);
            } catch (e) {
              console.log(`Could not access variables in ${collection.libraryName}:`, e);
            }
          }
        }
      }
    } catch (error) {
      console.log('Library access not available. Add "teamlibrary" to manifest permissions to access library colors directly.');
    }

    // Find clear space for the grid (estimate 850x400 for the grid)
    const position = findClearSpace(850, 400);
    console.log(`Placing color showcase at x:${position.x}, y:${position.y}`);

    // Create the main container with improved styling
    const gridFrame = figma.createFrame();
    gridFrame.name = "DS19 Color Showcase";
    gridFrame.x = position.x;
    gridFrame.y = position.y;
    gridFrame.layoutMode = 'VERTICAL';
    gridFrame.itemSpacing = 32;
    gridFrame.paddingTop = 40;
    gridFrame.paddingBottom = 40;
    gridFrame.paddingLeft = 40;
    gridFrame.paddingRight = 40;
    gridFrame.fills = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}];
    gridFrame.cornerRadius = 16;
    gridFrame.primaryAxisSizingMode = 'AUTO';
    gridFrame.counterAxisSizingMode = 'AUTO';

    // Add subtle shadow for elevation
    gridFrame.effects = [{
      type: 'DROP_SHADOW',
      color: {r: 0, g: 0, b: 0, a: 0.08},
      offset: {x: 0, y: 4},
      radius: 24,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL'
    }];

    // Create header section with title and metadata
    const headerFrame = figma.createFrame();
    headerFrame.name = "Header";
    headerFrame.layoutMode = 'VERTICAL';
    headerFrame.itemSpacing = 8;
    headerFrame.primaryAxisSizingMode = 'FIXED';
    headerFrame.counterAxisSizingMode = 'AUTO';
    headerFrame.resize(720, 60);
    headerFrame.fills = [];

    // Add title
    const title = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    title.fontName = { family: "Inter", style: "Bold" };
    title.characters = "DS19 Color Library";
    title.fontSize = 32;
    title.fills = [{type: 'SOLID', color: {r: 0.1, g: 0.1, b: 0.1}}];
    headerFrame.appendChild(title);

    // Add subtitle with count
    const subtitle = figma.createText();
    subtitle.fontName = { family: "Inter", style: "Regular" };
    subtitle.characters = `Displaying colors from your design system`;
    subtitle.fontSize = 14;
    subtitle.fills = [{type: 'SOLID', color: {r: 0.4, g: 0.4, b: 0.4}}];
    subtitle.opacity = 0.8;
    headerFrame.appendChild(subtitle);

    gridFrame.appendChild(headerFrame);

    // Add divider
    const divider = figma.createFrame();
    divider.name = "Divider";
    divider.resize(720, 1);
    divider.fills = [{type: 'SOLID', color: {r: 0.9, g: 0.9, b: 0.9}}];
    gridFrame.appendChild(divider);

    // Create sections for different color types
    const sectionsContainer = figma.createFrame();
    sectionsContainer.name = "Sections";
    sectionsContainer.layoutMode = 'VERTICAL';
    sectionsContainer.itemSpacing = 32;
    sectionsContainer.primaryAxisSizingMode = 'AUTO';
    sectionsContainer.counterAxisSizingMode = 'AUTO';
    sectionsContainer.fills = [];

    // Create color grid container
    const colorRow = figma.createFrame();
    colorRow.name = "Color Grid";
    colorRow.layoutMode = 'HORIZONTAL';
    colorRow.layoutWrap = 'WRAP';
    colorRow.itemSpacing = 12;
    colorRow.counterAxisSpacing = 12;
    colorRow.primaryAxisSizingMode = 'FIXED';
    colorRow.counterAxisSizingMode = 'AUTO';
    colorRow.resize(720, 100); // Width fixed, height will auto-expand
    sectionsContainer.appendChild(colorRow);

    gridFrame.appendChild(sectionsContainer);

    let colorCount = 0;
    const processedColors = new Set(); // Avoid duplicates

    // Process paint styles
    for (const style of paintStyles) {
      try {
        const styleName = style.name;
        const styleInfo = {
          name: styleName,
          key: style.key || 'local',
          isLibrary: style.key && style.key !== '',
          remote: style.remote || false
        };

        console.log(`Style: ${styleName}, Library: ${styleInfo.isLibrary}, Key: ${styleInfo.key}`);

        if (style.paints && style.paints.length > 0) {
          const paint = style.paints[0];
          if (paint.type === 'SOLID') {
            const colorKey = `${paint.color.r.toFixed(3)}-${paint.color.g.toFixed(3)}-${paint.color.b.toFixed(3)}`;

            // Add all colors, marking library vs local
            if (!processedColors.has(colorKey)) {
              processedColors.add(colorKey);

              const displayName = styleInfo.isLibrary ? `📚 ${styleName}` : styleName;
              const colorCard = createColorCard(displayName, paint.color);
              await finalizeColorCard(colorCard, displayName, paint.color);
              colorRow.appendChild(colorCard);
              colorCount++;
            }
          }
        }
      } catch (err) {
        console.log('Error processing style:', err);
      }
    }

    // Process color variables
    for (const variable of variables) {
      try {
        const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
        if (collection) {
          const value = variable.valuesByMode[collection.defaultModeId];

          if (value && typeof value === 'object' && 'r' in value) {
            const colorKey = `${value.r}-${value.g}-${value.b}`;

            if (!processedColors.has(colorKey)) {
              processedColors.add(colorKey);

              const colorCard = createColorCard(variable.name, value);
              await finalizeColorCard(colorCard, variable.name, value);
              colorRow.appendChild(colorCard);
              colorCount++;
            }
          }
        }
      } catch (err) {
        console.log('Error processing variable:', variable.name, err);
      }
    }

    // If no colors found from styles/variables, scan the document
    if (colorCount === 0) {
      const infoText = figma.createText();
      infoText.characters = "No library colors loaded. Showing document colors:";
      infoText.fontSize = 14;
      infoText.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}}];
      gridFrame.appendChild(infoText);

      // Find unique colors in document
      const nodesWithFills = figma.currentPage.findAll(node =>
        'fills' in node && node.fills && node.fills.length > 0
      );

      const uniqueColors = new Map();
      nodesWithFills.forEach(node => {
        if (node.fills) {
          node.fills.forEach(fill => {
            if (fill.type === 'SOLID' && fill.visible !== false) {
              const key = `${fill.color.r.toFixed(3)}-${fill.color.g.toFixed(3)}-${fill.color.b.toFixed(3)}`;
              if (!uniqueColors.has(key)) {
                uniqueColors.set(key, {
                  color: fill.color,
                  nodeName: node.name
                });
              }
            }
          });
        }
      });

      // Display document colors
      if (uniqueColors.size > 0) {
        for (const [key, data] of uniqueColors) {
          const colorCard = createColorCard(data.nodeName || 'Unnamed', data.color);
          await finalizeColorCard(colorCard, data.nodeName || 'Document Color', data.color);
          colorRow.appendChild(colorCard);
          colorCount++;
        }
      }
    }

    // Add instructions if applicable
    if (paintStyles.length === 0 && variables.length === 0) {
      const helpText = figma.createText();
      helpText.characters = "\nTip: To load DS19 colors:\n";
      helpText.characters += "1. Open Assets panel (left sidebar)\n";
      helpText.characters += "2. Find DS19 library\n";
      helpText.characters += "3. Use a color from DS19 in your design\n";
      helpText.characters += "4. Re-run this plugin";
      helpText.fontSize = 12;
      helpText.fills = [{type: 'SOLID', color: {r: 0.3, g: 0.3, b: 0.3}}];
      gridFrame.appendChild(helpText);
    }

    // Update subtitle with actual count
    const subtitleText = gridFrame.findChild(node =>
      node.type === 'TEXT' && node.characters.includes('Displaying colors'));
    if (subtitleText && subtitleText.type === 'TEXT') {
      subtitleText.characters = `Displaying ${colorCount} colors from your design system`;
    }

    // Select and zoom to the grid
    figma.currentPage.selection = [gridFrame];
    figma.viewport.scrollAndZoomIntoView([gridFrame]);

    figma.notify(`📊 Created color showcase with ${colorCount} colors`);

  } catch (error) {
    console.error('Error creating color showcase:', error);
    figma.notify('Error: ' + error.message, {error: true});
  }
}

function createColorCard(name, color) {
  const card = figma.createFrame();
  card.name = name;
  card.resize(170, 140);
  card.layoutMode = 'VERTICAL';
  card.itemSpacing = 0;
  card.paddingTop = 0;
  card.paddingBottom = 0;
  card.paddingLeft = 0;
  card.paddingRight = 0;
  card.fills = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}];
  card.cornerRadius = 12;
  card.clipsContent = true;
  card.effects = [{
    type: 'DROP_SHADOW',
    color: {r: 0, g: 0, b: 0, a: 0.04},
    offset: {x: 0, y: 1},
    radius: 3,
    visible: true,
    blendMode: 'NORMAL'
  }, {
    type: 'DROP_SHADOW',
    color: {r: 0, g: 0, b: 0, a: 0.06},
    offset: {x: 0, y: 4},
    radius: 8,
    visible: true,
    blendMode: 'NORMAL'
  }];

  // Color swatch - larger and more prominent
  const swatch = figma.createFrame();
  swatch.name = "Swatch";
  swatch.resize(170, 90);
  swatch.fills = [{type: 'SOLID', color: color}];
  swatch.cornerRadius = 0;
  card.appendChild(swatch);

  // Create info container for text
  const infoContainer = figma.createFrame();
  infoContainer.name = "Info";
  infoContainer.layoutMode = 'VERTICAL';
  infoContainer.itemSpacing = 4;
  infoContainer.paddingTop = 12;
  infoContainer.paddingBottom = 12;
  infoContainer.paddingLeft = 12;
  infoContainer.paddingRight = 12;
  infoContainer.primaryAxisSizingMode = 'FIXED';
  infoContainer.counterAxisSizingMode = 'AUTO';
  infoContainer.resize(170, 50);
  infoContainer.fills = [];
  card.appendChild(infoContainer);

  return card;
}

async function finalizeColorCard(card, name, color) {
  const infoContainer = card.findChild(node => node.name === "Info");

  // Add text label with better typography
  const label = figma.createText();
  label.fontName = { family: "Inter", style: "Medium" };
  const displayName = name.length > 22 ? name.substring(0, 22) + '...' : name;
  label.characters = displayName;
  label.fontSize = 12;
  label.fills = [{type: 'SOLID', color: {r: 0.1, g: 0.1, b: 0.1}}];
  label.textTruncation = 'ENDING';
  label.resize(146, 20);
  infoContainer.appendChild(label);

  // Add hex value with monospace feel
  const hex = rgbToHex(color);
  const hexLabel = figma.createText();
  hexLabel.fontName = { family: "Inter", style: "Regular" };
  hexLabel.characters = hex.toUpperCase();
  hexLabel.fontSize = 11;
  hexLabel.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}}];
  hexLabel.letterSpacing = {value: 0.5, unit: 'PIXELS'};
  infoContainer.appendChild(hexLabel);
}

function rgbToHex(color) {
  const toHex = (val) => {
    const hex = Math.round(val * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`.toUpperCase();
}

// Visual feedback system - exports current view for AI analysis
async function captureVisualFeedback() {
  try {
    // Export current viewport as image
    const viewport = figma.viewport;
    const nodes = figma.currentPage.selection.length > 0
      ? figma.currentPage.selection
      : figma.currentPage.children.slice(0, 10); // Limit to avoid timeout

    console.log('📸 Capturing visual feedback...');

    const exports = [];
    for (const node of nodes) {
      if ('exportAsync' in node) {
        try {
          const bytes = await node.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 0.5 } // Lower res for speed
          });

          // Convert to base64 for transmission
          const base64 = btoa(String.fromCharCode(...bytes));
          exports.push({
            name: node.name,
            type: node.type,
            bounds: node.absoluteBoundingBox,
            image: base64.substring(0, 100) + '...' // Truncate for logging
          });

          console.log(`✓ Captured: ${node.name} (${node.type})`);
        } catch (err) {
          console.log(`✗ Failed to capture ${node.name}:`, err);
        }
      }
    }

    // Send to local helper service
    if (exports.length > 0) {
      // This would send to our helper service at localhost:3001
      console.log(`📤 Ready to send ${exports.length} captures to helper service`);
      console.log('Viewport:', viewport.bounds);
      console.log('Zoom:', viewport.zoom);

      // Uncomment when helper service is running:
      // await fetch('http://localhost:3001/visual-feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ exports, viewport, timestamp: Date.now() })
      // });
    }

    return exports;
  } catch (error) {
    console.error('Visual feedback error:', error);
    return [];
  }
}

// Run the showcase creation
createColorShowcase();

// Capture visual feedback after creation
// setTimeout(() => captureVisualFeedback(), 1000);

// Keep plugin running
// figma.closePlugin();