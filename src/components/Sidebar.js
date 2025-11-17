import React, { useEffect, useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  Button
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import StarIcon from '@mui/icons-material/Star';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import EmailIcon from '@mui/icons-material/Email';
import ImageIcon from '@mui/icons-material/Image';
import LabelIcon from '@mui/icons-material/Label';
import AddIcon from '@mui/icons-material/Add';

const { ipcRenderer } = window.require('electron');

const drawerWidth = 240;

const defaultCategories = [
  { id: 'all', label: 'All Items', icon: <HistoryIcon />, type: 'default' },
  { id: 'favorites', label: 'Favorites', icon: <StarIcon />, type: 'default' },
  { id: 'urls', label: 'URLs', icon: <LinkIcon />, type: 'default' },
  { id: 'code', label: 'Code', icon: <CodeIcon />, type: 'default' },
  { id: 'emails', label: 'Emails', icon: <EmailIcon />, type: 'default' },
  { id: 'images', label: 'Images', icon: <ImageIcon />, type: 'default' },
];

function Sidebar({ selectedCategory, onCategoryChange, onManageCategories }) {
  const [customCategories, setCustomCategories] = useState([]);

  useEffect(() => {
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    try {
      const cats = await ipcRenderer.invoke('get-all-categories');
      setCustomCategories(cats);
    } catch (error) {
      console.error('Error loading custom categories:', error);
    }
  };

  // Refresh categories when categories are updated from parent
  useEffect(() => {
    const handleCategoriesUpdate = () => {
      loadCustomCategories();
    };

    // Listen for category updates
    window.addEventListener('categories-updated', handleCategoriesUpdate);
    return () => window.removeEventListener('categories-updated', handleCategoriesUpdate);
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: 'none'
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HistoryIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Clippy
          </Typography>
        </Box>
      </Toolbar>
      
      {/* Default Categories */}
      <List sx={{ px: 1.5, pt: 2 }}>
        {defaultCategories.map((category) => (
          <ListItem key={category.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={selectedCategory === category.id}
              onClick={() => onCategoryChange(category.id)}
              sx={{
                borderRadius: 2,
                py: 1.2,
                '&.Mui-selected': {
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.lighter',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  }
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: selectedCategory === category.id ? 'primary.main' : 'text.secondary'
                }}
              >
                {category.icon}
              </ListItemIcon>
              <ListItemText 
                primary={category.label}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: selectedCategory === category.id ? 600 : 500
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Custom Categories Section */}
      {customCategories.length > 0 && (
        <>
          <Divider sx={{ mx: 1.5, my: 1 }} />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600, 
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Custom Categories
            </Typography>
          </Box>
          <List sx={{ px: 1.5 }}>
            {customCategories.map((category) => (
              <ListItem key={`custom-${category.id}`} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={selectedCategory === `custom-${category.id}`}
                  onClick={() => onCategoryChange(`custom-${category.id}`)}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                      }
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 1,
                        bgcolor: category.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <LabelIcon sx={{ fontSize: 14, color: 'white' }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={category.name}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: selectedCategory === `custom-${category.id}` ? 600 : 500
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* Manage Categories Button */}
      <Box sx={{ p: 1.5, mt: 'auto' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onManageCategories}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
              bgcolor: 'primary.lighter'
            }
          }}
        >
          Manage Categories
        </Button>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
