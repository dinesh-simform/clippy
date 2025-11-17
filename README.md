# Electron + React App

A simple Electron application built with React and JavaScript.

## Features

- ⚛️ React 18 with Hooks
- 🚀 Electron 27
- 📦 Webpack bundling
- 🎨 Material-UI (MUI) design system
- 🎭 Material Icons
- 📋 Native menu bar with File, Edit, View, Window, and Help menus
- 🎯 Material Design theme and components
- 📎 System tray icon with clipboard manager
- 📋 Clipboard operations (copy, paste, clear)
- 🕐 Clipboard history tracking (last 10 items)
- ⚡ Quick access to recent clipboard items from tray menu
- 🔄 Native clipboard event monitoring (real-time detection)
- 📊 Captures clipboard content from any application instantly

## Screenshots

The app features:
- Material Design interface with gradient background
- Interactive button with Material Icons that change based on click count
- Version information displayed in Material Chips
- Native Ubuntu menu bar integration
- Smooth transitions and Material elevation shadows
- **System tray icon** with clipboard manager functionality

## System Tray Features

The app includes a system tray icon (visible in Ubuntu's taskbar) with the following features:

📎 **Clipboard Manager Menu:**
- **Recent Clipboard Items** - Shows the last 3 copied texts (truncated with ellipsis)
  - Click any item to copy it again to clipboard
- **Copy Selected Text** - Copy currently selected text from the app
- **Paste from Clipboard** - View current clipboard content
- **View Clipboard History** - See all clipboard history items (up to 10)
- **Clear Clipboard** - Clear the current clipboard
- **Clear History** - Clear all clipboard history
- **Show App** - Show/hide the main window
- **Quit** - Exit the application

**Tray Icon Actions:**
- Left-click on the tray icon to show/hide the main window
- Right-click to open the context menu with clipboard history
- The app continues running in the background even when the window is closed

**How to Use Clipboard History:**
1. Copy text from ANY application using `Ctrl+C`
2. The app **instantly detects** clipboard changes using native events
3. Open the tray menu to see the last 3 items at the top
4. Click any history item to copy it again
5. Use "View Clipboard History" to see all 10 items
6. Works in real-time - no polling delay!

**How to Copy Selected Text:**
1. Select any text in the application
2. Click the tray icon and choose "Copy Selected Text"
3. Or use the keyboard shortcut `Ctrl+Shift+C`
4. The selected text will be copied to your system clipboard and saved to history

## Project Structure

```
electron/
├── src/
│   ├── App.js          # Main React component
│   ├── App.css         # Component styles
│   └── index.js        # React entry point
├── dist/               # Webpack bundle output
├── main.js             # Electron main process
├── index.html          # HTML template
├── icon.svg            # Application icon (SVG)
├── webpack.config.js   # Webpack configuration
├── .babelrc           # Babel configuration
└── package.json       # Dependencies and scripts
```

## Installation

Install dependencies:
```bash
npm install
```

## Usage

### Quick Start (Recommended):

```bash
npm run dev
```
or
```bash
npm start
```

Both commands build the app and start Electron.

### Active Development with Auto-Rebuild:

**Terminal 1** - Watch and rebuild on file changes:
```bash
npm run watch
```

**Terminal 2** - Run Electron:
```bash
npm run electron
```

When you make changes to React files, webpack will automatically rebuild. Just press `Ctrl+R` in the Electron window to see your changes!

### Production build:
```bash
npm run build
```

## Menu Bar

The application includes a native menu bar that appears in Ubuntu's top bar with the following menus:

- **File**: New Window, Exit
- **Edit**: Undo, Redo, Cut, Copy, Paste, Select All
- **View**: Reload, Toggle DevTools, Zoom controls, Fullscreen
- **Window**: Minimize, Close
- **Help**: About, Learn More

## Material Design Components

The app uses these Material-UI components:
- `Container`, `Box`, `Paper` - Layout and structure
- `Typography` - Text styling following Material Design
- `Button` - Interactive buttons with ripple effects
- `Card`, `CardContent` - Information cards
- `Chip` - Badges for version info
- `Stack` - Flexible layout
- `Divider` - Visual separators
- `ThemeProvider` - Custom Material Design theme

## Material Icons Used

- `RocketIcon` - App header
- `TouchAppIcon` - Default click button
- `InfoIcon` - Information section
- `CelebrationIcon` - 5 clicks milestone
- `FireIcon` - 10+ clicks milestone

## Development Notes

### Why the blank page issue?

If you see a blank page, make sure to:
1. Run `npm install` to install all dependencies including Material-UI
2. Run `npm run build` to create the webpack bundle
3. Then run `npm start` or `npm run electron`

The bundle.js file must exist in the `dist/` folder before Electron can display the app.

### Development Workflow

For active development:
- Keep webpack watching for changes in one terminal: `npm run dev`
- Run Electron in another terminal: `npm run electron`
- When you make changes to React files, webpack will rebuild automatically
- Reload the Electron window (Ctrl+R) to see changes

## Keyboard Shortcuts

- `Ctrl+N` - New Window
- `Ctrl+Q` - Quit Application
- `Ctrl+C` - Copy (standard)
- `Ctrl+V` - Paste (standard)
- `Ctrl+Shift+C` - Copy selected text to clipboard manager
- `Ctrl+R` - Reload
- `Ctrl+Shift+I` - Toggle DevTools
- `F11` - Toggle Fullscreen

## Technologies Used

- **Electron**: Desktop application framework
- **React**: UI library with Hooks
- **Material-UI (MUI)**: React component library following Material Design
- **Material Icons**: Standard icon library
- **Webpack**: Module bundler
- **Babel**: JavaScript transpiler
- **Emotion**: CSS-in-JS styling (used by MUI)
- **clipboard-event**: Native clipboard change detection

## License

MIT
