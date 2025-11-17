import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import EntryCard from './EntryCard';

function ClipboardList({ entries, loading, onCopy, onDelete, onToggleFavorite, onManageCategories, masterPassword }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (entries.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No clipboard items yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Copy some text to get started!
        </Typography>
      </Box>
    );
  }
console.log("entries",entries)
  return (
    <Box>
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          onCopy={onCopy}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onManageCategories={onManageCategories}
          masterPassword={masterPassword}
        />
      ))}
    </Box>
  );
}

export default ClipboardList;
