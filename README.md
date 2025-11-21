# Clipsy - Modern Clipboard Manager

<p align="center">
  <img src="assets/clipsy-icon-textonly-theme.png" alt="Clipsy Logo" width="128" height="128">
</p>

A powerful, secure, and modern clipboard manager built with Electron and React. Clipsy helps you track, organize, and manage your clipboard history with ease.

## ✨ Features

### Core Features
- � **Automatic Clipboard Monitoring** - Captures everything you copy automatically
- � **Spotlight Search** - Quick access with `Ctrl/Cmd+F9` keyboard shortcut
- 🎨 **Light & Dark Themes** - Beautiful UI that adapts to your preference
- 📁 **Smart Categories** - Organize clips with default and custom categories
- ⭐ **Favorites System** - Mark important clips for quick access
- �️ **Date Filtering** - Find clips by date range (today, yesterday, last 7/30/90 days)
- � **Secure Storage** - SQLite database with encryption support
- 🎯 **System Tray Integration** - Always accessible from your system tray

### Advanced Features
- 🏷️ **Custom Categories** - Create and manage your own categories with colors and icons
- � **Full-Text Search** - Search across all clipboard content
- 🎯 **Category Filters** - Filter by Favorites, URLs, Emails, Code, or custom categories
- ⚙️ **Configurable Settings** - Customize monitoring interval, max entries, and debounce delay
- 🧹 **Auto-Cleanup** - Automatically removes old entries (keeps favorites)
- 💾 **Export/Import** - Backup and restore your clipboard history
- 🎨 **Theme Persistence** - Your theme preference is saved

### Default Categories
- ⭐ **Favorites** - Your starred items
- 🔗 **URLs** - Automatically detects web links
- 📧 **Emails** - Automatically detects email addresses
- 💻 **Code** - Automatically detects code snippets

## 🚀 Quick Start

### Installation

#### Linux

**AppImage (Recommended):**
```bash
# Download the AppImage
chmod +x Clipsy-1.0.0.AppImage
./Clipsy-1.0.0.AppImage
```

**Debian/Ubuntu (.deb):**
```bash
sudo dpkg -i clipsy_1.0.0_amd64.deb
sudo apt-get install -f  # Install dependencies
```

#### Windows

1. Download `Clipsy Setup 1.0.0.exe`
2. Run the installer
3. Follow the installation wizard

Or use the portable version - just run `Clipsy 1.0.0.exe` directly.

#### macOS

1. Download `Clipsy-1.0.0.dmg`
2. Open the DMG file
3. Drag Clipsy to Applications folder

### First Launch

1. Launch Clipsy from your applications menu or system tray
2. The app starts monitoring your clipboard automatically
3. Press `Ctrl+F9` (or `Cmd+F9` on Mac) to open the spotlight search
4. Start copying text - it's automatically saved to your history!

## 🎯 Usage

### Keyboard Shortcuts

- `Ctrl/Cmd+F9` - Toggle spotlight search window
- `Ctrl/Cmd+N` - New window
- `Ctrl/Cmd+Q` - Quit application
- `Ctrl/Cmd+Shift+C` - Copy selected text to clipboard manager
- `Esc` - Close spotlight window

### Spotlight Search Window

Press `Ctrl+F9` to open the quick search:

1. **Search** - Type to filter your clipboard history
2. **Category Filters** - Click chips to filter by category
3. **Navigate** - Use arrow keys to navigate results
4. **Select** - Press Enter to copy item to clipboard
5. **Theme Toggle** - Switch between light/dark mode

### Main Application Window

The main window provides full access to all features:

1. **Search Bar** - Search across all clipboard entries
2. **Category Sidebar** - Filter by category (All, Favorites, URLs, Emails, Code, Custom)
3. **Date Filter** - Filter by time period
4. **Entry Cards** - Each clipboard entry with actions:
   - Copy to clipboard
   - Toggle favorite
   - Assign categories
   - Delete entry
5. **Theme Toggle** - Switch themes (top-right)
6. **Settings** - Configure app behavior (⚙️ icon)

### Managing Categories

1. Click "Manage Categories" in the sidebar
2. Create custom categories with:
   - Name
   - Color
   - Icon
3. Assign categories to entries by clicking the category icon on any entry card

### Configurable Settings

Click the Settings icon (⚙️) to customize:

- **Clipboard Check Interval** - How often to check clipboard (1-60 seconds)
- **Minimum Check Delay** - Debounce delay to prevent rapid checks (0.1-5 seconds)
- **Maximum Entries** - Max number of entries to keep (100-10,000)

**Recommended Settings:**
- Check Interval: 2000ms (2 seconds)
- Check Delay: 500ms (0.5 seconds)
- Max Entries: 1000 entries

## 🏗️ Building from Source

See [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) for detailed build instructions.

**How to Use Clipboard History:**
1. Copy text from ANY application using `Ctrl+C`
2. The app automatically monitors your clipboard every second
3. Open the tray menu to see the last 3 items at the top
4. Click any history item to copy it again
5. Use "View Clipboard History" to see all 10 items
6. The clipboard is also checked whenever you open the tray menu

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

## License

MIT
