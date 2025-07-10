//Components
import AdjustmentSlider from '../../components/sliders/AdjustmentSlider';

//Icons
import { X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import ArrangePanel from './ArrangePanel';
import CropPanel from './CropPanel';
import FilterPanel from './FilterPanel';
import TextPanel from './TextPanel';

type PanelsProp = {
  selectedLayerId: string;
  activePanel: string;
  layers: Layer[];
  setActivePanel: Dispatch<
    SetStateAction<'arrange' | 'crop' | 'adjust' | 'filter' | 'text' | null>
  >;
  handleLayerXPosition: (newXPos: number) => void;
  handleLayerYPosition: (newYPos: number) => void;
  handleOpacityChange: (newOpacity: number) => void;
  toggleFlipHorizontal: () => void;
  toggleFlipVertical: () => void;
  handleDuplicate: (layerId: string) => void;
  updateSelectedLayer: (updates: Partial<ImageLayer>) => void;
  handleSaturation: (newSaturation: number) => void;
  handleHue: (newHue: number) => void;
  handleBrightness: (newBrightness: number) => void;
  handleContrast: (newContrast: number) => void;
  handleSepia: (newSepia: number) => void;
  handleRotationChange: (newRotation: number) => void;
  handleChangeFontSize: (newFontSize: number) => void;
  handleChangeFontFamily: (newFontFamily: string) => void;
  handleChangeTextColor: (newColor: string) => void;
  addText: () => void;
};

const Panels: React.FC<PanelsProp> = ({
  selectedLayerId,
  activePanel,
  layers,
  handleLayerXPosition,
  handleLayerYPosition,
  handleRotationChange,
  handleOpacityChange,
  toggleFlipHorizontal,
  toggleFlipVertical,
  handleDuplicate,
  setActivePanel,
  handleSaturation,
  handleHue,
  handleBrightness,
  handleContrast,
  handleSepia,
  addText,
  handleChangeFontSize,
  handleChangeFontFamily,
  handleChangeTextColor,
}) => {
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const isNonTextLayer = selectedLayer?.type === 'image' || !selectedLayer;
  const isTextLayer = selectedLayer?.type === 'text' || !selectedLayer;
  return (
    <div className="z-50">
      {activePanel && (
        <div className="to-mountain-50 border-mountain-200 flex h-[calc(100vh-98px)] w-72 flex-col space-y-2 border bg-gradient-to-b from-white shadow">
          <div className="border-mountain-200 text-mountain-700 relative flex h-[5%] items-center justify-center border-b-1 bg-white text-sm font-semibold">
            <X
              className="absolute left-2 size-4 hover:text-red-700"
              onClick={() => setActivePanel(null)}
            />
            <p className="capitalize">{activePanel}</p>
          </div>
          <div className="custom-scrollbar-left flex max-h-[82%] flex-col space-y-4 overflow-y-auto px-6 py-4">
            {activePanel == 'crop' && (
              <CropPanel
                layers={layers}
                selectedLayerId={selectedLayerId}
                handleLayerXPosition={handleLayerXPosition}
                handleLayerYPosition={handleLayerYPosition}
                handleOpacityChange={handleOpacityChange}
                toggleFlipHorizontal={toggleFlipHorizontal}
                toggleFlipVertical={toggleFlipVertical}
                handleDuplicate={handleDuplicate}
                handleRotationChange={handleRotationChange}
              />
            )}
            {activePanel == 'arrange' && (
              <ArrangePanel layers={layers} selectedLayerId={selectedLayerId} />
            )}
            {activePanel === 'adjust' &&
              (isNonTextLayer ? (
                <>
                  <AdjustmentSlider
                    label="Saturation"
                    value={selectedLayer?.saturation ?? 100}
                    onChange={handleSaturation}
                    min={0}
                    max={200}
                    gradientColors={['#808080', '#ff0000']}
                  />
                  <AdjustmentSlider
                    label="Hue"
                    value={selectedLayer?.hue ?? 0}
                    onChange={handleHue}
                    min={-180}
                    max={180}
                    gradientColors={[
                      '#808080',
                      '#ff0000',
                      '#ffff00',
                      '#00ff00',
                      '#00ffff',
                      '#0000ff',
                      '#ff00ff',
                      '#ff0000',
                    ]}
                  />
                  <AdjustmentSlider
                    label="Brightness"
                    value={selectedLayer?.brightness ?? 100}
                    onChange={handleBrightness}
                    min={0}
                    max={200}
                  />
                  <AdjustmentSlider
                    label="Contrast"
                    value={selectedLayer?.contrast ?? 100}
                    onChange={handleContrast}
                    min={0}
                    max={200}
                  />
                </>
              ) : (
                <div className="text-mountain-500 text-center text-xs italic">
                  This tab is not used for text layers. Please choose any
                  non-text layers to continue.
                </div>
              ))}
            {activePanel === 'filter' &&
              (isNonTextLayer ? (
                <FilterPanel
                  layers={
                    layers.filter((l) => l.type === 'image') as ImageLayer[]
                  }
                  selectedLayerId={selectedLayerId}
                  handleSaturation={handleSaturation}
                  handleBrightness={handleBrightness}
                  handleHue={handleHue}
                  handleContrast={handleContrast}
                  handleSepia={handleSepia}
                />
              ) : (
                <div className="text-mountain-500 text-center text-xs italic">
                  This tab is not used for text layers. Please choose any
                  non-text layers to continue.
                </div>
              ))}
            {activePanel === 'text' &&
              (isTextLayer ? (
                <TextPanel
                  selectedLayer={selectedLayer}
                  handleChangeFontSize={handleChangeFontSize}
                  handleChangeFontFamily={handleChangeFontFamily}
                  handleChangeTextColor={handleChangeTextColor}
                  addText={addText}
                />
              ) : (
                <div className="text-mountain-500 text-center text-xs italic">
                  This tab is not used for image layer. Please continue with
                  non-image layer.
                </div>
              ))}
          </div>
          {/* {activePanel === "filter" ? (
                        <>
                            <hr className='flex mb-4 border-mountain-200 border-t-1 w-full' />
                            <div className='flex space-x-2 w-full h-10'>
                                <div className='flex justify-center items-center pl-6 w-1/2 h-10'>
                                    <Button className='flex justify-center items-center bg-indigo-200 border border-mountain-200 rounded-lg w-full h-full font-normal text-sm'>
                                        <p>Apply</p>
                                    </Button>
                                </div>
                                <div className='flex justify-center items-center pr-6 w-1/2 h-10'>
                                    <Button className='flex justify-center items-center bg-white border border-mountain-200 rounded-lg w-full h-full font-normal text-sm'>
                                        <p>Cancel</p>
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (activePanel !== "arrange") && (
                        <>
                            <hr className='flex mb-4 border-mountain-200 border-t-1 w-full' />
                            <div className='flex justify-center items-center px-6 w-full h-10'>
                                <Tooltip
                                    title="Hold down"
                                    placement="top"
                                    arrow
                                    slotProps={{
                                        popper: {
                                            sx: {
                                                [`&.${tooltipClasses.popper}[data-popper-placement*="bottom"] .${tooltipClasses.tooltip}`]:
                                                {
                                                    marginTop: '4px',
                                                },
                                                [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
                                                {
                                                    marginBottom: '4px',
                                                },
                                                [`&.${tooltipClasses.popper}[data-popper-placement*="right"] .${tooltipClasses.tooltip}`]:
                                                {
                                                    marginLeft: '4px',
                                                },
                                                [`&.${tooltipClasses.popper}[data-popper-placement*="left"] .${tooltipClasses.tooltip}`]:
                                                {
                                                    marginRight: '4px',
                                                },
                                            },
                                        },
                                    }}>
                                    <Button className='flex justify-center items-center bg-white border border-mountain-200 rounded-lg w-full h-full font-normal text-sm'>
                                        <MdOutlineFlip className='mr-2' />
                                        <p>Compare</p>
                                    </Button>
                                </Tooltip>
                            </div>
                            <div className='flex justify-center items-center px-6 w-full h-10'>
                                <Button className='flex justify-center items-center bg-white border border-mountain-200 rounded-lg w-full h-full font-normal text-sm'>
                                    <RiResetRightLine className='mr-2' />
                                    <p>Reset</p>
                                </Button>
                            </div>
                        </>
                    )} */}
        </div>
      )}
    </div>
  );
};

export default Panels;
