import { Input } from '@/components/ui/input';
import { Input as InputMUI } from '@mui/material';
import { Switch } from '@/components/ui/switch';
import { Box, Button, Slider, Typography } from '@mui/material';
import { Field, useFormikContext } from 'formik';
import { Settings2 } from 'lucide-react';
import { GenAutoPostFormValues } from '../../types';
import { RiGlobalLine } from 'react-icons/ri';

const SettingsPanel = () => {
  const { setFieldValue, values } = useFormikContext<GenAutoPostFormValues>();

  const handleToneChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const tone = event.currentTarget.textContent || '';
    setFieldValue('toneOfVoice', tone);
  };

  return (
    <div className="flex flex-col space-y-6 bg-white shadow-sm p-4 border border-mountain-200 rounded-lg w-80 h-full">
      <Typography className="flex items-center gap-2 font-bold text-mountain-800 text-sm">
        <Settings2 className="size-4" />
        Prompt Settings
      </Typography>
      {/* Tone of Voice */}
      <Box className="space-y-2">
        <Typography className="px-1 text-mountain-800 text-sm">
          Tone of Voice
        </Typography>
        <Box className="flex flex-wrap gap-2 px-1">
          {tones.map((tone) => (
            <Button
              key={tone}
              onClick={handleToneChange}
              className={`rounded-md border font-normal px-2 py-1 text-sm transition ${values.toneOfVoice === tone
                ? 'border-indigo-600 bg-indigo-500 text-white'
                : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100'
                }`}
            >
              {tone}
            </Button>
          ))}
        </Box>
      </Box>
      {/* Word Count */}
      <Box className="flex flex-col gap-2">
        <Box className="flex items-center space-x-2">
          <Typography className="text-mountain-800 text-sm">
            Number of words
          </Typography>
          <Field
            name="wordCount"
            as={Input}
            className="w-18 h-8"
            type="number"
            min={100}
            max={500}
            step={10}
          />
        </Box>
        <Slider
          value={values.wordCount}
          min={100}
          max={500}
          step={10}
          onChange={(_, newValue) => setFieldValue('wordCount', newValue)}
        />
      </Box>
      {/* Hashtag Switch */}
      <Box className="flex items-center space-x-2">
        <Typography className="text-mountain-800 text-sm">
          Generate hashtag
        </Typography>
        <Switch
          checked={values.generateHashtag}
          onCheckedChange={(checked) =>
            setFieldValue('generateHashtag', checked)
          }
          className="cursor-pointer"
        />
      </Box>
      {/* Emoji Switch */}
      <Box className="flex items-center space-x-2">
        <Typography className="text-mountain-800 text-sm">
          Include emojis
        </Typography>
        <Switch
          checked={values.includeEmojis}
          onCheckedChange={(checked) =>
            setFieldValue('includeEmojis', checked)
          }
          className="cursor-pointer"
        />
      </Box>
      <div className='flex flex-col space-x-4 w-full h-fit'>
        <button
          type='button'
          className='flex items-center space-x-2'
          onClick={() => { }}
        >
          <RiGlobalLine className='size-4 text-mountain-600' />
          <div className='flex items-end space-x-2 font-medium text-sm'>
            <span>Reference</span>
            <span className='text-mountain-600'>(Optional)</span>
          </div>
        </button>
        <InputMUI className='flex flex-1 text-sm' />
      </div>
    </div>
  );
};

export default SettingsPanel;

const tones = ['Friendly', 'Professional', 'Casual', 'Inspiring', 'Witty', 'Empathetic'];
