import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Adjust path as needed
import { Box, Slider } from '@mui/material';

function valuetext(value: number) {
  return `${value}%`;
}

export default function OpacitySlider({
  opacity,
  onChange,
  min = 0,
  max = 100,
}: {
  opacity: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const handleChange = (_: Event, newValue: number | number[]) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue;
    onChange?.(val / 100); // pass normalized 0 to 1 value
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = Number(e.target.value);
    if (!isNaN(rawValue)) {
      const clampedValue = Math.max(min, Math.min(max, rawValue)) / 100;
      onChange?.(clampedValue);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex w-full justify-between">
        <Label className="font-medium">Opacity</Label>
        <Input
          type="number"
          inputMode="numeric"
          className="w-16 p-2 text-right text-sm"
          value={Math.floor(opacity * 100)}
          onChange={handleInputChange}
          min={min}
          max={max}
          style={{ direction: 'ltr' }}
        />
      </div>
      <Box sx={{ width: '98%' }}>
        <Slider
          value={opacity * 100}
          onChange={handleChange}
          getAriaValueText={valuetext}
          step={1}
          min={0}
          max={100}
          valueLabelDisplay="off"
          sx={{
            '& .MuiSlider-track': {
              border: 'none',
            },
            '& .MuiSlider-thumb': {
              height: 20,
              width: 20,
              backgroundColor: '#fff',
              border: '2px solid currentColor',
              '&:hover': {
                boxShadow: '0 0 0 8px rgba(79, 70, 229, 0.16)',
              },
              '&.Mui-active': {
                boxShadow: '0 0 0 14px rgba(79, 70, 229, 0.16)',
              },
            },
            '& .MuiSlider-valueLabel': {
              background: 'none',
              backgroundColor: '#4f46e5',
              borderRadius: '4px',
            },
          }}
        />
      </Box>
    </div>
  );
}
