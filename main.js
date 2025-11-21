
const { app, BrowserWindow, Menu, Tray, clipboard, nativeImage, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const { createTrayIcon } = require('./create-icon');
const ClipboardDatabase = require('./database');

  // Decrypt entry content (from renderer)
  ipcMain.handle('decrypt-entry', async (event, entryId, password, masterPassword) => {
    if (!db) return { success: false, error: 'No DB' };
    const entry = db.getEntry(entryId);
    if (!entry || !entry.is_encrypted) return { success: false, error: 'Not encrypted' };
    // Try user password first
    try {
      const content = db.decrypt(entry.content, password, entry.iv);
      return { success: true, content };
    } catch (e) {
      // Try master password if provided
      if (masterPassword) {
        try {
          const content = db.decrypt(entry.content, masterPassword, entry.iv);
          return { success: true, content };
        } catch (e2) {
          // fall through
        }
      }
      return { success: false, error: 'Invalid password or corrupt data' };
    }
  });

let tray = null;
let db = null; // Database instance
let lastClipboardText = ''; // Track last clipboard content
let mainWindow = null; // Store reference to main window
let spotlightWindow = null; // Store reference to spotlight window
let themeMode = 'light'; // Default theme

// Get user data path for storing settings
const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');

// Load settings
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(data);
      themeMode = settings.themeMode || 'light';
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save settings
function saveSettings() {
  try {
    const settings = { themeMode };
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Function to check and update clipboard
function checkClipboard() {
  const currentText = clipboard.readText();
  
  // If clipboard has new content, add it to database
  if (currentText && currentText.trim() && currentText !== lastClipboardText) {
    lastClipboardText = currentText;
    addToClipboardHistory(currentText);
  }
}

// Start monitoring clipboard
function startClipboardMonitoring() {
  // Check clipboard every 1 second
  setInterval(() => {
    checkClipboard();
  }, 1000);
  
  // Also check when tray menu is opened
  if (tray) {
    tray.on('right-click', () => {
      checkClipboard();
    });
  }
}

// Function to add text to clipboard history
/**
 * Add to clipboard history
 * @param {string} text
 * @param {object} opts { encrypt: boolean, password: string }
 */
function addToClipboardHistory(text, opts = { encrypt: false, password: '' }) {
  if (!text || !text.trim() || !db) return;
  db.addEntry(text, opts);
  updateTrayMenu();
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('clipboard-updated');
  }
}
  // Add entry with encryption support (from renderer)
  ipcMain.handle('add-entry', async (event, text, opts) => {
    if (!db) return null;
    // opts.title is passed as custom_name
    return db.addEntry(text, opts);
  });

// Function to truncate text with ellipsis
function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Setup IPC handlers for renderer communication
function setupIPC() {
  // Get all clipboard entries
  ipcMain.handle('get-clipboard-entries', async () => {
    if (!db) return [];
    return db.getAllEntries();
  });
  
  // Get recent entries
  ipcMain.handle('get-recent-entries', async (event, limit = 50) => {
    if (!db) return [];
    return db.getRecentEntries(limit);
  });
  
  // Search entries
  ipcMain.handle('search-entries', async (event, query) => {
    if (!db) return [];
    return db.searchEntries(query);
  });
  
  // Copy entry to clipboard (accepts entry ID)
  ipcMain.handle('copy-entry', async (event, entryId) => {
    if (!db) return false;
    const entry = db.getEntry(entryId);
    if (entry && entry.content) {
      clipboard.writeText(entry.content);
      return true;
    }
    return false;
  });
  
  // Delete entry
  ipcMain.handle('delete-entry', async (event, id) => {
    if (!db) return false;
    const result = db.deleteEntry(id);
    if (mainWindow) {
      mainWindow.webContents.send('clipboard-updated');
    }
    return result;
  });
  
  // Toggle favorite
  ipcMain.handle('toggle-favorite', async (event, id) => {
    if (!db) return false;
    const result = db.toggleFavorite(id);
    if (mainWindow) {
      mainWindow.webContents.send('clipboard-updated');
    }
    return result;
  });
  
  // Update custom name
  ipcMain.handle('update-custom-name', async (event, id, name) => {
    if (!db) return false;
    return db.updateCustomName(id, name);
  });
  
  // Get total count
  ipcMain.handle('get-count', async () => {
    if (!db) return 0;
    return db.getCount();
  });
  
  // Clear all entries
  ipcMain.handle('clear-all-entries', async () => {
    if (!db) return false;
    return db.clearAll();
  });

  // ===== CUSTOM CATEGORIES =====

  // Create category
  ipcMain.handle('create-category', async (event, name, color, icon) => {
    if (!db) return null;
    return db.createCategory(name, color, icon);
  });

  // Get all categories
  ipcMain.handle('get-all-categories', async () => {
    if (!db) return [];
    return db.getAllCategories();
  });

  // Update category
  ipcMain.handle('update-category', async (event, id, name, color, icon) => {
    if (!db) return false;
    return db.updateCategory(id, name, color, icon);
  });

  // Delete category
  ipcMain.handle('delete-category', async (event, id) => {
    if (!db) return false;
    return db.deleteCategory(id);
  });

  // Assign category to entry
  ipcMain.handle('assign-category', async (event, entryId, categoryId) => {
    if (!db) return false;
    const result = db.assignCategory(entryId, categoryId);
    if (mainWindow) {
      mainWindow.webContents.send('clipboard-updated');
    }
    return result;
  });

  // Remove category from entry
  ipcMain.handle('remove-category', async (event, entryId, categoryId) => {
    if (!db) return false;
    const result = db.removeCategory(entryId, categoryId);
    if (mainWindow) {
      mainWindow.webContents.send('clipboard-updated');
    }
    return result;
  });

  // Get entries with categories
  ipcMain.handle('get-entries-with-categories', async () => {
    if (!db) return [];
    return db.getAllEntriesWithCategories();
  });

  // Get entries by category
  ipcMain.handle('get-entries-by-category', async (event, categoryId) => {
    if (!db) return [];
    return db.getEntriesByCategory(categoryId);
  });

  // ===== DATE FILTERING =====

  // Get entries by date range
  ipcMain.handle('get-entries-by-date-range', async (event, startTimestamp, endTimestamp) => {
    if (!db) return [];
    return db.getEntriesByDateRange(startTimestamp, endTimestamp);
  });

  // Theme management
  ipcMain.handle('get-theme-mode', async () => {
    return themeMode;
  });

  ipcMain.handle('set-theme-mode', async (event, mode) => {
    themeMode = mode;
    saveSettings();
    // Notify all windows about theme change
    if (mainWindow) {
      mainWindow.webContents.send('theme-changed', mode);
    }
    if (spotlightWindow) {
      spotlightWindow.webContents.send('theme-changed', mode);
    }
    return true;
  });
}

// Create menu template
const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          createWindow();
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'delete' },
      { type: 'separator' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: 'Copy to Clipboard Manager',
        accelerator: 'CmdOrCtrl+Shift+C',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.executeJavaScript('window.getSelection().toString()')
              .then(selectedText => {
                if (selectedText && selectedText.trim()) {
                  clipboard.writeText(selectedText);
                  addToClipboardHistory(selectedText); // Add to history
                  console.log('Text saved to clipboard manager:', selectedText);
                }
              });
          }
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: () => {
          const { dialog } = require('electron');
          dialog.showMessageBox({
            type: 'info',
            title: 'About',
            message: 'Electron + React App',
            detail: 'A simple Electron application with React\nVersion 1.0.0',
            buttons: ['OK']
          });
        }
      },
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron');
          await shell.openExternal('https://electronjs.org');
        }
      }
    ]
  }
];

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open DevTools in development (optional)
  // mainWindow.webContents.openDevTools();
  
  // Clear reference when window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create spotlight window
function createSpotlightWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  spotlightWindow = new BrowserWindow({
    width: 700,
    height: 500,
    x: Math.floor((width - 700) / 2),
    y: Math.floor((height - 500) / 3), // Position slightly above center
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  spotlightWindow.loadFile('spotlight.html');

  // Hide on blur (when clicking outside)
  spotlightWindow.on('blur', () => {
    if (spotlightWindow && !spotlightWindow.webContents.isDevToolsOpened()) {
      spotlightWindow.hide();
    }
  });

  spotlightWindow.on('closed', () => {
    spotlightWindow = null;
  });

  // Setup escape key to close
  spotlightWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      spotlightWindow.hide();
    }
  });
}

// Toggle spotlight window
function toggleSpotlightWindow() {
  if (!spotlightWindow) {
    createSpotlightWindow();
  }

  if (spotlightWindow.isVisible()) {
    spotlightWindow.hide();
  } else {
    // Refresh data before showing
    spotlightWindow.webContents.send('refresh-clipboard-data');
    spotlightWindow.show();
    spotlightWindow.focus();
  }
}

// Create system tray
function createTray() {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  updateTrayMenu();
  
  tray.setToolTip('Electron Clipboard Manager');
  
  // Click on tray icon to show window
  tray.on('click', () => {
    checkClipboard(); // Update clipboard before showing menu
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      windows[0].isVisible() ? windows[0].hide() : windows[0].show();
    } else {
      createWindow();
    }
  });
  
  // Check clipboard when right-clicking (opening context menu)
  tray.on('right-click', () => {
    checkClipboard();
  });
}

// Function to update tray menu with current clipboard history
function updateTrayMenu() {
  if (!tray || !db) return;
  
  const icon = createTrayIcon();
  
  // Get recent entries from database
  const recentEntries = db.getRecentEntries(3);
  
  // Build history menu items
  const historyMenuItems = recentEntries.length > 0
    ? recentEntries.map((entry) => ({
        label: entry.custom_name || truncateText(entry.content, 50),
        click: () => {
          clipboard.writeText(entry.content);
          const { dialog } = require('electron');
          const windows = BrowserWindow.getAllWindows();
          const targetWindow = windows.find(w => w.isVisible()) || windows[0];
          
          if (targetWindow) {
            dialog.showMessageBox(targetWindow, {
              type: 'info',
              title: 'Text Copied',
              message: 'Text copied to clipboard!',
              detail: truncateText(entry.content, 100),
              buttons: ['OK']
            });
          }
        }
      }))
    : [{
        label: '(No clipboard history)',
        enabled: false
      }];
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Clipboard Manager',
      enabled: false,
      icon: icon.resize({ width: 16, height: 16 })
    },
    { type: 'separator' },
    {
      label: 'Recent Clipboard Items',
      enabled: false
    },
    ...historyMenuItems,
    { type: 'separator' },
    {
      label: 'Copy Selected Text',
      click: () => {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
          // Get the first visible window or just the first window
          const targetWindow = windows.find(w => w.isVisible()) || windows[0];
          
          // Make sure the window is visible and focused
          if (!targetWindow.isVisible()) {
            targetWindow.show();
          }
          targetWindow.focus();
          
          // Execute JavaScript in the renderer process to get selected text
          targetWindow.webContents.executeJavaScript('window.getSelection().toString()')
            .then(selectedText => {
              if (selectedText && selectedText.trim()) {
                clipboard.writeText(selectedText);
                addToClipboardHistory(selectedText); // Add to history
                console.log('Selected text copied to clipboard:', selectedText);
                
                // Show a notification that text was copied
                const { dialog } = require('electron');
                dialog.showMessageBox(targetWindow, {
                  type: 'info',
                  title: 'Text Copied',
                  message: 'Selected text copied to clipboard!',
                  detail: `Copied: "${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}"`,
                  buttons: ['OK']
                });
              } else {
                // No text selected
                const { dialog } = require('electron');
                dialog.showMessageBox(targetWindow, {
                  type: 'warning',
                  title: 'No Text Selected',
                  message: 'Please select some text first',
                  detail: 'Highlight text in the application before using Copy Selected Text',
                  buttons: ['OK']
                });
              }
            })
            .catch(err => {
              console.error('Error getting selected text:', err);
              // Show error dialog
              const { dialog } = require('electron');
              dialog.showMessageBox(targetWindow, {
                type: 'error',
                title: 'Error',
                message: 'Failed to copy selected text',
                detail: err.message,
                buttons: ['OK']
              });
            });
        } else {
          // No windows open - create one first
          createWindow();
        }
      }
    },
    {
      label: 'Paste from Clipboard',
      click: () => {
        const text = clipboard.readText();
        console.log('Clipboard content:', text);
        const { dialog } = require('electron');
        dialog.showMessageBox({
          type: 'info',
          title: 'Clipboard Content',
          message: 'Current clipboard content:',
          detail: text || '(empty)',
          buttons: ['OK']
        });
      }
    },
    {
      label: 'View Clipboard History',
      click: () => {
        const windows = BrowserWindow.getAllWindows();
        const targetWindow = windows.find(w => w.isVisible()) || windows[0];
        
        if (targetWindow && db) {
          const { dialog } = require('electron');
          const allEntries = db.getRecentEntries(10);
          const totalCount = db.getCount();
          
          const historyText = allEntries.length > 0
            ? allEntries.map((entry, i) => {
                const label = entry.custom_name || truncateText(entry.content, 80);
                return `${i + 1}. ${label}`;
              }).join('\n\n')
            : 'No clipboard history';
          
          dialog.showMessageBox(targetWindow, {
            type: 'info',
            title: 'Clipboard History',
            message: `${totalCount} total items in database:`,
            detail: historyText,
            buttons: ['OK']
          });
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Clear Clipboard',
      click: () => {
        clipboard.clear();
        console.log('Clipboard cleared');
      }
    },
    { type: 'separator' },
    {
      label: 'Show App',
      click: () => {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
          windows[0].show();
          windows[0].focus();
        } else {
          createWindow();
        }
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
}

// Register global shortcut to toggle the app window
function registerGlobalShortcut() {
  // Register Ctrl+F9 (or Cmd+F9 on macOS) to toggle app visibility
  const shortcut = 'CommandOrControl+F9';
  
  const registered = globalShortcut.register(shortcut, () => {
    toggleSpotlightWindow();
  });

  if (!registered) {
    console.error('Global shortcut registration failed');
  } else {
    console.log(`Global shortcut registered: ${shortcut}`);
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Load settings
  loadSettings();
  
  // Initialize database
  db = new ClipboardDatabase();
  console.log('Database initialized with', db.getCount(), 'entries');
  
  // Setup IPC handlers
  setupIPC();
  
  // Build menu from template
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  
  // Create system tray
  createTray();
  
  // Register global shortcut
  registerGlobalShortcut();
  
  // Start monitoring clipboard
  startClipboardMonitoring();
  
  // Check clipboard immediately to populate initial history
  checkClipboard();
  
  createWindow();

  // On macOS, re-create a window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  // Keep the app running in the background with the tray icon
  // Don't quit on window close, only quit from tray menu
  if (process.platform !== 'darwin' && process.platform !== 'linux') {
    app.quit();
  }
});

// Cleanup tray and database on quit
app.on('before-quit', () => {
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();
  
  if (tray) {
    tray.destroy();
  }
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
});
