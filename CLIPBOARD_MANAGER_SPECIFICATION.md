# Clipboard Manager - Project Specification

## Overview
A modern, sleek clipboard management application built with Electron for Ubuntu. The application runs in the system tray and provides an aesthetic UI for managing clipboard history with advanced categorization, favorites, and lifetime storage.

## Core Features

### 1. Clipboard Monitoring & Storage
- **Real-time Monitoring**: Continuously monitor system clipboard for new content
- **Automatic Storage**: Save every clipboard entry automatically
- **Persistent Storage**: SQLite database for lifetime storage
- **Metadata Capture**:
  - Timestamp (when copied)
  - Content type (text, image, file, etc.)
  - Content size
  - Source application (where possible)
  - Auto-detected category

### 2. Smart Categorization
- **Auto-Detection Categories**:
  - 🔐 **Passwords**: Pattern matching for password-like strings
  - 🌐 **URLs**: Web links and local file paths
  - 📧 **Email**: Email addresses
  - 💻 **Code**: Programming code snippets
  - 📱 **Phone**: Phone numbers
  - 🏦 **Financial**: Credit card numbers, bank details
  - 📝 **Text**: Regular text content
  - 🖼️ **Images**: Image clipboard content
  - 📁 **Files**: File paths and names
- **Manual Override**: Users can manually change categories
- **Custom Categories**: Allow users to create custom categories

### 3. User Interface Features
- **System Tray Integration**: Always accessible from taskbar
- **Modern Design**: Clean, minimalistic, aesthetic interface
- **Dark/Light Theme**: Toggle between themes
- **Search & Filter**: 
  - Full-text search across all entries
  - Filter by category, date range, favorites
  - Quick access via keyboard shortcuts
- **Favorites System**: Mark important entries as favorites
- **Custom Names**: Assign custom names/labels to entries
- **Preview Panel**: Quick preview of content without copying

### 4. Security & Privacy
- **Sensitive Content Detection**: Auto-flag potential passwords/sensitive data
- **Encryption**: Optional encryption for sensitive entries
- **Privacy Mode**: Temporary disable monitoring
- **Auto-clear**: Option to auto-clear sensitive content after time
- **Secure Deletion**: Proper deletion of sensitive data

## Technical Architecture

### Technology Stack
- **Framework**: Electron (Latest stable)
- **Frontend**: 
  - React 18+ with TypeScript
  - Tailwind CSS for styling
  - Framer Motion for animations
  - React Query for state management
- **Backend**: 
  - Node.js
  - SQLite3 with better-sqlite3
  - Electron IPC for communication
- **System Integration**:
  - clipboard-event for monitoring
  - node-notifier for notifications
  - auto-launch for startup

### Application Structure
```
clipboard-manager/
├── src/
│   ├── main/                 # Main process (Electron)
│   │   ├── main.ts
│   │   ├── tray.ts
│   │   ├── database.ts
│   │   ├── clipboard-monitor.ts
│   │   └── categorizer.ts
│   ├── renderer/             # Renderer process (React UI)
│   │   ├── components/
│   │   │   ├── ClipboardList/
│   │   │   ├── SearchBar/
│   │   │   ├── CategoryFilter/
│   │   │   └── PreviewPanel/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── utils/
│   │   └── App.tsx
│   └── shared/               # Shared types and utilities
├── assets/
├── build/
└── dist/
```

## Database Schema

### Tables

#### `clipboard_entries`
```sql
CREATE TABLE clipboard_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    custom_name VARCHAR(255),
    is_favorite BOOLEAN DEFAULT FALSE,
    is_sensitive BOOLEAN DEFAULT FALSE,
    source_app VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    content_hash VARCHAR(64) UNIQUE,
    file_path TEXT,
    preview TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `categories`
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `settings`
```sql
CREATE TABLE settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## UI/UX Design Specifications

### Design Principles
- **Minimalistic**: Clean, uncluttered interface
- **Fast Access**: Quick search and retrieval
- **Visual Hierarchy**: Clear categorization with icons and colors
- **Responsive**: Adaptive layout for different screen sizes

### Color Scheme
- **Primary**: Modern blue (#3B82F6)
- **Secondary**: Soft gray (#6B7280)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **Background**: 
  - Light: #FFFFFF, #F9FAFB
  - Dark: #1F2937, #111827

### Components Design

#### System Tray
- Clean icon that shows clipboard status
- Context menu with quick actions
- Notification badges for new items

#### Main Window
- **Header**: Search bar + settings button
- **Sidebar**: Category filters with counts
- **Main Area**: Clipboard entries in card layout
- **Preview Panel**: Expandable preview pane

#### Entry Cards
- **Content Preview**: First few lines with fade
- **Metadata**: Timestamp, source app, category icon
- **Actions**: Copy, favorite, edit name, delete
- **Visual Indicators**: Favorite star, sensitivity lock

### Keyboard Shortcuts
- `Ctrl+Shift+V`: Open clipboard manager
- `Ctrl+F`: Focus search
- `Escape`: Close window
- `Enter`: Copy selected item
- `Delete`: Delete selected item
- `Ctrl+D`: Toggle favorite
- `F2`: Rename selected item

## Features Breakdown

### Phase 1: Core Functionality
1. Basic clipboard monitoring
2. SQLite storage setup
3. System tray integration
4. Basic UI with entry list
5. Copy to clipboard functionality

### Phase 2: Smart Features
1. Auto-categorization system
2. Search and filtering
3. Favorites system
4. Custom naming
5. Settings panel

### Phase 3: Advanced Features
1. Source application detection
2. Image clipboard support
3. File clipboard support
4. Export/import functionality
5. Backup and sync

### Phase 4: Polish & Security
1. Encryption for sensitive data
2. Advanced theming
3. Notifications system
4. Performance optimizations
5. Privacy controls

## Security Considerations

### Data Protection
- Encrypt sensitive clipboard entries
- Secure storage of encryption keys
- Option to exclude certain apps from monitoring
- Auto-clear sensitive content after specified time

### Privacy Controls
- Privacy mode toggle
- Whitelist/blacklist applications
- Content filtering rules
- Secure deletion of removed entries

## Performance Requirements

### Targets
- **Startup Time**: < 2 seconds
- **Memory Usage**: < 100MB idle, < 200MB active
- **Database Size**: Efficient storage, auto-cleanup options
- **Search Speed**: < 100ms for 1000+ entries
- **UI Responsiveness**: 60fps animations, < 16ms frame time

### Optimizations
- Virtual scrolling for large lists
- Debounced search
- Lazy loading of content previews
- Background database maintenance
- Efficient clipboard monitoring

## Installation & Distribution

### Packaging
- **AppImage**: Universal Linux package
- **Deb Package**: Ubuntu/Debian native package
- **Snap Package**: Ubuntu store distribution
- **Auto-updater**: Built-in update mechanism

### System Integration
- Auto-start on boot (optional)
- Desktop entry creation
- System notifications integration
- Proper cleanup on uninstall

## Development Roadmap

### Milestone 1: Foundation (Week 1-2)
- Project setup with Electron + React + TypeScript
- Basic clipboard monitoring
- SQLite database integration
- System tray setup

### Milestone 2: Core UI (Week 3-4)
- Main window design implementation
- Entry list component
- Search functionality
- Basic categorization

### Milestone 3: Features (Week 5-6)
- Advanced categorization
- Favorites system
- Settings panel
- Keyboard shortcuts

### Milestone 4: Polish (Week 7-8)
- Performance optimizations
- Security features
- Testing and bug fixes
- Documentation and packaging

## Success Metrics

### User Experience
- Quick access to clipboard history (< 3 clicks)
- Fast search results (< 1 second)
- Intuitive categorization (90% accuracy)
- Stable system performance (no crashes)

### Technical Metrics
- Memory efficiency (< 200MB peak usage)
- Database performance (1000+ entries handled smoothly)
- UI responsiveness (60fps interface)
- Reliable clipboard monitoring (no missed copies)

---

This specification provides a comprehensive foundation for building a professional, aesthetic clipboard manager that meets modern user expectations while maintaining performance and security standards.