import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Box, Button, Slider, Typography } from '@mui/material';
import { Field, useFormikContext } from 'formik';
import { Settings2 } from 'lucide-react';
import { useState } from 'react';
import { BiChevronDown } from 'react-icons/bi';
import { GenAutoPostFormValues } from '../../types';

const SettingsPopover = () => {
  const { setFieldValue, values } = useFormikContext<GenAutoPostFormValues>();

  const [selectedTone, setSelectedTone] = useState<string | null>(
    values.toneOfVoice,
  );
  const [open, setOpen] = useState(false);

  const handleToneChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const tone = event.currentTarget.textContent || '';
    setSelectedTone(tone);
    setFieldValue('toneOfVoice', tone);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 bg-white hover:bg-mountain-100 px-4 py-2 border border-mountain-200 rounded-md text-mountain-950 cursor-pointer"
        >
          <Settings2 className="size-4" />
          Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={8}
        onInteractOutside={() => setOpen(false)}
        className="space-y-6 shadow-md mt-2 border border-mountain-200 rounded-lg w-72 overflow-x-hidden overflow-y-auto"
      >
        <Box className="space-y-4">
          <Typography className="font-bold text-mountain-800 text-sm">
            Prompt Settings
          </Typography>
          <Box className="space-y-2">
            <Typography className="px-1 text-mountain-800 text-sm">
              Tone of Voice
            </Typography>
            <Box className="flex flex-wrap gap-2 px-1">
              {tones.map((tone) => (
                <Button
                  key={tone}
                  onClick={handleToneChange}
                  className={`px-2 py-1 rounded-md text-sm border transition
                  ${selectedTone === tone
                      ? 'bg-indigo-500 text-white border-indigo-600'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {tone}
                </Button>
              ))}
              <Button
                onClick={() => { }}
                className="flex items-center bg-white hover:bg-gray-100 px-3 py-1 border border-gray-300 rounded-md text-gray-800 text-sm"
              >
                <BiChevronDown className="mr-1" />
                <Typography>More</Typography>
              </Button>
            </Box>
          </Box>
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
      </PopoverContent>
    </Popover>
  );
};

export default SettingsPopover;

const tones = ['Friendly', 'Professional', 'Casual', 'Inspiring', 'Witty'];
