import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Box,
  Button,
  Input as InputMUI,
  Slider,
  Typography,
} from '@mui/material';
import { Field, useFormikContext } from 'formik';
import { Settings2 } from 'lucide-react';
import { RiGlobalLine } from 'react-icons/ri';
import { GenAutoPostFormValues } from '../../types';

const SettingsPanel = () => {
  const { setFieldValue, values } = useFormikContext<GenAutoPostFormValues>();

  const handleToneChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const tone = event.currentTarget.textContent || '';
    setFieldValue('toneOfVoice', tone);
  };

  return (
    <div className="border-mountain-200 flex h-full w-80 flex-col space-y-6 rounded-lg border bg-white p-4 shadow-sm">
      <Typography className="text-mountain-800 flex items-center gap-2 text-sm font-bold">
        <Settings2 className="size-4" />
        Prompt Settings
      </Typography>
      {/* Tone of Voice */}
      <Box className="space-y-2">
        <Typography className="text-mountain-800 px-1 text-sm">
          Tone of Voice
        </Typography>
        <Box className="flex flex-wrap gap-2 px-1">
          {tones.map((tone) => (
            <Button
              key={tone}
              onClick={handleToneChange}
              className={`rounded-md border px-2 py-1 text-sm font-normal transition ${
                values.toneOfVoice === tone
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
            className="h-8 w-18"
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
          onCheckedChange={(checked) => setFieldValue('includeEmojis', checked)}
          className="cursor-pointer"
        />
      </Box>
      <div className="flex h-fit w-full flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <RiGlobalLine className="text-mountain-600 size-4" />
          <div className="flex items-end space-x-2 text-sm font-medium">
            <span>Reference</span>
            <span className="text-mountain-600">(Optional)</span>
          </div>
        </div>
        <Field
          name="url"
          as={InputMUI}
          className="flex flex-1 text-sm"
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
};

export default SettingsPanel;

const tones = [
  'Friendly',
  'Professional',
  'Casual',
  'Inspiring',
  'Witty',
  'Empathetic',
];
