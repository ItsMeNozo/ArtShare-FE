import { Box, Button, Stack, Typography } from '@mui/material';
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface PostScheduleEditorProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  isInvalid?: boolean;
}

export default function PostScheduleEditor({
  value,
  onChange,
  isInvalid = false,
}: PostScheduleEditorProps) {
  const dayjsValue = value ? dayjs(value) : null;

  const handleDateChange = (newDate: Dayjs | null) => {
    if (!newDate) {
      onChange(null);
      return;
    }
    // Combine the new date with the existing time
    const hour = dayjsValue ? dayjsValue.hour() : 12;
    const minute = dayjsValue ? dayjsValue.minute() : 0;

    const updatedDateTime = newDate.hour(hour).minute(minute).second(0);
    onChange(updatedDateTime.toDate());
  };

  const handleTimeChange = (newTime: Dayjs | null) => {
    if (!newTime) {
      onChange(null);
      return;
    }
    const baseDate = dayjsValue || dayjs();

    const updatedDateTime = baseDate
      .hour(newTime.hour())
      .minute(newTime.minute());
    onChange(updatedDateTime.toDate());
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <Box className="pb-20 w-full h-full">
      <Box
        p={2}
        sx={{
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 2,
          maxWidth: '576px',
          border: isInvalid ? '1px solid #d32f2f' : '1px solid',
        }}
        className="border-mountain-200"
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction="row" spacing={2} alignItems="center">
            <DatePicker
              label="Date"
              value={dayjsValue}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: isInvalid,
                },
              }}
            />
            <TimePicker
              label="Time"
              value={dayjsValue}
              onChange={handleTimeChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: isInvalid,
                },
              }}
            />
          </Stack>
        </LocalizationProvider>

        {/* <FormControl fullWidth margin="normal">
          <InputLabel id="timezone-label">Timezone</InputLabel>
          <Select
            labelId="timezone-label"
            value={timezone}
            label="Timezone"
            onChange={handleTimezoneChange}
          >
            <MenuItem value="Asia/Ho_Chi_Minh">Vietnam (GMT+7)</MenuItem>
            <MenuItem value="Asia/Tokyo">Japan (GMT+9)</MenuItem>
            <MenuItem value="Europe/London">London (GMT+0)</MenuItem>
            <MenuItem value="America/New_York">New York (GMT-5)</MenuItem>
            <MenuItem value="UTC">UTC</MenuItem>
          </Select>
        </FormControl> */}

        {value && (
          <Box mt={2} p={2} sx={{ bgcolor: '#f0f4ff', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Scheduled for:
            </Typography>
            <Typography variant="subtitle2">
              {dayjs(value).format('dddd, MMMM D, YYYY')} at{' '}
              {dayjs(value).format('h:mm A')}
            </Typography>
          </Box>
        )}

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button onClick={handleClear} color="secondary" size="small">
            Clear Schedule
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
