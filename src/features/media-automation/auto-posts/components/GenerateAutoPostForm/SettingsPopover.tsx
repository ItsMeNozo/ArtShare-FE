import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Box, Button, Slider, Typography } from '@mui/material';
import { Field, useFormikContext } from 'formik';
import { Settings2 } from 'lucide-react';
import { BiChevronDown } from 'react-icons/bi';
import { GenAutoPostFormValues } from '../../types';

const SettingsPanel = () => {
  const { setFieldValue, values } = useFormikContext<GenAutoPostFormValues>();

  const handleToneChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const tone = event.currentTarget.textContent || '';
    setFieldValue('toneOfVoice', tone);
  };

  return (
    <Box className="space-y-6 bg-white shadow-sm p-4 border border-mountain-200 rounded-lg w-80 shrink-0">
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
          <Button
            disabled
            className="flex items-center bg-white px-3 py-1 border border-gray-300 rounded-md text-gray-400 text-sm cursor-not-allowed"
          >
            <BiChevronDown className="mr-1" />
            <Typography>More</Typography>
          </Button>
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
    </Box>
  );
};

export default SettingsPanel;

const tones = ['Friendly', 'Professional', 'Casual', 'Inspiring', 'Witty'];
