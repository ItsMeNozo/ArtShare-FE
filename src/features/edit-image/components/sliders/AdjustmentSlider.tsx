import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Box, Slider } from '@mui/material';

interface AdjustmentSliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  gradientColors?: string[];
}

const AdjustmentSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  gradientColors,
}: AdjustmentSliderProps) => {
  const handleChange = (
    _: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => {
    if (typeof newValue === 'number') onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = Number(e.target.value);
    if (!isNaN(rawValue)) {
      const clampedValue = Math.max(min, Math.min(max, rawValue));
      onChange(clampedValue);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex w-full justify-between">
        <Label className="font-medium">{label}</Label>
        <Input
          type="number"
          inputMode="numeric"
          className="w-16 p-2 text-right text-sm"
          value={Math.floor(value)}
          onChange={handleInputChange}
          min={min}
          max={max}
          style={{ direction: 'ltr' }}
        />
      </div>
      <Box sx={{ width: '98%' }}>
        <Slider
          value={value}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
          valueLabelDisplay="off"
          sx={{
            '& .MuiSlider-track': {
              border: 'none',
              background: 'none',
            },
            '& .MuiSlider-rail': {
              opacity: 1,
              backgroundImage:
                Array.isArray(gradientColors) && gradientColors.length > 0
                  ? `linear-gradient(to right, ${gradientColors.join(', ')})`
                  : 'none',
              backgroundColor:
                !gradientColors || gradientColors.length === 0
                  ? '#9d9d9d'
                  : 'transparent',
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
};

export default AdjustmentSlider;
