import React from 'react';

//Components
import { Collapse, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';

//Icons
import { GoSidebarExpand } from 'react-icons/go';
import { IoIosArrowDown } from 'react-icons/io';
import { IoImageOutline } from 'react-icons/io5';

//Assets
import AspectRatioOptions from './AspectRatio';
import CameraOptions from './CameraOptions';
import LightingOptions from './LightingOptions';
import StyleOptions from './StyleOptions';
import { UploadIcon, X } from 'lucide-react';

const SettingsPanel: React.FC<PanelProps> = ({
  isExpanded,
  setIsExpanded,
  numberOfImages,
  setNumberOfImages,
  aspectRatio,
  setAspectRatio,
  lighting,
  setLighting,
  camera,
  setCamera,
  style,
  setStyle,
  prefImage,
  setPrefImage,
}) => {
  const handleParentToggle = (
    _event: React.SyntheticEvent,
    isExpanded: boolean,
  ) => {
    setIsExpanded(isExpanded);
  };

  const handleSelectNumber = (
    _: React.MouseEvent<HTMLElement>,
    newNumber: number,
  ) => {
    if (newNumber) {
      setNumberOfImages(newNumber);
    }
  };

  return (
    <div className="flex flex-col w-72 h-full shrink-0">
      <div
        aria-controls="generation-options-content"
        id="generation-options-header"
        className={`border-mountain-300 z-50 flex items-center justify-between border bg-white bg-gradient-to-r from-indigo-100 to-purple-100 hover:cursor-pointer ${isExpanded ? 'rounded-t-xl border-b-0 p-4' : 'rounded-xl p-3'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Typography
          component="span"
          className="flex items-center space-x-2 font-medium"
        >
          <IoImageOutline className="size-5" />
          <p>Generation Options</p>
        </Typography>
        <GoSidebarExpand onClick={() => setIsExpanded(!isExpanded)} />
      </div>
      <Accordion
        expanded={isExpanded}
        onChange={handleParentToggle}
        slots={{ transition: Collapse }}
        slotProps={{
          transition: {
            timeout: 200,
          },
        }}
        className={`flex ${isExpanded ? '' : 'hidden'} border-mountain-300 custom-scrollbar z-10 m-0 w-72 flex-col rounded-xl rounded-t-none border bg-white shadow-md ${isExpanded ? 'max-h-[calc(100vh)]' : 'h-fit'
          } overflow-y-auto`}
      >
        <AccordionDetails className="flex flex-col flex-1 p-0 min-h-0 overflow-y-auto">
          {/* Nested Accordions */}
          <Accordion className="shadow-none" defaultExpanded>
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              aria-controls="general-settings-content"
              id="general-settings-header"
            >
              <Typography component="span" className="font-medium">
                General Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails className="flex flex-col space-y-1 pb-0">
              <div className="flex flex-col space-y-1">
                <p className="text-mountain-600 text-sm">Style</p>
                <StyleOptions style={style} selectStyle={setStyle} />
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-mountain-600 text-sm">Aspect Ratio</p>
                <AspectRatioOptions
                  selectedAspect={aspectRatio}
                  onChange={setAspectRatio}
                />
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion className="shadow-none" defaultExpanded>
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              aria-controls="effects-content"
              id="effects-header"
            >
              <Typography component="span" className="font-medium">
                Effects
              </Typography>
            </AccordionSummary>
            <AccordionDetails className="flex flex-col space-y-1">
              <div className="flex flex-col space-y-1 w-full">
                <p className="text-mountain-600 text-sm">Lighting</p>
                <LightingOptions
                  selectedLighting={lighting}
                  onChange={setLighting}
                />
              </div>
              <div className="flex flex-col space-y-1 w-full">
                <p className="text-mountain-600 text-sm">Camera</p>
                <CameraOptions selectedCamera={camera} onChange={setCamera} />
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion className="shadow-none" defaultExpanded>
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              aria-controls="advance-settings-content"
              id="advance-settings-header"
            >
              <Typography component="span" className="font-medium">
                Image Preference
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {(() => {
                const fileInputRef = React.useRef<HTMLInputElement>(null);
                const previewUrl = prefImage ? URL.createObjectURL(prefImage) : null;

                const handleFileChange = (file?: File) => {
                  if (file && file.type.startsWith("image/")) {
                    setPrefImage(file);
                  } else {
                    alert("Please select an image file");
                  }
                };

                const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  handleFileChange(e.dataTransfer.files?.[0]);
                };

                const handleRemoveFile = () => {
                  setPrefImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                };

                return (
                  <div className="w-full">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                      className="hidden"
                    />
                    {prefImage && previewUrl ? (
                      <div className="relative border border-mountain-300 rounded-lg w-full h-48 overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Selected"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="top-2 right-2 z-50 absolute bg-white hover:bg-gray-100 shadow p-1 rounded-full"
                        >
                          <X className="size-4 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="flex flex-col justify-center items-center bg-mountain-50 border-2 border-gray-300 hover:border-gray-400 border-dashed rounded-lg w-full h-48 text-gray-500 hover:text-gray-700 transition cursor-pointer"
                      >
                        <UploadIcon className="mb-2 size-6" />
                        <span className="text-sm">Drag your image here</span>
                        <span>or</span>
                        <span className="font-bold text-sm">Click to upload</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </AccordionDetails>
          </Accordion>
          <Accordion className="shadow-none" defaultExpanded>
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              aria-controls="advance-settings-content"
              id="advance-settings-header"
            >
              <Typography component="span" className="font-medium">
                Advance Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className="flex flex-col space-y-1">
                <p className="text-mountain-600 text-sm">Number of Images</p>
                <ToggleButtonGroup
                  className="flex justify-between gap-2 m-1.5"
                  size="large"
                  value={numberOfImages}
                  exclusive
                  onChange={handleSelectNumber}
                >
                  <ToggleButton
                    value={1}
                    className="-m-0.5 px-4 py-2 border-0 rounded-full w-1/4 normal-case transition duration-300 ease-in-out transform"
                    sx={{
                      backgroundColor: '#e0e0e0',
                      '&.Mui-selected': {
                        backgroundColor: '#c7d2fe',
                        color: '#000',
                        '&:hover': {
                          backgroundColor: '#c7d2fe',
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#e0e0e0',
                      },
                    }}
                  >
                    1
                  </ToggleButton>
                  <ToggleButton
                    value={2}
                    className="-m-0.5 px-4 py-2 border-0 rounded-full w-1/4 normal-case transition duration-300 ease-in-out transform"
                    sx={{
                      backgroundColor: '#e0e0e0',
                      '&.Mui-selected': {
                        backgroundColor: '#c7d2fe',
                        color: '#000',
                        '&:hover': {
                          backgroundColor: '#c7d2fe',
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#e0e0e0',
                      },
                    }}
                  >
                    2
                  </ToggleButton>
                  <ToggleButton
                    value={3}
                    className="-m-0.5 px-4 py-2 border-0 rounded-full w-1/4 normal-case transition duration-300 ease-in-out transform"
                    sx={{
                      backgroundColor: '#e0e0e0',
                      '&.Mui-selected': {
                        backgroundColor: '#c7d2fe',
                        color: '#000',
                        '&:hover': {
                          backgroundColor: '#c7d2fe',
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#e0e0e0',
                      },
                    }}
                  >
                    3
                  </ToggleButton>
                  <ToggleButton
                    value={4}
                    className="-m-0.5 px-4 py-2 border-0 rounded-full w-1/4 normal-case transition duration-300 ease-in-out transform"
                    sx={{
                      backgroundColor: '#e0e0e0',
                      '&.Mui-selected': {
                        backgroundColor: '#c7d2fe',
                        color: '#000',
                        '&:hover': {
                          backgroundColor: '#c7d2fe',
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#e0e0e0',
                      },
                    }}
                  >
                    4
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </AccordionDetails>
          </Accordion>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default SettingsPanel;
