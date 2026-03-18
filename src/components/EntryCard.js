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
import SummarizeIcon from '@mui/icons-material/Summarize';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckIcon from '@mui/icons-material/Check';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const QUICK_OFFSETS = [
  { label: '5 min', ms: 5 * 60 * 1000 },
  { label: '15 min', ms: 15 * 60 * 1000 },
  { label: '30 min', ms: 30 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '3 hours', ms: 3 * 60 * 60 * 1000 },
];

const { ipcRenderer } = window.require('electron');

function EntryCard({ entry, onCopy, onDelete, onToggleFavorite, onManageCategories, onAISummarize, onAIRewrite, onTagsApplied, masterPassword }) {
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
    const [tagDialogOpen, setTagDialogOpen] = useState(false);
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
    const [reminderNote, setReminderNote] = useState('');
    const [reminderCustomTime, setReminderCustomTime] = useState('');
    const [reminderBusy, setReminderBusy] = useState(false);
    const [activeReminder, setActiveReminder] = useState(null);
    const [selectedQuickLabel, setSelectedQuickLabel] = useState('');

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

  const handleSuggestTags = async () => {
    setSuggestLoading(true);
    setSuggestedTags([]);
    setSelectedTags([]);
    try {
      const res = await ipcRenderer.invoke('ai-suggest-tags', entry.id);
      if (!res.success) {
        setSuggestedTags([]);
        setSuggestLoading(false);
        return;
      }
      setSuggestedTags(Array.isArray(res.suggestions) ? res.suggestions : []);
      setTagDialogOpen(true);
    } catch (e) {
      console.error('Suggest tags error', e);
    }
    setSuggestLoading(false);
  };

  const handleToggleSelectTag = (tag) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleApplyTags = async () => {
    try {
      const resp = await ipcRenderer.invoke('set-entry-tags', entry.id, selectedTags);
      setTagDialogOpen(false);
      if (onTagsApplied) onTagsApplied(entry.id, selectedTags);
    } catch (e) {
      console.error('Apply tags failed', e);
    }
  };

  const handleSetReminder = async (remindAt) => {
    setReminderBusy(true);
    try {
      await ipcRenderer.invoke('add-reminder', entry.id, remindAt, reminderNote);
      setActiveReminder({ remind_at: remindAt, note: reminderNote || '', created_at: Date.now() });
      setReminderDialogOpen(false);
      setReminderNote('');
      setReminderCustomTime('');
    } catch (e) {
      console.error('Set reminder failed', e);
    }
    setReminderBusy(false);
  };

  const formatForDateTimeLocal = (timestamp) => {
    const d = new Date(timestamp);
    const pad = (n) => `${n}`.padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const detectQuickLabelFromReminder = (reminder) => {
    if (!reminder || !reminder.created_at || !reminder.remind_at) return '';
    const delta = reminder.remind_at - reminder.created_at;
    const toleranceMs = 90 * 1000;
    const match = QUICK_OFFSETS.find(({ ms }) => Math.abs(ms - delta) <= toleranceMs);
    return match ? match.label : '';
  };

  const loadReminderState = async () => {
    try {
      const reminders = await ipcRenderer.invoke('get-reminders-for-entry', entry.id);
      const now = Date.now();
      const nextActive = (Array.isArray(reminders) ? reminders : []).find((r) => !r.triggered && r.remind_at > now);
      setActiveReminder(nextActive || null);

      if (nextActive) {
        setReminderNote(nextActive.note || '');
        setReminderCustomTime(formatForDateTimeLocal(nextActive.remind_at));
        setSelectedQuickLabel(detectQuickLabelFromReminder(nextActive));
      } else {
        setReminderNote('');
        setReminderCustomTime('');
        setSelectedQuickLabel('');
      }
    } catch (e) {
      console.error('Load reminder state failed', e);
      setActiveReminder(null);
      setSelectedQuickLabel('');
    }
  };
// console.log("entry",entry);
  return (
    <>
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
          // transform: 'translateY(-2px)',
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
            {/* Show AI tags if present */}
            {entry.tags && entry.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                {entry.tags.map((t) => (
                  <Chip key={t} label={t} size="small" sx={{ height: 24, fontSize: '0.7rem' }} />
                ))}
              </Box>
            )}
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
        {entry.is_encrypted ? (
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
        ):<></>}
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
        <Tooltip title="Set reminder" arrow>
          <IconButton
            size="small"
            onClick={async () => { await loadReminderState(); setReminderDialogOpen(true); }}
            sx={{ color: activeReminder ? 'success.main' : 'warning.main', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <NotificationsActiveIcon fontSize="small" />
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
        <Tooltip title="Suggest tags" arrow>
          <span>
            <IconButton
              size="small"
              onClick={handleSuggestTags}
              disabled={suggestLoading}
              sx={{
                color: 'info.main',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <LocalOfferIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={entry.is_encrypted ? 'Decrypt entry first' : 'AI summarize'} arrow>
          <span>
            <IconButton
              size="small"
              disabled={entry.is_encrypted}
              onClick={() => onAISummarize(entry)}
              sx={{
                color: 'success.main',
                '&:hover': {
                  bgcolor: 'success.lighter'
                }
              }}
            >
              <SummarizeIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={entry.is_encrypted ? 'Decrypt entry first' : 'AI rewrite'} arrow>
          <span>
            <IconButton
              size="small"
              disabled={entry.is_encrypted}
              onClick={() => onAIRewrite(entry)}
              sx={{
                color: 'secondary.main',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <AutoFixHighIcon fontSize="small" />
            </IconButton>
          </span>
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

    <Dialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)}>
      <DialogTitle>AI Tag Suggestions</DialogTitle>
      <DialogContent>
        {suggestedTags.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No suggestions</Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {suggestedTags.map((t) => (
              <Chip
                key={t}
                label={t}
                onClick={() => handleToggleSelectTag(t)}
                color={selectedTags.includes(t) ? 'primary' : 'default'}
                icon={selectedTags.includes(t) ? <CheckIcon /> : undefined}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setTagDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleApplyTags} variant="contained" disabled={selectedTags.length === 0}>Apply Selected</Button>
      </DialogActions>
    </Dialog>

    <Dialog open={reminderDialogOpen} onClose={() => setReminderDialogOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Set Reminder</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Get notified about this clipboard entry at the chosen time.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {QUICK_OFFSETS.map(({ label, ms }) => (
            <Button
              key={label}
              size="small"
              variant={selectedQuickLabel === label ? 'contained' : 'outlined'}
              disabled={reminderBusy}
              onClick={() => {
                setSelectedQuickLabel(label);
                handleSetReminder(Date.now() + ms);
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
        {activeReminder && (
          <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 1 }}>
            Active reminder set for {new Date(activeReminder.remind_at).toLocaleString()}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>or pick a custom time:</Typography>
        <TextField
          type="datetime-local"
          size="small"
          fullWidth
          value={reminderCustomTime}
          onChange={e => setReminderCustomTime(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Optional note"
          size="small"
          fullWidth
          value={reminderNote}
          onChange={e => setReminderNote(e.target.value)}
          placeholder="e.g. Review this before the call"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setReminderDialogOpen(false)}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!reminderCustomTime || reminderBusy}
          onClick={() => handleSetReminder(new Date(reminderCustomTime).getTime())}
        >
          Remind me
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

export default EntryCard;
