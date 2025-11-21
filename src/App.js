  
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import ClipboardList from './components/ClipboardList';
import DateFilter from './components/DateFilter';
import CategoryManager from './components/CategoryManager';
import CategorySelector from './components/CategorySelector';
import Settings from './components/Settings';

const { ipcRenderer } = window.require('electron');

// Create theme function based on mode
const createAppTheme = (mode) => createTheme({
  palette: {
    mode: mode,
    primary: { 
      main: mode === 'light' ? '#3b82f6' : '#60a5fa', 
      light: '#60a5fa', 
      dark: '#2563eb', 
      lighter: mode === 'light' ? '#eff6ff' : '#1e3a8a' 
    },
    secondary: { 
      main: mode === 'light' ? '#8b5cf6' : '#a78bfa', 
      light: '#a78bfa', 
      dark: '#7c3aed' 
    },
    success: { 
      main: mode === 'light' ? '#10b981' : '#34d399', 
      lighter: mode === 'light' ? '#d1fae5' : '#064e3b' 
    },
    error: { 
      main: mode === 'light' ? '#ef4444' : '#f87171', 
      lighter: mode === 'light' ? '#fee2e2' : '#7f1d1d' 
    },
    warning: { 
      main: mode === 'light' ? '#f59e0b' : '#fbbf24', 
      lighter: mode === 'light' ? '#fef3c7' : '#78350f' 
    },
    background: { 
      default: mode === 'light' ? '#f8fafc' : '#0f172a', 
      paper: mode === 'light' ? '#ffffff' : '#1e293b' 
    },
    divider: mode === 'light' ? '#e2e8f0' : '#334155',
    text: { 
      primary: mode === 'light' ? '#1e293b' : '#f1f5f9', 
      secondary: mode === 'light' ? '#64748b' : '#94a3b8' 
    },
    action: { 
      hover: mode === 'light' ? '#f1f5f9' : '#334155', 
      disabled: mode === 'light' ? '#cbd5e1' : '#475569' 
    }
  },
  typography: {
    fontFamily: [
      '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Inter"', 'system-ui', 'sans-serif',
    ].join(','),
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', fontWeight: 500 }
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: { 
      styleOverrides: { 
        root: { 
          boxShadow: 'none', 
          borderBottom: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #334155' 
        } 
      } 
    },
    MuiButton: { 
      styleOverrides: { 
        root: { 
          textTransform: 'none', 
          fontWeight: 600, 
          boxShadow: 'none', 
          '&:hover': { boxShadow: 'none' } 
        } 
      } 
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 8 } } }
  }
});

function App() {
  const [themeMode, setThemeMode] = useState('light');
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCategoryChips, setSelectedCategoryChips] = useState([]);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [categorySelector, setCategorySelector] = useState({ open: false, entryId: null, categories: [] });
  const [dateRange, setDateRange] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [encryptEntry, setEncryptEntry] = useState(false);
  const [entryPassword, setEntryPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Master password state
  const [masterPassword, setMasterPassword] = useState('');
  const [masterDialogOpen, setMasterDialogOpen] = useState(false);
  const [masterInput, setMasterInput] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  // Settings dialog state
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Create theme based on mode
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  // Load theme preference
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await ipcRenderer.invoke('get-theme-mode');
      if (savedTheme) setThemeMode(savedTheme);
    };
    loadTheme();
  }, []);

  // Toggle theme (memoized)
  const handleThemeToggle = useCallback(async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    await ipcRenderer.invoke('set-theme-mode', newMode);
  }, [themeMode]);

  // Load categories (memoized)
  const loadCategories = useCallback(async () => {
    const cats = await ipcRenderer.invoke('get-all-categories');
    setCategories(cats);
  }, []);

  useEffect(() => {
    loadCategories();
    const handleCategoriesUpdate = () => loadCategories();
    window.addEventListener('categories-updated', handleCategoriesUpdate);
    return () => window.removeEventListener('categories-updated', handleCategoriesUpdate);
  }, [loadCategories]);

  // Handler to save master password
  const handleSaveMasterPassword = () => {
    setMasterPassword(masterInput);
    setMasterDialogOpen(false);
    setMasterInput('');
    setSnackbar({ open: true, message: 'Master password set!', severity: 'success' });
  };
  // Add new entry handler
  const handleAddEntry = async () => {
    if (!newEntryText.trim()) return;
    await ipcRenderer.invoke('add-entry', newEntryText, {
      encrypt: encryptEntry,
      password: entryPassword,
      title: newEntryTitle
    });
    setAddDialogOpen(false);
    setNewEntryText('');
    setNewEntryTitle('');
    setEncryptEntry(false);
    setEntryPassword('');
    setShowPassword(false);
    fetchEntries();
    setSnackbar({ open: true, message: encryptEntry ? 'Encrypted entry added!' : 'Entry added!', severity: 'success' });
  };
  // Fetch clipboard entries (memoized)
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    let allEntries = await ipcRenderer.invoke('get-entries-with-categories');
    setEntries(allEntries);
    filterEntries(allEntries, selectedCategory, searchQuery, dateRange, selectedCategoryChips);
    setLoading(false);
  }, [selectedCategory, searchQuery, dateRange, selectedCategoryChips]);

  // Filter entries based on category, search, and date (memoized)
  const filterEntries = useCallback((allEntries, category, query, range, chipFilters = []) => {
    let filtered = [...allEntries];
    // Category filter from sidebar
    if (category === 'favorites') filtered = filtered.filter(e => e.is_favorite);
    else if (category === 'urls') filtered = filtered.filter(e => /^https?:\/\/.+/i.test(e.content));
    else if (category === 'emails') filtered = filtered.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.content));
    else if (category === 'code') filtered = filtered.filter(e => /^(function|const|let|var|class|import|export|if|for|while)/.test(e.content));
    else if (category.startsWith('custom-')) {
      const catId = parseInt(category.replace('custom-', ''));
      filtered = filtered.filter(e => (e.categories || []).some(c => c.id === catId));
    }
    
    // Category chip filters (multiple categories including default and custom)
    if (chipFilters.length > 0) {
      filtered = filtered.filter(e => {
        return chipFilters.some(chipCat => {
          // Handle default categories (strings)
          if (chipCat === 'favorites') return e.is_favorite;
          if (chipCat === 'urls') return /^https?:\/\/.+/i.test(e.content);
          if (chipCat === 'emails') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.content);
          if (chipCat === 'code') return /^(function|const|let|var|class|import|export|if|for|while)/.test(e.content);
          // Handle custom categories (numeric IDs)
          if (typeof chipCat === 'number') {
            const entryCategoryIds = (e.categories || []).map(c => c.id);
            return entryCategoryIds.includes(chipCat);
          }
          return false;
        });
      });
    }
    
    // Search filter
    if (query) filtered = filtered.filter(e => e.content.toLowerCase().includes(query.toLowerCase()) || (e.custom_name && e.custom_name.toLowerCase().includes(query.toLowerCase())));
    // Date filter
    if (range !== 'all') {
      const now = new Date();
      let start, end = now.getTime();
      if (range === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      } else if (range === 'yesterday') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      } else if (range === 'last7days') {
        start = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      } else if (range === 'last30days') {
        start = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      } else if (range === 'last90days') {
        start = now.getTime() - 90 * 24 * 60 * 60 * 1000;
      }
      filtered = filtered.filter(e => e.timestamp >= start && e.timestamp <= end);
    }
    setFilteredEntries(filtered);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);
  useEffect(() => { filterEntries(entries, selectedCategory, searchQuery, dateRange, selectedCategoryChips); }, [filterEntries, entries, selectedCategory, searchQuery, dateRange, selectedCategoryChips]);
  useEffect(() => {
    const handleUpdate = () => fetchEntries();
    ipcRenderer.on('clipboard-updated', handleUpdate);
    return () => ipcRenderer.removeListener('clipboard-updated', handleUpdate);
  }, [fetchEntries]);

  // Handlers
  const handleSearchChange = (query) => setSearchQuery(query);
  const handleCategoryChange = (cat) => setSelectedCategory(cat);
  const handleDateRangeChange = (range) => setDateRange(range);
  const handleCopy = async (id) => { await ipcRenderer.invoke('copy-entry', id); setSnackbar({ open: true, message: 'Copied to clipboard!', severity: 'success' }); };
  const handleDelete = async (id) => { await ipcRenderer.invoke('delete-entry', id); fetchEntries(); setSnackbar({ open: true, message: 'Entry deleted', severity: 'success' }); };
  const handleToggleFavorite = async (id) => { await ipcRenderer.invoke('toggle-favorite', id); fetchEntries(); };
  const handleClearAll = async () => { await ipcRenderer.invoke('clear-all-entries'); setClearDialogOpen(false); fetchEntries(); setSnackbar({ open: true, message: 'All entries cleared', severity: 'success' }); };
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const handleManageCategories = () => setCategoryManagerOpen(true);
  const handleCategoriesChanged = () => { window.dispatchEvent(new Event('categories-updated')); fetchEntries(); };
  const handleAssignCategories = (entryId, categories) => setCategorySelector({ open: true, entryId, categories });
  const handleCategorySelectorClose = () => setCategorySelector({ open: false, entryId: null, categories: [] });
  const handleCategorySelectorUpdated = () => { handleCategorySelectorClose(); fetchEntries(); };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {/* App Bar */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', color: 'text.primary' }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'primary.main' }}>
              Clipboard Manager
            </Typography>
            <IconButton onClick={handleThemeToggle} color="primary" sx={{ mr: 1 }}>
              {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
            <IconButton onClick={() => setSettingsOpen(true)} color="primary" sx={{ mr: 1 }}>
              <SettingsIcon />
            </IconButton>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ ml: 2 }}
              onClick={() => setMasterDialogOpen(true)}
            >
              {masterPassword ? 'Change Master Password' : 'Set Master Password'}
            </Button>
        {/* Master Password Dialog */}
        <Dialog open={masterDialogOpen} onClose={() => setMasterDialogOpen(false)}>
          <DialogTitle>Set Master Password</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Master Password"
              type={showMasterPassword ? 'text' : 'password'}
              fullWidth
              value={masterInput}
              onChange={e => setMasterInput(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowMasterPassword(v => !v)} edge="end" size="small">
                      {showMasterPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMasterDialogOpen(false)} color="primary">Cancel</Button>
            <Button onClick={handleSaveMasterPassword} color="primary" variant="contained" disabled={!masterInput.trim()}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
            <Box sx={{ px: 2, py: 0.5, bgcolor: 'primary.lighter', borderRadius: 2, mr: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {entries.length} {entries.length === 1 ? 'item' : 'items'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{ mr: 2, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
              onClick={() => setAddDialogOpen(true)}
            >
              Add Entry
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteSweepIcon />}
              onClick={() => setClearDialogOpen(true)}
              disabled={entries.length === 0}
              sx={{ borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'error.main', color: 'error.main', bgcolor: 'error.lighter' } }}
            >
              Clear All
            </Button>
        {/* Add Entry Dialog */}
        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' } }}>
          <DialogTitle sx={{ fontWeight: 600 }}>Add Clipboard Entry</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title (plain text)"
              type="text"
              fullWidth
              value={newEntryTitle}
              onChange={e => setNewEntryTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Clipboard Content"
              type="text"
              fullWidth
              multiline
              minRows={2}
              value={newEntryText}
              onChange={e => setNewEntryText(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={<Switch checked={encryptEntry} onChange={e => setEncryptEntry(e.target.checked)} color="primary" />}
              label="Encrypt this entry"
            />
            {encryptEntry && (
              <TextField
                margin="dense"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={entryPassword}
                onChange={e => setEntryPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(v => !v)} edge="end" size="small">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mt: 1 }}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setAddDialogOpen(false)} variant="outlined">Cancel</Button>
            <Button onClick={handleAddEntry} variant="contained" color="primary" disabled={!newEntryText.trim() || (encryptEntry && !entryPassword)}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
          </Toolbar>
        </AppBar>
        {/* Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          onManageCategories={handleManageCategories}
        />
        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 240px)` }, bgcolor: 'background.default', minHeight: '100vh' }}>
          <Toolbar />
          <Container maxWidth="lg">
            {/* Search and Date Filter Row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
              <DateFilter selectedRange={dateRange} onRangeChange={handleDateRangeChange} />
            </Box>
            
            {/* Category Filter Chips */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
                Filter by categories:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {/* Default Categories */}
                <Chip
                  label="Favorites"
                  icon={<span>⭐</span>}
                  onClick={() => {
                    setSelectedCategoryChips(prev => 
                      prev.includes('favorites') 
                        ? prev.filter(id => id !== 'favorites')
                        : [...prev, 'favorites']
                    );
                  }}
                  variant={selectedCategoryChips.includes('favorites') ? 'filled' : 'outlined'}
                  sx={{
                    borderColor: '#ffc107',
                    bgcolor: selectedCategoryChips.includes('favorites') ? '#ffc107' : 'transparent',
                    color: selectedCategoryChips.includes('favorites') ? '#000' : 'text.primary',
                    '&:hover': {
                      bgcolor: selectedCategoryChips.includes('favorites') ? '#ffb300' : 'action.hover',
                    },
                    mb: 1
                  }}
                />
                <Chip
                  label="URLs"
                  icon={<span>🔗</span>}
                  onClick={() => {
                    setSelectedCategoryChips(prev => 
                      prev.includes('urls') 
                        ? prev.filter(id => id !== 'urls')
                        : [...prev, 'urls']
                    );
                  }}
                  variant={selectedCategoryChips.includes('urls') ? 'filled' : 'outlined'}
                  sx={{
                    borderColor: '#2196f3',
                    bgcolor: selectedCategoryChips.includes('urls') ? '#2196f3' : 'transparent',
                    color: selectedCategoryChips.includes('urls') ? '#fff' : 'text.primary',
                    '&:hover': {
                      bgcolor: selectedCategoryChips.includes('urls') ? '#1976d2' : 'action.hover',
                    },
                    mb: 1
                  }}
                />
                <Chip
                  label="Emails"
                  icon={<span>📧</span>}
                  onClick={() => {
                    setSelectedCategoryChips(prev => 
                      prev.includes('emails') 
                        ? prev.filter(id => id !== 'emails')
                        : [...prev, 'emails']
                    );
                  }}
                  variant={selectedCategoryChips.includes('emails') ? 'filled' : 'outlined'}
                  sx={{
                    borderColor: '#4caf50',
                    bgcolor: selectedCategoryChips.includes('emails') ? '#4caf50' : 'transparent',
                    color: selectedCategoryChips.includes('emails') ? '#fff' : 'text.primary',
                    '&:hover': {
                      bgcolor: selectedCategoryChips.includes('emails') ? '#388e3c' : 'action.hover',
                    },
                    mb: 1
                  }}
                />
                <Chip
                  label="Code"
                  icon={<span>💻</span>}
                  onClick={() => {
                    setSelectedCategoryChips(prev => 
                      prev.includes('code') 
                        ? prev.filter(id => id !== 'code')
                        : [...prev, 'code']
                    );
                  }}
                  variant={selectedCategoryChips.includes('code') ? 'filled' : 'outlined'}
                  sx={{
                    borderColor: '#9c27b0',
                    bgcolor: selectedCategoryChips.includes('code') ? '#9c27b0' : 'transparent',
                    color: selectedCategoryChips.includes('code') ? '#fff' : 'text.primary',
                    '&:hover': {
                      bgcolor: selectedCategoryChips.includes('code') ? '#7b1fa2' : 'action.hover',
                    },
                    mb: 1
                  }}
                />
                
                {/* Custom Categories */}
                {categories.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.name}
                    icon={<span>{cat.icon || '📁'}</span>}
                    onClick={() => {
                      setSelectedCategoryChips(prev => 
                        prev.includes(cat.id) 
                          ? prev.filter(id => id !== cat.id)
                          : [...prev, cat.id]
                      );
                    }}
                    variant={selectedCategoryChips.includes(cat.id) ? 'filled' : 'outlined'}
                    sx={{
                      borderColor: cat.color || 'divider',
                      bgcolor: selectedCategoryChips.includes(cat.id) ? cat.color : 'transparent',
                      color: selectedCategoryChips.includes(cat.id) ? '#fff' : 'text.primary',
                      '&:hover': {
                        bgcolor: selectedCategoryChips.includes(cat.id) ? cat.color : 'action.hover',
                      },
                      mb: 1
                    }}
                  />
                ))}
                {selectedCategoryChips.length > 0 && (
                  <Chip
                    label="Clear filters"
                    size="small"
                    onDelete={() => setSelectedCategoryChips([])}
                    color="default"
                    sx={{ mb: 1 }}
                  />
                )}
              </Stack>
            </Box>
            
            {/* Clipboard List */}
            <ClipboardList
              entries={filteredEntries}
              loading={loading}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onManageCategories={handleAssignCategories}
              masterPassword={masterPassword}
            />
          </Container>
        </Box>
        {/* Clear All Confirmation Dialog */}
        <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' } }}>
          <DialogTitle sx={{ fontWeight: 600 }}>Clear All Clipboard History?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will permanently delete all clipboard entries. This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setClearDialogOpen(false)} variant="outlined">Cancel</Button>
            <Button onClick={handleClearAll} variant="contained" color="error">Clear All</Button>
          </DialogActions>
        </Dialog>
        {/* Snackbar for notifications */}
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', boxShadow: 'none', border: '1px solid', borderColor: snackbar.severity === 'success' ? 'success.main' : 'error.main' }}>{snackbar.message}</Alert>
        </Snackbar>
        {/* Category Manager Dialog */}
        <CategoryManager open={categoryManagerOpen} onClose={() => setCategoryManagerOpen(false)} onCategoriesChanged={handleCategoriesChanged} />
        {/* Category Selector Dialog */}
        <CategorySelector open={categorySelector.open} onClose={handleCategorySelectorClose} entryId={categorySelector.entryId} currentCategories={categorySelector.categories} onCategoriesUpdated={handleCategorySelectorUpdated} />
        {/* Settings Dialog */}
        <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
