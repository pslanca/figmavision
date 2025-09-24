// FigmaVision - Medium Hero Grid Generator
// Creates before/after color grids with proper auto-layout

console.log("FigmaVision: Creating Medium hero image...");

async function createMediumHero() {
  try {
    // Load fonts
    await figma.loadFontAsync({ family: "Inter", style: "Regular" }).catch(() => {});

    // Clean up existing
    const existing = figma.currentPage.children.filter(
      node => node.type === 'FRAME' && node.name === 'Medium Hero - Color Intelligence'
    );
    existing.forEach(frame => frame.remove());

    // Generate 64 colors using HSL
    const colors = [];
    for (let i = 0; i < 64; i++) {
      const hue = (i * 5.625) % 360;
      const sat = 0.6 + (Math.random() * 0.4);
      const light = 0.3 + (Math.random() * 0.5);
      colors.push(hslToRgb(hue, sat, light));
    }

    // HSL to RGB conversion function
    function hslToRgb(h, s, l) {
      h = h / 360;
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      return {
        r: hue2rgb(p, q, h + 1/3),
        g: hue2rgb(p, q, h),
        b: hue2rgb(p, q, h - 1/3)
      };
    }

    // Main container - 1140px fixed with proper alignment
    const container = figma.createFrame();
    container.name = "Medium Hero - Color Intelligence";
    container.x = 100;
    container.y = 100;
    container.resize(1140, 600);
    container.layoutMode = 'HORIZONTAL';
    container.primaryAxisSizingMode = 'FIXED';
    container.counterAxisSizingMode = 'FIXED';
    container.primaryAxisAlignItems = 'CENTER';
    container.counterAxisAlignItems = 'CENTER';
    container.itemSpacing = 60;
    container.paddingLeft = 60;
    container.paddingRight = 60;
    container.paddingTop = 60;
    container.paddingBottom = 60;
    container.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];

    // Left grid - Random colors (Before)
    const leftGrid = figma.createFrame();
    leftGrid.name = "Before - Random";
    leftGrid.layoutMode = 'HORIZONTAL';
    leftGrid.layoutWrap = 'WRAP';
    leftGrid.itemSpacing = 0;
    leftGrid.counterAxisSpacing = 0;
    leftGrid.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    leftGrid.layoutGrow = 1;
    leftGrid.layoutAlign = 'STRETCH';
    leftGrid.primaryAxisSizingMode = 'FIXED';
    leftGrid.counterAxisSizingMode = 'FIXED';
    container.appendChild(leftGrid);

    // Add 64 random color squares to left grid
    const randomColors = [...colors].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 64; i++) {
      const square = figma.createRectangle();
      square.resize(60, 60);
      square.fills = [{ type: 'SOLID', color: randomColors[i] }];
      leftGrid.appendChild(square);
    }

    // Right grid - Organized colors (After)
    const rightGrid = figma.createFrame();
    rightGrid.name = "After - AI Organized";
    rightGrid.layoutMode = 'HORIZONTAL';
    rightGrid.layoutWrap = 'WRAP';
    rightGrid.itemSpacing = 0;
    rightGrid.counterAxisSpacing = 0;
    rightGrid.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    rightGrid.layoutGrow = 1;
    rightGrid.layoutAlign = 'STRETCH';
    rightGrid.primaryAxisSizingMode = 'FIXED';
    rightGrid.counterAxisSizingMode = 'FIXED';
    container.appendChild(rightGrid);

    // Sort colors by hue for organized appearance
    const sortedColors = [...colors].sort((a, b) => {
      const getHue = (color) => {
        const max = Math.max(color.r, color.g, color.b);
        const min = Math.min(color.r, color.g, color.b);
        const delta = max - min;
        if (delta === 0) return 0;

        let hue;
        if (max === color.r) {
          hue = ((color.g - color.b) / delta) % 6;
        } else if (max === color.g) {
          hue = (color.b - color.r) / delta + 2;
        } else {
          hue = (color.r - color.g) / delta + 4;
        }
        return (hue * 60 + 360) % 360;
      };

      return getHue(a) - getHue(b);
    });

    // Add 64 organized color squares to right grid
    for (let i = 0; i < 64; i++) {
      const square = figma.createRectangle();
      square.resize(60, 60);
      square.fills = [{ type: 'SOLID', color: sortedColors[i] }];
      rightGrid.appendChild(square);
    }

    // Select and focus the result
    figma.currentPage.selection = [container];
    figma.viewport.scrollAndZoomIntoView([container]);

    console.log("Medium hero created! Export as PNG 2x for best quality.");

  } catch (error) {
    console.error("Error creating Medium hero:", error);
  }
}

createMediumHero();