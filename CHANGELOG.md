# Changelog

All notable changes to Clipsy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-21

### 🎉 Initial Release

First stable release of Clipsy - Modern Clipboard Manager!

### ✨ Added

#### Core Features
- Automatic clipboard monitoring with configurable interval (1-60 seconds)
- SQLite database for persistent clipboard history storage
- System tray integration for quick access
- Global keyboard shortcut (`Ctrl/Cmd+F9`) for spotlight search
- Spotlight search window with instant filtering
- Main application window with full feature access
- Light and dark theme support with persistence

#### Clipboard Management
- Automatic capture of clipboard content
- Favorites system to mark important items
- Custom naming for clipboard entries
- Delete individual entries or clear all
- Auto-cleanup of old entries (configurable max entries: 100-10,000)
- Favorites are preserved during auto-cleanup

#### Categories & Organization
- **Default Categories:**
  - Favorites (starred items)
  - URLs (automatically detected)
  - Emails (automatically detected)
  - Code (automatically detected)
- **Custom Categories:**
  - Create unlimited custom categories
  - Assign colors to categories
  - Add emoji icons to categories
  - Assign multiple categories to entries
  - Filter by single or multiple categories

#### Search & Filtering
- Full-text search across all clipboard content
- Search by custom names
- Filter by category (default and custom)
- Date-based filtering:
  - Today
  - Yesterday
  - Last 7 days
  - Last 30 days
  - Last 90 days
- Category chips for quick filtering
- Real-time search results

#### User Interface
- Modern Material-UI design system
- Responsive layout
- Smooth animations and transitions
- Category color indicators
- Entry cards with action buttons
- Collapsible sidebar
- Theme toggle in both windows
- Settings dialog with form validation

#### Settings & Configuration
- **Configurable Options:**
  - Clipboard Check Interval (1-60 seconds, default: 2s)
  - Minimum Check Delay for debouncing (0.1-5 seconds, default: 0.5s)
  - Maximum Entries to keep (100-10,000, default: 1000)
- Settings persist across app restarts
- Input validation with helpful descriptions
- Performance recommendations
- Dynamic restart of monitoring when interval changes

#### Performance Optimizations
- Query caching (5-second cache duration)
- Cache invalidation on data changes
- Debounced clipboard checking
- Lazy window creation for spotlight
- Background throttling prevention
- Memory cleanup on window hide
- React hooks optimization (useCallback, useMemo)
- Efficient database queries with prepared statements

#### Developer Features
- electron-builder configuration for all platforms
- Webpack bundling with production optimization
- Native module rebuilding (better-sqlite3)
- Development scripts with hot reload
- Comprehensive documentation

### 🏗️ Build System

#### Supported Platforms
- **Linux:**
  - AppImage (universal, 110 MB)
  - DEB package (Debian/Ubuntu)
  - RPM package support (requires rpmbuild)
- **Windows:**
  - NSIS installer
  - Portable executable
- **macOS:**
  - DMG installer
  - ZIP app bundle

#### Build Configuration
- App ID: `com.clipsy.clipboard-manager`
- Product Name: Clipsy
- Electron version: 27.3.11
- React version: 18.2.0
- Material-UI version: 5.14.17
- better-sqlite3 version: 11.10.0

### 📚 Documentation

#### User Documentation
- README.md with comprehensive usage guide
- QUICK_START.md for new users
- Troubleshooting section with common issues
- Keyboard shortcuts reference

#### Developer Documentation
- BUILD_INSTRUCTIONS.md with detailed build steps
- BUILD_SUMMARY.md with build status
- USER_SETTINGS_IMPLEMENTATION.md for settings system
- SQLITE_INTEGRATION.md for database schema
- CHANGELOG.md for version tracking

### 🔒 Security & Privacy

- All data stored locally (no cloud sync)
- SQLite database with encryption support
- No telemetry or analytics
- User data never leaves the machine

### 🎨 Design

- Custom application icon (Clipsy text logo)
- Material Design principles
- Consistent color scheme
- Smooth theme transitions
- Professional UI/UX

### 🐛 Known Issues

- None reported in initial release

### 📋 Technical Details

**Dependencies:**
- Electron: ^27.0.0
- React: ^18.2.0
- React DOM: ^18.2.0
- Material-UI Core: ^5.14.17
- Material-UI Icons: ^5.14.16
- better-sqlite3: ^11.10.0
- Emotion (for MUI): ^11.11.1

**Dev Dependencies:**
- electron-builder: ^26.0.12
- webpack: ^5.89.0
- babel: ^7.23.0
- electron-rebuild: ^3.2.9

**Bundle Size:**
- Compiled React bundle: 491 KB (minified)
- Total AppImage size: 110 MB (includes Electron runtime)

### 🚀 Installation

**Linux:**
```bash
chmod +x Clipsy-1.0.0.AppImage
./Clipsy-1.0.0.AppImage
```

**Windows:**
- Run `Clipsy Setup 1.0.0.exe`

**macOS:**
- Open `Clipsy-1.0.0.dmg` and drag to Applications

### 📝 Notes

- First stable release after extensive development
- All core features implemented and tested
- Ready for production use
- Cross-platform compatibility verified

---

## [Unreleased]

### Planned Features

- [ ] Cloud sync support (optional)
- [ ] Clipboard encryption with master password
- [ ] Export/import clipboard history
- [ ] Advanced search with regex
- [ ] Clipboard templates
- [ ] Hotkeys customization UI
- [ ] Multiple clipboard slots
- [ ] Rich text and image support
- [ ] Auto-update system
- [ ] Statistics and analytics dashboard
- [ ] Tag system for better organization
- [ ] Keyboard-only navigation mode
- [ ] Plugin system for extensibility

### Future Improvements

- [ ] Reduce AppImage size
- [ ] Optimize startup time
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Set up CI/CD pipeline
- [ ] Create browser extension for web integration
- [ ] Mobile companion app
- [ ] Clipboard sharing between devices

---

## Version History

- **1.0.0** (2025-11-21) - Initial stable release

---

## How to Update

To update to a new version:

1. Download the latest release
2. Close the current version
3. Install/run the new version
4. Your data and settings are preserved

## Reporting Issues

Found a bug? Have a suggestion?

- Create an issue on GitHub
- Include your OS and version
- Describe steps to reproduce
- Attach screenshots if relevant

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**Maintained by**: Clipsy Team  
**License**: MIT
