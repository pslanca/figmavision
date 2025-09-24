# System Architecture

## Component Overview
```
FigmaVision/
├── auto-exec/              # Main Figma Plugin
│   ├── code.js            # Medium hero grid generator
│   └── manifest.json      # Plugin configuration
├── visual-helper/          # Visual Feedback Service
│   ├── server.js          # Express server (port 3001)
│   ├── dashboard.html     # Web UI for viewing captures
│   └── capture-cli.js     # Command-line screenshot tool
├── .memory-bank/          # Session context preservation
└── docs/                  # Documentation
```

## Data Flow
```
1. Edit code.js → 2. Figma auto-executes → 3. Creates visual design
                                              ↓
6. AI analyzes ← 5. View on dashboard ← 4. Visual helper captures
```

## Auto-Layout Architecture
```
Main Container (1140×600 FIXED)
├── layoutMode: 'HORIZONTAL'
├── CENTER alignment both axes
├── 60px padding + 60px spacing
└── Children (2 grids):
    ├── layoutGrow: 1 (fill space)
    ├── layoutAlign: 'STRETCH' (full height)
    └── Contains: 64 × (60×60px squares)
```

## Key Design Patterns
- **Auto-executing plugins**: Run on file save for immediate feedback
- **Responsive auto-layout**: Fills space regardless of container size
- **Visual feedback loop**: Capture → Analyze → Iterate
- **Single source of truth**: One working plugin, no variants