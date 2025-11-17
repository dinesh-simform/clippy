import React, { useState } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import EmailIcon from '@mui/icons-material/Email';
import LabelIcon from '@mui/icons-material/Label';

const { ipcRenderer } = window.require('electron');

function EntryCard({ entry, onCopy, onDelete, onToggleFavorite, onManageCategories, masterPassword }) {
  // Determine source: manual or clipboard
  // If entry.custom_name is set at creation, treat as manual; else clipboard
  const isManual = !!entry.custom_name;
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
    const [decryptDialogOpen, setDecryptDialogOpen] = useState(false);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const detectCategory = (text) => {
    const urlPattern = /^https?:\/\/.+/i;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const codePattern = /^(function|const|let|var|class|import|export|if|for|while)/;

    if (urlPattern.test(text)) return { label: 'URL', icon: <LinkIcon fontSize="small" />, color: 'primary' };
    if (emailPattern.test(text)) return { label: 'Email', icon: <EmailIcon fontSize="small" />, color: 'secondary' };
    if (codePattern.test(text)) return { label: 'Code', icon: <CodeIcon fontSize="small" />, color: 'success' };
    
    return null;
  };

  const category = detectCategory(entry.content);

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Decrypt handler
  const handleDecrypt = async () => {
    setDecrypting(true);
    setError('');
    try {
      const result = await ipcRenderer.invoke('decrypt-entry', entry.id, password, masterPassword);
      if (result && result.success) {
        setDecryptedContent(result.content);
        setShowDecrypted(true);
      } else {
        setError(result && result.error ? result.error : 'Decryption failed');
      }
    } catch (e) {
      setError('Decryption failed');
    }
    setDecrypting(false);
  };
// console.log("entry",entry);
  return (
    <Card 
      sx={{ 
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': { 
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          bgcolor: 'action.hover'
        }
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Source chip */}
          <Chip
            label={isManual ? 'Manual' : 'Clipboard'}
            size="small"
            color={isManual ? 'secondary' : 'primary'}
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
          />
          {/* Encrypted chip and show as plaintext button */}
          {entry.is_encrypted ? (
            <>
              <Chip
                label="Encrypted"
                size="small"
                color="warning"
                icon={<LockIcon sx={{ fontSize: 16 }} />}
                sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
              />
              <Button
                size="small"
                variant="outlined"
                sx={{ ml: 1, fontSize: '0.7rem', height: 24, minWidth: 0, px: 1 }}
                onClick={() => setDecryptDialogOpen(true)}
              >
                Show as Plaintext
              </Button>
            </>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {category && (
              <Chip
                icon={category.icon}
                label={category.label}
                size="small"
                color={category.color}
                variant="outlined"
                sx={{ 
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              />
            )}
            {/* Show custom categories */}
            {entry.categories && entry.categories.map((cat) => (
              <Chip
                key={cat.id}
                icon={<LabelIcon sx={{ fontSize: 14 }} />}
                label={cat.name}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  bgcolor: cat.color,
                  color: 'white'
                }}
              />
            ))}
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.5px'
              }}
            >
              {formatDate(entry.timestamp)}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => onToggleFavorite(entry.id)}
            sx={{ 
              color: entry.is_favorite ? 'warning.main' : 'action.disabled',
              '&:hover': {
                bgcolor: entry.is_favorite ? 'warning.lighter' : 'action.hover'
              }
            }}
          >
            {entry.is_favorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
          </IconButton>
        </Box>
        

        {/* Show "Show as Plaintext" button at the exact top of this content */}
        {entry.is_encrypted && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                <Button
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 24, minWidth: 0, px: 1 }}
                    onClick={() => setDecryptDialogOpen(true)}
                >
                    Show as Plaintext
                </Button>
            </Box>
        )}
        {/* Encrypted text with eye icon, shown in the same line */}
        {entry.is_encrypted ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                    variant="body2"
                    sx={{ fontStyle: 'italic', color: 'text.secondary', flex: 1 }}
                >
                    {entry.content}
                </Typography>
                <Tooltip title={showDecrypted ? 'Hide content' : 'Reveal content'}>
                    <IconButton size="small" onClick={() => {
                        if (showDecrypted) {
                            setShowDecrypted(false);
                            setDecryptedContent('');
                            setPassword('');
                            setError('');
                        } else {
                            setDecryptDialogOpen(true);
                        }
                    }}>
                        {showDecrypted ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                </Tooltip>
            </Box>
        ) : null}
        <Typography 
          variant="body2" 
          sx={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            fontFamily: category?.label === 'Code' ? 'monospace' : 'inherit',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: 'text.primary'
          }}
        >
          {showDecrypted ? truncateText(decryptedContent) : (!entry.is_encrypted ? truncateText(entry.content) : null)}
        </Typography>

        {/* Decrypt password dialog */}
        <Dialog open={decryptDialogOpen} onClose={() => setDecryptDialogOpen(false)}>
          <DialogTitle>Enter Password to Reveal</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              disabled={decrypting}
            />
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDecryptDialogOpen(false)} color="primary">Cancel</Button>
            <Button onClick={handleDecrypt} color="primary" variant="contained" disabled={!password || decrypting}>
              {decrypting ? 'Decrypting...' : 'Reveal'}
            </Button>
          </DialogActions>
        </Dialog>

        {entry.custom_name && (
          <Box 
            sx={{ 
              mt: 1.5, 
              px: 1.5, 
              py: 0.5, 
              bgcolor: 'primary.lighter',
              borderRadius: 1,
              display: 'inline-block'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'primary.dark',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            >
              📌 {entry.custom_name}
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <CardActions 
        sx={{ 
          justifyContent: 'flex-end', 
          pt: 0, 
          pb: 1.5, 
          px: 2,
          gap: 0.5
        }}
      >
        <Tooltip title="Assign categories" arrow>
          <IconButton 
            size="small" 
            onClick={() => onManageCategories(entry.id, entry.categories || [])}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'primary.main'
              }
            }}
          >
            <LabelIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy to clipboard" arrow>
          <IconButton 
            size="small" 
            onClick={() => onCopy(entry.id)}
            sx={{
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.lighter'
              }
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" arrow>
          <IconButton 
            size="small" 
            onClick={() => onDelete(entry.id)}
            sx={{
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.lighter'
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

export default EntryCard;
