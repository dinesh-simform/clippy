# Build Instructions for Clipsy

This document provides instructions for building installable packages for the Clipsy Clipboard Manager.

## Prerequisites

### All Platforms
- Node.js (v14 or higher)
- npm (v6 or higher)

### Platform-Specific Requirements

#### Linux
- For building DEB packages: `dpkg` and `fakeroot` (usually pre-installed)
- For building RPM packages: `rpmbuild` (install with `sudo apt-get install rpm`)
- For building AppImage: No additional requirements

#### Windows
- Windows 7 or later
- For NSIS installer: electron-builder will download automatically

#### macOS
- macOS 10.13 or later
- Xcode Command Line Tools

## Installation

First, install dependencies:

```bash
npm install
```

Rebuild native dependencies for Electron:

```bash
npm run rebuild
```

## Build Scripts

### Development
```bash
# Run the app in development mode
npm run dev

# Build webpack bundle and run app
npm start
```

### Production Builds

#### Build for Current Platform
```bash
# Build for your current operating system
npm run dist
```

#### Platform-Specific Builds

**Linux:**
```bash
# Build AppImage and DEB packages
npm run dist:linux
```

Output files:
- `release/Clipsy-1.0.0.AppImage` - Universal Linux package
- `release/clipsy_1.0.0_amd64.deb` - Debian/Ubuntu package

**Windows:**
```bash
# Build Windows installer and portable version
npm run dist:win
```

Output files:
- `release/Clipsy Setup 1.0.0.exe` - NSIS installer
- `release/Clipsy 1.0.0.exe` - Portable executable

**macOS:**
```bash
# Build DMG and ZIP
npm run dist:mac
```

Output files:
- `release/Clipsy-1.0.0.dmg` - macOS disk image
- `release/Clipsy-1.0.0-mac.zip` - macOS app bundle

### Test Build (No Installer)
```bash
# Build unpacked directory only (faster for testing)
npm run pack
```

This creates `release/<platform>-unpacked/` with the application files.

## Build Configuration

The build configuration is defined in `package.json` under the `build` key:

### Key Configuration Options

- **appId**: `com.clipsy.clipboard-manager` - Unique application identifier
- **productName**: `Clipsy` - Display name of the application
- **Output Directory**: `release/` - Where build artifacts are saved
- **Icon**: `assets/clipsy-icon-textonly-theme.png`

### Linux Configuration
```json
{
  "target": ["AppImage", "deb"],
  "category": "Utility",
  "executableName": "clipsy"
}
```

### Windows Configuration
```json
{
  "target": ["nsis", "portable"],
  "icon": "assets/clipsy-icon-textonly-theme.png"
}
```

### macOS Configuration
```json
{
  "target": ["dmg", "zip"],
  "category": "public.app-category.productivity"
}
```

## Native Dependencies

Clipsy uses `better-sqlite3`, a native Node.js module. This requires rebuilding for Electron:

```bash
npm run rebuild
```

The `postinstall` script automatically runs this after `npm install`.

## Build Output

All build artifacts are located in the `release/` directory:

```
release/
├── Clipsy-1.0.0.AppImage          # Linux AppImage
├── clipsy_1.0.0_amd64.deb         # Debian/Ubuntu package
├── Clipsy Setup 1.0.0.exe         # Windows installer
├── Clipsy 1.0.0.exe               # Windows portable
├── Clipsy-1.0.0.dmg               # macOS installer
├── Clipsy-1.0.0-mac.zip           # macOS app bundle
└── linux-unpacked/                # Unpacked Linux build
```

## Installation Instructions

### Linux

**AppImage:**
1. Make it executable: `chmod +x Clipsy-1.0.0.AppImage`
2. Run it: `./Clipsy-1.0.0.AppImage`

**DEB Package:**
```bash
sudo dpkg -i clipsy_1.0.0_amd64.deb
sudo apt-get install -f  # Install dependencies if needed
```

### Windows

**Installer:**
- Double-click `Clipsy Setup 1.0.0.exe`
- Follow the installation wizard
- Choose installation directory
- Create desktop/start menu shortcuts

**Portable:**
- Run `Clipsy 1.0.0.exe` directly
- No installation required

### macOS

**DMG:**
1. Open `Clipsy-1.0.0.dmg`
2. Drag Clipsy to Applications folder
3. Launch from Applications

## Features Included in Build

✅ Global keyboard shortcut (Ctrl/Cmd+F9)
✅ System tray integration
✅ SQLite database with better-sqlite3
✅ React UI with Material-UI
✅ Spotlight search window
✅ Light/dark theme support
✅ Category management
✅ Date filtering
✅ Clipboard history monitoring
✅ Configurable settings (check interval, max entries)
✅ Auto-cleanup of old entries
✅ Favorites system

## Troubleshooting

### Build Errors

**Error: Cannot find module 'better-sqlite3'**
```bash
npm run rebuild
```

**Error: electron-builder not found**
```bash
npm install --save-dev electron-builder
```

**Native module compilation errors**
```bash
npm install --save-dev electron-rebuild
npm run rebuild
```

### Runtime Errors

**App won't start after installation:**
- Check if native dependencies were properly rebuilt
- Verify all required files are included in the build
- Check console output for error messages

**Database errors:**
- Ensure better-sqlite3 is properly compiled for your platform
- Check file permissions in the app data directory

## Updating Version

To release a new version:

1. Update version in `package.json`:
   ```json
   "version": "1.0.1"
   ```

2. Rebuild:
   ```bash
   npm run dist
   ```

3. The new version will be reflected in filenames:
   - `Clipsy-1.0.1.AppImage`
   - `clipsy_1.0.1_amd64.deb`
   - etc.

## Cross-Platform Building

electron-builder supports building for multiple platforms from a single OS:

- **From Linux**: Can build for Linux and Windows (with Wine)
- **From macOS**: Can build for macOS, Linux, and Windows
- **From Windows**: Can build for Windows only

For best results, build on the target platform.

## Advanced Configuration

### Custom Build Directory
Change output directory in `package.json`:
```json
"build": {
  "directories": {
    "output": "dist"
  }
}
```

### Code Signing (Production)
For production releases, add code signing configuration:

**Windows:**
```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "password"
}
```

**macOS:**
```json
"mac": {
  "identity": "Developer ID Application: Your Name"
}
```

## Support

For issues or questions:
- Check electron-builder documentation: https://www.electron.build/
- Review build logs in `release/builder-debug.yml`
- Check effective configuration: `release/builder-effective-config.yaml`

## License

MIT License - See LICENSE file for details
