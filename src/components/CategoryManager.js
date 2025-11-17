import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';

const { ipcRenderer } = window.require('electron');

const predefinedColors = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

function CategoryManager({ open, onClose, onCategoriesChanged }) {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      const cats = await ipcRenderer.invoke('get-all-categories');
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;

    try {
      if (editingId) {
        // Update existing category
        await ipcRenderer.invoke('update-category', editingId, newCategoryName, selectedColor, 'Label');
      } else {
        // Create new category
        await ipcRenderer.invoke('create-category', newCategoryName, selectedColor, 'Label');
      }
      
      setNewCategoryName('');
      setSelectedColor('#3b82f6');
      setEditingId(null);
      loadCategories();
      onCategoriesChanged();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category) => {
    setNewCategoryName(category.name);
    setSelectedColor(category.color);
    setEditingId(category.id);
  };

  const handleDelete = async (id) => {
    try {
      await ipcRenderer.invoke('delete-category', id);
      loadCategories();
      onCategoriesChanged();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleCancel = () => {
    setNewCategoryName('');
    setSelectedColor('#3b82f6');
    setEditingId(null);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
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
        Manage Custom Categories
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create custom categories to organize your clipboard items
          </Typography>
          
          {/* Color Picker */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Choose Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {predefinedColors.map((color) => (
                <Box
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: color,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: selectedColor === color ? 'text.primary' : 'transparent',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Category Name Input */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!newCategoryName.trim()}
              startIcon={editingId ? <EditIcon /> : <AddIcon />}
              sx={{ minWidth: 120 }}
            >
              {editingId ? 'Update' : 'Add'}
            </Button>
            {editingId && (
              <Button
                variant="outlined"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>

        {/* Categories List */}
        <Paper 
          variant="outlined" 
          sx={{ 
            maxHeight: 300, 
            overflow: 'auto',
            borderRadius: 2,
            bgcolor: 'background.default'
          }}
        >
          {categories.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No custom categories yet. Create one above!
              </Typography>
            </Box>
          ) : (
            <List dense>
              {categories.map((category) => (
                <ListItem 
                  key={category.id}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Chip
                    icon={<LabelIcon sx={{ fontSize: 16 }} />}
                    label={category.name}
                    size="small"
                    sx={{
                      bgcolor: category.color,
                      color: 'white',
                      fontWeight: 500,
                      mr: 1
                    }}
                  />
                  <ListItemText 
                    secondary={`Created ${new Date(category.created_at).toLocaleDateString()}`}
                    secondaryTypographyProps={{
                      fontSize: '0.7rem'
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(category)}
                      sx={{ mr: 0.5 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(category.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CategoryManager;
