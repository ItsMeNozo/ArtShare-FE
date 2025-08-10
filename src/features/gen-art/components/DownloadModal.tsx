import React, { Dispatch, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
} from "@mui/material";
import { FaDesktop, FaMobileAlt } from "react-icons/fa";
import { MdLaptopMac } from "react-icons/md";
import { IoMdTabletPortrait } from "react-icons/io";

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
    { label: "Small", value: "1920x1080", ratio: "16:9" },
    { label: "Medium", value: "2560x1440", ratio: "16:9" },
    { label: "Large", value: "3840x2160", ratio: "16:9" },
    { label: "Square Small", value: "1080x1080", ratio: "1:1" },
    { label: "Square Large", value: "2048x2048", ratio: "1:1" },
  ],
  laptop: [
    { label: "Small", value: "1366x768", ratio: "16:9" },
    { label: "Medium", value: "1440x900", ratio: "16:10" },
    { label: "Large", value: "1920x1080", ratio: "16:9" },
    { label: "Square Small", value: "1024x1024", ratio: "1:1" },
  ],
  tablet: [
    { label: "Small", value: "1024x768", ratio: "4:3" },
    { label: "Medium", value: "1280x800", ratio: "16:10" },
    { label: "Large", value: "2048x1536", ratio: "4:3" },
    { label: "Square", value: "1080x1080", ratio: "1:1" },
  ],
  mobile: [
    { label: "Small", value: "720x1280", ratio: "9:16" },
    { label: "Medium", value: "1080x1920", ratio: "9:16" },
    { label: "Large", value: "1440x2560", ratio: "9:16" },
    { label: "Square", value: "1080x1080", ratio: "1:1" },
  ],
};

const deviceIcons = {
  desktop: <FaDesktop fontSize="small" />,
  laptop: <MdLaptopMac fontSize="small" />,
  tablet: <IoMdTabletPortrait fontSize="small" />,
  mobile: <FaMobileAlt fontSize="small" />,
};

const DownloadModal: React.FC<DownloadModalProps> = ({
  onDownload,
  openDownload,
  setOpenDownload,
  imageURL,
  imageRatio,
}) => {

  const [format, setFormat] = useState("jpg");
  const [filename, setFilename] = useState("my-image");
  const [device, setDevice] = useState<keyof typeof deviceSizeOptions>("desktop");
  const [size, setSize] = useState(deviceSizeOptions.desktop[0].value);

  // Map categories to actual aspect ratios
  const ratioCategoryMap: Record<string, string[]> = {
    SQUARE: ["1:1"],
    LANDSCAPE: ["16:9", "4:3", "16:10"],
    PORTRAIT: ["9:16", "3:4"],
  };

  // Normalize the incoming ratio to actual aspect values
  const allowedRatios = ratioCategoryMap[imageRatio] || [];

  // Filter sizes to only match allowed aspect values
  const filteredSizes = deviceSizeOptions[device].filter((opt) =>
    allowedRatios.includes(opt.ratio)
  );

  // Always pick a matching size by default
  useEffect(() => {
    if (filteredSizes.length > 0) {
      setSize(filteredSizes[0].value);
    } else {
      setSize("");
    }
  }, [device, allowedRatios]);

  useEffect(() => {
    if (!deviceSizeOptions[device].some((opt) => allowedRatios.includes(opt.ratio))) {
      const firstMatchDevice = Object.keys(deviceSizeOptions).find((dev) =>
        deviceSizeOptions[dev as keyof typeof deviceSizeOptions].some(
          (opt) => allowedRatios.includes(opt.ratio)
        )
      ) as keyof typeof deviceSizeOptions | undefined;

      if (firstMatchDevice) {
        setDevice(firstMatchDevice);
        const match = deviceSizeOptions[firstMatchDevice].find(
          (opt) => allowedRatios.includes(opt.ratio)
        );
        if (match) setSize(match.value);
      }
    }
  }, [imageRatio, device]);

  const handleConfirm = () => {
    onDownload({ format, filename, device, size });
    setOpenDownload(false);
  };

  const handleDeviceChange = (newDevice: string) => {
    setDevice(newDevice as keyof typeof deviceSizeOptions);
    const sizes = deviceSizeOptions[newDevice as keyof typeof deviceSizeOptions];
    setSize(sizes[0]?.value || "");
  };

  // Ensure selected device & size match the image ratio
  useEffect(() => {
    if (!deviceSizeOptions[device].some((opt) => opt.ratio === imageRatio)) {
      const firstMatchDevice = Object.keys(deviceSizeOptions).find((dev) =>
        deviceSizeOptions[dev as keyof typeof deviceSizeOptions].some(
          (opt) => opt.ratio === imageRatio
        )
      ) as keyof typeof deviceSizeOptions | undefined;

      if (firstMatchDevice) {
        setDevice(firstMatchDevice);
        const match = deviceSizeOptions[firstMatchDevice].find(
          (opt) => opt.ratio === imageRatio
        );
        if (match) setSize(match.value);
      }
    }
  }, [imageRatio, device]);

  // Handle single vs multiple preview logic
  const previewImages =
    typeof imageURL === "string"
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
                className="rounded-md w-20 h-auto object-cover aspect-square"
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
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {filteredSizes.length > 0 ? (
                filteredSizes.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label} ({s.value})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No matching sizes</MenuItem>
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
