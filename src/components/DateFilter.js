import React from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Box,
  InputLabel
} from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last90days', label: 'Last 90 Days' },
];

function DateFilter({ selectedRange, onRangeChange }) {
  return (
    <Box sx={{ minWidth: 180 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="date-filter-label">Time Period</InputLabel>
        <Select
          labelId="date-filter-label"
          value={selectedRange}
          label="Time Period"
          onChange={(e) => onRangeChange(e.target.value)}
          startAdornment={
            <CalendarMonthIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
          }
          sx={{
            bgcolor: 'background.paper',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          }}
        >
          {dateRanges.map((range) => (
            <MenuItem key={range.value} value={range.value}>
              {range.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default DateFilter;
