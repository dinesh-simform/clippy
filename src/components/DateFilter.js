import React, { useEffect, useState } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  InputLabel,
  TextField,
  Button,
  FormHelperText,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last90days', label: 'Last 90 Days' },
];

function toISODate(d) {
  if (!d) return null;
  return dayjs(d).format('YYYY-MM-DD');
}

function DateFilter({ selectedRange, onRangeChange, onCustomRangeChange, customStart, customEnd }) {
  const handleSelectChange = (e) => onRangeChange(e.target.value);

  // Local picker state (dayjs objects)
  const [value, setValue] = useState([
    customStart ? dayjs(customStart) : null,
    customEnd ? dayjs(customEnd) : null,
  ]);
  const [error, setError] = useState('');

  useEffect(() => {
    // keep local state in sync when props change externally
    setValue([customStart ? dayjs(customStart) : null, customEnd ? dayjs(customEnd) : null]);
  }, [customStart, customEnd]);

  useEffect(() => {
    if (!value[0] || !value[1]) {
      setError('Please select both start and end dates.');
      return;
    }
    if (dayjs(value[0]).isAfter(dayjs(value[1]))) {
      setError('Start date must be before or equal to end date.');
      return;
    }
    setError('');
  }, [value]);

  const handleApply = () => {
    if (error) return;
    const startIso = toISODate(value[0]);
    const endIso = toISODate(value[1]);
    if (startIso && endIso) onCustomRangeChange(startIso, endIso);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 320 }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="date-filter-label">Time Period</InputLabel>
        <Select
          labelId="date-filter-label"
          value={selectedRange}
          label="Time Period"
          onChange={handleSelectChange}
          startAdornment={<CalendarMonthIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />}
          sx={{
            bgcolor: 'background.paper',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
          }}
        >
          {dateRanges.map((range) => (
            <MenuItem key={range.value} value={range.value}>
              {range.label}
            </MenuItem>
          ))}
          <MenuItem key="custom" value="custom">Custom Range</MenuItem>
        </Select>
      </FormControl>

      {selectedRange === 'custom' && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <DatePicker
              label="Start"
              value={value[0]}
              onChange={(newVal) => setValue([newVal, value[1]])}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={{ minWidth: 160, bgcolor: 'background.paper' }} />
              )}
            />
            <Box sx={{ mx: 0.5 }}>—</Box>
            <DatePicker
              label="End"
              value={value[1]}
              onChange={(newVal) => setValue([value[0], newVal])}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={{ minWidth: 160, bgcolor: 'background.paper' }} />
              )}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Button variant="contained" size="small" onClick={handleApply} disabled={!!error}>
                Apply
              </Button>
              {error && <FormHelperText error sx={{ mt: 0 }}>{error}</FormHelperText>}
            </Box>
          </Box>
        </LocalizationProvider>
      )}
    </Box>
  );
}

export default DateFilter;
