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
        aria-controls="panel2-content"
        id="panel2-header"
        className={`border-mountain-300 z-50 flex items-center justify-between border bg-white bg-gradient-to-r from-indigo-100 to-purple-100 p-4 hover:cursor-pointer ${isExpanded ? 'rounded-t-xl border-b-0' : 'rounded-xl'}`}
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
              aria-controls="panel2-content"
              id="panel2-header"
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
              aria-controls="panel2-content"
              id="panel2-header"
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
              aria-controls="panel2-content"
              id="panel2-header"
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
