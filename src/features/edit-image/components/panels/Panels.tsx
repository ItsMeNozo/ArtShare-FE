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
  updateSelectedLayer: (updates: Partial<ImageLayer>) => void;
  handleLayerXPosition: (newXPos: number) => void;
  handleLayerYPosition: (newYPos: number) => void;
  handleOpacityChange: (newOpacity: number) => void;
  toggleFlipHorizontal: () => void;
  toggleFlipVertical: () => void;
  handleDuplicate: (layerId: string) => void;
  handleSaturation: (newSaturation: number) => void;
  moveForward: (layerId: string) => void;
  moveBackward: (layerId: string) => void;
  bringToFront: (layerId: string) => void;
  sendToBack: (layerId: string) => void;
  handleHue: (newHue: number) => void;
  handleBrightness: (newBrightness: number) => void;
  handleContrast: (newContrast: number) => void;
  handleSepia: (newSepia: number) => void;
  handleRotationChange: (newRotation: number) => void;
  handleChangeFontSize: (newFontSize: number) => void;
  handleChangeFontFamily: (newFontFamily: string) => void;
  handleChangeTextColor: (newColor: string) => void;
  handleLockLayer: (layerId: string) => void;
  addText: () => void;
};

const Panels: React.FC<PanelsProp> = ({
  selectedLayerId,
  activePanel,
  layers,
  setActivePanel,
  handleLayerXPosition,
  handleLayerYPosition,
  handleRotationChange,
  handleOpacityChange,
  toggleFlipHorizontal,
  toggleFlipVertical,
  handleDuplicate,
  moveForward,
  moveBackward,
  bringToFront,
  sendToBack,
  handleSaturation,
  handleHue,
  handleBrightness,
  handleContrast,
  handleSepia,
  addText,
  handleChangeFontSize,
  handleChangeFontFamily,
  handleChangeTextColor,
  handleLockLayer
}) => {
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const isNonTextLayer = selectedLayer?.type === 'image' || !selectedLayer;
  const isTextLayer = selectedLayer?.type === 'text' || !selectedLayer;
  return (
    <div className="z-50">
      {activePanel && (
        <div className="flex flex-col space-y-2 bg-gradient-to-b from-white to-mountain-50 shadow border border-mountain-200 w-72 h-screen">
          <div className="relative flex justify-center items-center bg-white border-mountain-200 border-b-1 h-[5%] font-semibold text-mountain-700 text-sm">
            <X
              className="left-2 absolute size-4 hover:text-red-700"
              onClick={() => setActivePanel(null)}
            />
            <p className="capitalize">{activePanel}</p>
          </div>
          <div className="flex flex-col space-y-4 px-6 py-4 max-h-[82%] overflow-y-auto custom-scrollbar">
            {activePanel == "arrange" && (
              <ArrangePanel
                layers={layers}
                selectedLayerId={selectedLayerId}
                moveForward={moveForward}
                moveBackward={moveBackward}
                bringToFront={bringToFront}
                sendToBack={sendToBack}
                handleLockLayer={handleLockLayer}
              />
            )}
            {activePanel == "crop" && (
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

            {activePanel === "adjust" &&
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
                <div className="text-mountain-500 text-xs text-center italic">
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
                <div className="text-mountain-500 text-xs text-center italic">
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
                <div className="text-mountain-500 text-xs text-center italic">
                  This tab is not used for image layer. Please continue with
                  non-image layer.
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Panels;
