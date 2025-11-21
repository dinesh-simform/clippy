import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Slider,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Alert
} from '@mui/material';

const { ipcRenderer } = window.require('electron');

function Settings({ open, onClose }) {
  const [settings, setSettings] = useState({
    clipboardCheckInterval: 2000,
    minCheckDelay: 500,
    maxEntries: 1000
  });
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (open) {
      // Load current settings when dialog opens
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    try {
      const currentSettings = await ipcRenderer.invoke('get-settings');
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      const success = await ipcRenderer.invoke('update-settings', settings);
      if (success) {
        setSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
        setTimeout(() => {
          setSaveStatus(null);
          onClose();
        }, 1500);
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus({ type: 'error', message: 'Error saving settings' });
    }
  };

  const handleIntervalChange = (event) => {
    const value = parseInt(event.target.value) || 1000;
    setSettings({ ...settings, clipboardCheckInterval: value });
  };

  const handleDelayChange = (event) => {
    const value = parseInt(event.target.value) || 100;
    setSettings({ ...settings, minCheckDelay: value });
  };

  const handleMaxEntriesChange = (event) => {
    const value = parseInt(event.target.value) || 100;
    setSettings({ ...settings, maxEntries: value });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        {saveStatus && (
          <Alert severity={saveStatus.type} sx={{ mb: 2 }}>
            {saveStatus.message}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          {/* Clipboard Check Interval */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Clipboard Check Interval
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              How often to check for clipboard changes (1000-60000 ms)
            </Typography>
            <OutlinedInput
              type="number"
              value={settings.clipboardCheckInterval}
              onChange={handleIntervalChange}
              endAdornment={<InputAdornment position="end">ms</InputAdornment>}
              inputProps={{
                min: 1000,
                max: 60000,
                step: 100
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Current: {(settings.clipboardCheckInterval / 1000).toFixed(1)}s
              {' | '}
              Recommended: 2000ms (2s)
            </Typography>
          </FormControl>

          {/* Minimum Check Delay */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Minimum Check Delay
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Debounce delay to prevent rapid checks (100-5000 ms)
            </Typography>
            <OutlinedInput
              type="number"
              value={settings.minCheckDelay}
              onChange={handleDelayChange}
              endAdornment={<InputAdornment position="end">ms</InputAdornment>}
              inputProps={{
                min: 100,
                max: 5000,
                step: 50
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Current: {(settings.minCheckDelay / 1000).toFixed(2)}s
              {' | '}
              Recommended: 500ms (0.5s)
            </Typography>
          </FormControl>

          {/* Maximum Entries */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography gutterBottom>
              Maximum Entries
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Maximum number of clipboard entries to keep (100-10000)
            </Typography>
            <OutlinedInput
              type="number"
              value={settings.maxEntries}
              onChange={handleMaxEntriesChange}
              endAdornment={<InputAdornment position="end">entries</InputAdornment>}
              inputProps={{
                min: 100,
                max: 10000,
                step: 100
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Current: {settings.maxEntries.toLocaleString()} entries
              {' | '}
              Recommended: 1000 entries
            </Typography>
          </FormControl>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Performance Note:</strong> Lower check intervals may use more CPU. 
              Higher max entries may use more memory and storage.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Settings;
