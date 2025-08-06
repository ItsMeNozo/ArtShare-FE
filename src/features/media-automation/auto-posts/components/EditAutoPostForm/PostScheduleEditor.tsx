import { Box, Button, Stack, Typography } from '@mui/material';
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

interface PostScheduleEditorProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  isInvalid?: boolean;
  canEdit: boolean;
}

export default function PostScheduleEditor({
  value,
  onChange,
  isInvalid = false,
  canEdit,
}: PostScheduleEditorProps) {
  const [internalDate, setInternalDate] = useState<Dayjs | null>(
    value ? dayjs(value) : null,
  );

  const [inputValue, setInputValue] = useState<Dayjs | null>(
    value ? dayjs(value) : null,
  );

  useEffect(() => {
    const date = value ? dayjs(value) : null;
    setInternalDate(date);
    setInputValue(date);
  }, [value]);

  const handleDateChange = (newDate: Dayjs | null) => {
    setInputValue(newDate);

    if (newDate && newDate.isValid()) {
      const updatedDateTime = (internalDate || dayjs())
        .year(newDate.year())
        .month(newDate.month())
        .date(newDate.date());

      setInternalDate(updatedDateTime);
      onChange(updatedDateTime.toDate());
    }
  };

  const handleTimeChange = (newTime: Dayjs | null) => {
    const baseDate = internalDate || dayjs();
    const updatedDateTime = newTime
      ? baseDate.hour(newTime.hour()).minute(newTime.minute())
      : baseDate;

    setInternalDate(updatedDateTime);

    setInputValue(updatedDateTime);

    if (updatedDateTime && updatedDateTime.isValid()) {
      onChange(updatedDateTime.toDate());
    } else {
      onChange(null);
    }
  };

  const handleClear = () => {
    setInternalDate(null);
    setInputValue(null);
    onChange(null);
  };

  return (
    <Box className="h-full w-full pb-20">
      <Box
        p={2}
        sx={{
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 2,
          maxWidth: '576px',
          border: isInvalid ? '1px solid #d32f2f' : '1px solid',
          opacity: canEdit ? 1 : 0.7,
        }}
        className="border-mountain-200"
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction="row" spacing={2} alignItems="center">
            <DatePicker
              label="Date"
              value={inputValue}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: isInvalid,
                },
              }}
              disabled={!canEdit}
            />
            <TimePicker
              label="Time"
              value={internalDate}
              onChange={handleTimeChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: isInvalid,
                },
              }}
              disabled={!canEdit}
            />
          </Stack>
        </LocalizationProvider>

        {internalDate && internalDate.isValid() && (
          <Box mt={2} p={2} sx={{ bgcolor: '#f0f4ff', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Scheduled for:
            </Typography>
            <Typography variant="subtitle2">
              {internalDate.format('dddd, MMMM D, YYYY')} at{' '}
              {internalDate.format('h:mm A')}
            </Typography>
          </Box>
        )}

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button
            onClick={handleClear}
            color="secondary"
            size="small"
            disabled={!canEdit}
          >
            Clear Schedule
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
