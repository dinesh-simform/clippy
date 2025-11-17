const { app, BrowserWindow, Menu, Tray, clipboard, nativeImage } = require('electron');
const path = require('path');
const { createTrayIcon } = require('./create-icon');

let tray = null;
let clipboardHistory = []; // Store clipboard history
const MAX_HISTORY = 10; // Maximum number of items to keep in history
let lastClipboardText = ''; // Track last clipboard content

// Function to check and update clipboard
function checkClipboard() {
  const currentText = clipboard.readText();
  
  // If clipboard has new content, add it to history
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
function addToClipboardHistory(text) {
  if (!text || !text.trim()) return;
  
  // Remove if already exists (to move it to top)
  clipboardHistory = clipboardHistory.filter(item => item !== text);
  
  // Add to beginning of array
  clipboardHistory.unshift(text);
  
  // Keep only MAX_HISTORY items
  if (clipboardHistory.length > MAX_HISTORY) {
    clipboardHistory = clipboardHistory.slice(0, MAX_HISTORY);
  }
  
  // Update tray menu to reflect new history
  updateTrayMenu();
}

// Function to truncate text with ellipsis
function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
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
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open DevTools in development (optional)
  // mainWindow.webContents.openDevTools();
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
  if (!tray) return;
  
  const icon = createTrayIcon();
  
  // Build history menu items
  const historyMenuItems = clipboardHistory.length > 0
    ? clipboardHistory.slice(0, 3).map((text, index) => ({
        label: truncateText(text, 50),
        click: () => {
          clipboard.writeText(text); 
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
        
        if (targetWindow) {
          const { dialog } = require('electron');
          const historyText = clipboardHistory.length > 0
            ? clipboardHistory.map((text, i) => `${i + 1}. ${truncateText(text, 80)}`).join('\n\n')
            : 'No clipboard history';
          
          dialog.showMessageBox(targetWindow, {
            type: 'info',
            title: 'Clipboard History',
            message: `${clipboardHistory.length} items in history:`,
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
    {
      label: 'Clear History',
      click: () => {
        clipboardHistory = [];
        updateTrayMenu();
        console.log('Clipboard history cleared');
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

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Build menu from template
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  
  // Create system tray
  createTray();
  
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

// Cleanup tray on quit
app.on('before-quit', () => {
  if (tray) {
    tray.destroy();
  }
});
