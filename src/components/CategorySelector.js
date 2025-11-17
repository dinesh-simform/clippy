import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Chip
} from '@mui/material';
import LabelIcon from '@mui/icons-material/Label';

const { ipcRenderer } = window.require('electron');

function CategorySelector({ open, onClose, entryId, currentCategories = [], onCategoriesUpdated }) {
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    if (open) {
      loadCategories();
      setSelectedCategories(currentCategories.map(c => c.id));
    }
  }, [open, currentCategories]);

  const loadCategories = async () => {
    try {
      const cats = await ipcRenderer.invoke('get-all-categories');
      setAllCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = async () => {
    try {
      // Get categories to add and remove
      const currentIds = currentCategories.map(c => c.id);
      const toAdd = selectedCategories.filter(id => !currentIds.includes(id));
      const toRemove = currentIds.filter(id => !selectedCategories.includes(id));

      // Add new categories
      for (const categoryId of toAdd) {
        await ipcRenderer.invoke('assign-category', entryId, categoryId);
      }

      // Remove deselected categories
      for (const categoryId of toRemove) {
        await ipcRenderer.invoke('remove-category', entryId, categoryId);
      }

      onCategoriesUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating categories:', error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        Assign Categories
      </DialogTitle>
      <DialogContent>
        {allCategories.length === 0 ? (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No categories available. Create some in the category manager!
            </Typography>
          </Box>
        ) : (
          <FormGroup>
            {allCategories.map((category) => (
              <FormControlLabel
                key={category.id}
                control={
                  <Checkbox
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleToggle(category.id)}
                  />
                }
                label={
                  <Chip
                    icon={<LabelIcon sx={{ fontSize: 16 }} />}
                    label={category.name}
                    size="small"
                    sx={{
                      bgcolor: category.color,
                      color: 'white',
                      fontWeight: 500
                    }}
                  />
                }
              />
            ))}
          </FormGroup>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CategorySelector;
