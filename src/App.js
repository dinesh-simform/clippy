  
import React, { useState, useEffect } from 'react';
import {
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
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

const { ipcRenderer } = window.require('electron');

// ...theme definition (same as before)...
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb', lighter: '#eff6ff' },
    secondary: { main: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed' },
    success: { main: '#10b981', lighter: '#d1fae5' },
    error: { main: '#ef4444', lighter: '#fee2e2' },
    warning: { main: '#f59e0b', lighter: '#fef3c7' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    divider: '#e2e8f0',
    text: { primary: '#1e293b', secondary: '#64748b' },
    action: { hover: '#f1f5f9', disabled: '#cbd5e1' }
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
    MuiAppBar: { styleOverrides: { root: { boxShadow: 'none', borderBottom: '1px solid #e2e8f0' } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none' } } } },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 8 } } }
  }
});

function App() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
  // Fetch clipboard entries
  const fetchEntries = async () => {
    setLoading(true);
    let allEntries = await ipcRenderer.invoke('get-entries-with-categories');
    setEntries(allEntries);
    filterEntries(allEntries, selectedCategory, searchQuery, dateRange);
    setLoading(false);
  };

  // Filter entries based on category, search, and date
  const filterEntries = (allEntries, category, query, range) => {
    let filtered = [...allEntries];
    // Category filter
    if (category === 'favorites') filtered = filtered.filter(e => e.is_favorite);
    else if (category === 'urls') filtered = filtered.filter(e => /^https?:\/\/.+/i.test(e.content));
    else if (category === 'emails') filtered = filtered.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.content));
    else if (category === 'code') filtered = filtered.filter(e => /^(function|const|let|var|class|import|export|if|for|while)/.test(e.content));
    else if (category.startsWith('custom-')) {
      const catId = parseInt(category.replace('custom-', ''));
      filtered = filtered.filter(e => (e.categories || []).some(c => c.id === catId));
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
  };

  useEffect(() => { fetchEntries(); }, []);
  useEffect(() => { filterEntries(entries, selectedCategory, searchQuery, dateRange); }, [selectedCategory, searchQuery, dateRange, entries]);
  useEffect(() => {
    const handleUpdate = () => fetchEntries();
    ipcRenderer.on('clipboard-updated', handleUpdate);
    return () => ipcRenderer.removeListener('clipboard-updated', handleUpdate);
  }, []);

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
      </Box>
    </ThemeProvider>
  );
}

export default App;
