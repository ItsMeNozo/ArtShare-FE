import React from "react";

//Components
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { Collapse, ToggleButton, ToggleButtonGroup } from "@mui/material";

//Icons
import { IoIosArrowDown } from "react-icons/io";
import { GoSidebarExpand } from "react-icons/go";
import { IoImageOutline } from "react-icons/io5";

//Assets
import AspectRatioOptions from "./AspectRatio";
import LightingOptions from "./LightingOptions";
import CameraOptions from "./CameraOptions";
import StyleOptions from "./StyleOptions";

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
        <div className='absolute flex flex-col w-[300px]'>
            <div
                aria-controls="panel2-content"
                id="panel2-header"
                className={`z-50 border border-b-0 hover:cursor-pointer border-mountain-300 ${isExpanded ? '' : 'shadow-md'} flex justify-between p-4 items-center bg-white ${isExpanded ? 'rounded-t-xl' : 'rounded-xl'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <Typography component="span" className="flex items-center space-x-2 font-medium">
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
                className={`flex ${isExpanded ? '' : 'hidden'} flex-col m-0 z-10 bg-white shadow-md border border-mountain-300 rounded-xl rounded-t-none w-[300px] custom-scrollbar ${isExpanded ? 'max-h-[calc(100vh-9.5rem)]' : 'h-fit'
                    } overflow-y-auto`}>

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
                        <AccordionDetails className='flex flex-col space-y-2 pb-0'>
                            <div className='flex flex-col space-y-1'>
                                <p className='text-mountain-600 text-sm'>Style</p>
                                <StyleOptions
                                    style={style}
                                    selectStyle={setStyle}
                                />
                            </div>
                            <div className='flex flex-col space-y-1'>
                                <p className='text-mountain-600 text-sm'>Aspect Ratio</p>
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
                        <AccordionDetails className='flex flex-col space-y-1'>
                            <div className='flex flex-col space-y-1 w-full'>
                                <p className='text-mountain-600 text-sm'>Lighting</p>
                                <LightingOptions
                                    selectedLighting={lighting}
                                    onChange={setLighting}
                                />
                            </div>
                            <div className='flex flex-col space-y-1 w-full'>
                                <p className='text-mountain-600 text-sm'>Camera</p>
                                <CameraOptions
                                    selectedCamera={camera}
                                    onChange={setCamera}
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
                                Advance Settings
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className='flex flex-col space-y-1'>
                                <p className='text-mountain-600 text-sm'>Number of Images</p>
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
        </div >
    )
}

export default SettingsPanel;
