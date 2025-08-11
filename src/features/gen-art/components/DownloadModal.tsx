import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import React, { Dispatch, useEffect, useMemo, useState } from 'react';
import { FaDesktop, FaMobileAlt } from 'react-icons/fa';
import { IoMdTabletPortrait } from 'react-icons/io';
import { MdLaptopMac } from 'react-icons/md';

interface DownloadModalProps {
  openDownload: boolean;
  setOpenDownload: Dispatch<React.SetStateAction<boolean>>;
  imageURL?: string[] | string;
  imageRatio: string;
  onDownload: (settings: {
    format: string;
    filename: string;
    device: string;
    size: string;
  }) => void;
}

const deviceSizeOptions: Record<
  string,
  { label: string; value: string; ratio: string }[]
> = {
  desktop: [
    { label: 'Small', value: '1920x1080', ratio: '16:9' },
    { label: 'Medium', value: '2560x1440', ratio: '16:9' },
    { label: 'Large', value: '3840x2160', ratio: '16:9' },
    { label: 'Square Small', value: '1080x1080', ratio: '1:1' },
    { label: 'Square Large', value: '2048x2048', ratio: '1:1' },
  ],
  laptop: [
    { label: 'Small', value: '1366x768', ratio: '16:9' },
    { label: 'Medium', value: '1440x900', ratio: '16:10' },
    { label: 'Large', value: '1920x1080', ratio: '16:9' },
    { label: 'Square Small', value: '1024x1024', ratio: '1:1' },
  ],
  tablet: [
    { label: 'Small', value: '1024x768', ratio: '4:3' },
    { label: 'Medium', value: '1280x800', ratio: '16:10' },
    { label: 'Large', value: '2048x1536', ratio: '4:3' },
    { label: 'Square', value: '1080x1080', ratio: '1:1' },
  ],
  mobile: [
    { label: 'Small', value: '720x1280', ratio: '9:16' },
    { label: 'Medium', value: '1080x1920', ratio: '9:16' },
    { label: 'Large', value: '1440x2560', ratio: '9:16' },
    { label: 'Square', value: '1080x1080', ratio: '1:1' },
  ],
};

const deviceIcons = {
  desktop: <FaDesktop fontSize="small" />,
  laptop: <MdLaptopMac fontSize="small" />,
  tablet: <IoMdTabletPortrait fontSize="small" />,
  mobile: <FaMobileAlt fontSize="small" />,
};

// Map categories to actual aspect ratios
const RATIO_CATEGORY_MAP: Record<string, string[]> = {
  square: ['1:1'],
  landscape: ['16:9', '4:3', '16:10'],
  portrait: ['9:16', '3:4'],
};

const DownloadModal: React.FC<DownloadModalProps> = ({
  onDownload,
  openDownload,
  setOpenDownload,
  imageURL,
  imageRatio,
}) => {
  const [format, setFormat] = useState('jpg');
  const [filename, setFilename] = useState('my-image');
  const [device, setDevice] =
    useState<keyof typeof deviceSizeOptions>('desktop');
  const [size, setSize] = useState(deviceSizeOptions.desktop[0].value);

  // Normalize the incoming ratio to lowercase and get actual aspect values
  const normalizedRatio = imageRatio.toLowerCase();
  const allowedRatios = useMemo(
    () => RATIO_CATEGORY_MAP[normalizedRatio] || [],
    [normalizedRatio],
  );

  // Filter sizes to only match allowed aspect values
  const filteredSizes = useMemo(
    () =>
      deviceSizeOptions[device].filter((opt) =>
        allowedRatios.includes(opt.ratio),
      ),
    [device, allowedRatios],
  );

  // Update size when device changes or when filtered sizes change
  useEffect(() => {
    if (filteredSizes.length > 0) {
      // Check if current size is still valid
      const currentSizeExists = filteredSizes.some((opt) => opt.value === size);
      if (!currentSizeExists) {
        setSize(filteredSizes[0].value);
      }
    } else {
      // If no sizes match, try to find a device that has matching sizes
      const deviceWithMatchingSizes = Object.keys(deviceSizeOptions).find(
        (dev) =>
          deviceSizeOptions[dev as keyof typeof deviceSizeOptions].some((opt) =>
            allowedRatios.includes(opt.ratio),
          ),
      ) as keyof typeof deviceSizeOptions | undefined;

      if (deviceWithMatchingSizes && deviceWithMatchingSizes !== device) {
        setDevice(deviceWithMatchingSizes);
        const matchingSizes = deviceSizeOptions[deviceWithMatchingSizes].filter(
          (opt) => allowedRatios.includes(opt.ratio),
        );
        if (matchingSizes.length > 0) {
          setSize(matchingSizes[0].value);
        }
      } else {
        setSize('');
      }
    }
  }, [device, normalizedRatio, allowedRatios, filteredSizes, size]);

  const handleConfirm = () => {
    onDownload({ format, filename, device, size });
    setOpenDownload(false);
  };

  const handleDeviceChange = (newDevice: string) => {
    setDevice(newDevice as keyof typeof deviceSizeOptions);
    // The useEffect will handle setting the appropriate size
  };

  // Handle single vs multiple preview logic
  const previewImages =
    typeof imageURL === 'string'
      ? [imageURL]
      : Array.isArray(imageURL)
        ? imageURL.slice(0, 4)
        : [];

  return (
    <Dialog
      open={openDownload}
      onClose={() => setOpenDownload(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Download Image</DialogTitle>
      <DialogContent className="flex flex-col space-y-4">
        {previewImages.length > 0 && (
          <div className="flex space-x-2">
            {previewImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Preview ${idx + 1}`}
                className="aspect-square h-auto w-20 rounded-md object-cover"
              />
            ))}
          </div>
        )}

        {/* File Name */}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="File Name"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            variant="outlined"
          />
        </Box>

        {/* Format */}
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="format-label">Image Format</InputLabel>
            <Select
              labelId="format-label"
              label="Image Format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <MenuItem value="jpg">JPG</MenuItem>
              <MenuItem value="png">PNG</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Device & Size */}
        <div className="flex gap-2">
          <FormControl fullWidth variant="outlined">
            <InputLabel id="device-label">Device</InputLabel>
            <Select
              labelId="device-label"
              label="Device"
              value={device}
              onChange={(e) => handleDeviceChange(e.target.value)}
            >
              {Object.keys(deviceSizeOptions).map((dev) => (
                <MenuItem key={dev} value={dev}>
                  <div className="flex items-center gap-2">
                    {deviceIcons[dev as keyof typeof deviceIcons]}
                    {dev.charAt(0).toUpperCase() + dev.slice(1)}
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined">
            <InputLabel id="size-label">Size</InputLabel>
            <Select
              labelId="size-label"
              label="Size"
              value={
                filteredSizes.some((opt) => opt.value === size)
                  ? size
                  : filteredSizes[0]?.value || ''
              }
              onChange={(e) => setSize(e.target.value)}
              disabled={filteredSizes.length === 0}
            >
              {filteredSizes.length > 0 ? (
                filteredSizes.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label} ({s.value})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  No matching sizes
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </div>
      </DialogContent>

      <DialogActions className="px-6 pb-4">
        <Button onClick={() => setOpenDownload(false)} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained">
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadModal;
