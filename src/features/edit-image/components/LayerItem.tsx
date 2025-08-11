import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Lock, Trash2Icon, Unlock } from 'lucide-react';
import React from 'react';
import { GoMoveToBottom, GoMoveToTop } from 'react-icons/go';
import { IoCopyOutline } from 'react-icons/io5';
import { TbChevronDown, TbChevronUp } from 'react-icons/tb';
import Moveable from 'react-moveable';

const LayerItem = React.memo(
  ({
    layer,
    editingLayerId,
    selectedLayerId,
    layerRefs,
    moveableRef,
    zIndex,
    setEditingLayerId,
    setSelectedLayerId,
    handleTextChange,
    setLayers,
    handleDuplicate,
    moveForward,
    moveBackward,
    bringToFront,
    sendToBack,
    handleLockLayer,
  }: {
    layer: Layer;
    editingLayerId: string | null;
    selectedLayerId: string | null;
    layerRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
    moveableRef: React.RefObject<Moveable>;
    zIndex: { min: number; max: number } | null;
    setEditingLayerId: React.Dispatch<React.SetStateAction<string | null>>;
    setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>;
    handleTextChange: (id: string, text: string) => void;
    setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
    handleDuplicate: (id: string) => void;
    moveForward: (id: string) => void;
    moveBackward: (id: string) => void;
    bringToFront: (id: string) => void;
    sendToBack: (id: string) => void;
    handleLockLayer: (id: string) => void;
  }) => {
    return (
      <ContextMenu key={layer.id}>
        <ContextMenuTrigger asChild>
          <div>
            <div
              ref={(el) => (layerRefs.current[layer.id] = el)}
              style={{
                width: layer.width,
                height: layer.height,
                transform: `translate(${layer.x}px, ${layer.y}px) rotate(${layer.rotation}deg)`,
                transformOrigin: 'center',
                position: 'absolute',
                zIndex: layer.zIndex,
                background: 'transparent',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                pointerEvents: 'auto',
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedLayerId(layer.id);
              }}
            >
              {layer.type === 'image' ? (
                <img
                  src={layer.src}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    filter: `
                      saturate(${layer.saturation}%)
                      hue-rotate(${layer.hue}deg)
                      brightness(${layer.brightness}%)
                      contrast(${layer.contrast}%)
                      opacity(${layer.opacity})
                      sepia(${layer.sepia}%)
                    `,
                    transform: `scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
                    zIndex: layer.zIndex,
                  }}
                  draggable={false}
                />
              ) : editingLayerId === layer.id && layer.type === 'text' ? (
                <textarea
                  autoFocus
                  value={layer.text}
                  onChange={(e) => handleTextChange(layer.id, e.target.value)}
                  onBlur={() => setEditingLayerId(null)}
                  onFocus={(e) => {
                    const val = e.target.value;
                    e.target.setSelectionRange(val.length, val.length);
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    fontSize: layer.fontSize,
                    color: layer.color,
                    zIndex: layer.zIndex,
                    fontWeight: layer.fontWeight || 'normal',
                    fontFamily: layer.fontFamily || 'sans-serif',
                    textAlign: 'center',
                    background: 'transparent',
                    border: 'none',
                    resize: 'none',
                    outline: 'none',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                    transform: `scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
                    opacity: layer.opacity,
                  }}
                />
              ) : layer.type === 'text' ? (
                <div
                  onDoubleClick={() => setEditingLayerId(layer.id)}
                  style={{
                    width: '100%',
                    height: '100%',
                    fontSize: layer.fontSize,
                    color: layer.color,
                    zIndex: layer.zIndex,
                    fontWeight: layer.fontWeight || 'normal',
                    fontFamily: layer.fontFamily || 'sans-serif',
                    textAlign: 'center',
                    whiteSpace: 'pre-wrap',
                    userSelect: 'none',
                    cursor: 'text',
                    transform: `scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
                    opacity: layer.opacity,
                  }}
                  className="cursor-pointer"
                >
                  {layer.text}
                </div>
              ) : null}
            </div>
            {selectedLayerId === layer.id && !layer.isLocked && (
              <Moveable
                ref={moveableRef}
                target={layerRefs.current[layer.id]}
                draggable
                resizable
                rotatable
                rotationPosition="top"
                throttleResize={1}
                renderDirections={['nw', 'ne', 'sw', 'se']}
                keepRatio={false}
                onDrag={({ beforeTranslate }) => {
                  setLayers((prev) =>
                    prev.map((l) =>
                      l.id === layer.id
                        ? { ...l, x: beforeTranslate[0], y: beforeTranslate[1] }
                        : l,
                    ),
                  );
                }}
                onResize={({ width, height, drag, target }) => {
                  target.style.width = `${width}px`;
                  target.style.height = `${height}px`;
                  target.style.transform = drag.transform;
                }}
                onResizeEnd={({ lastEvent }) => {
                  if (!lastEvent) return;
                  const { width, height, drag } = lastEvent;
                  setLayers((prev) =>
                    prev.map((l) =>
                      l.id === layer.id
                        ? {
                            ...l,
                            width,
                            height,
                            x: drag.beforeTranslate[0],
                            y: drag.beforeTranslate[1],
                          }
                        : l,
                    ),
                  );
                }}
                onRotate={({ rotation }) => {
                  setLayers((prev) =>
                    prev.map((l) =>
                      l.id === layer.id ? { ...l, rotation } : l,
                    ),
                  );
                }}
              />
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="border-mountain-200 w-48 p-2 text-sm">
          <ContextMenuItem onClick={() => handleLockLayer(layer.id)}>
            {layer.isLocked ? (
              <>
                <Unlock className="size-4" />
                <span>UnLock Layer</span>
              </>
            ) : (
              <>
                <Lock className="size-4" />
                <span>Lock Layer</span>
              </>
            )}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleDuplicate(layer.id)}>
            <IoCopyOutline className="size-4" />
            <span>Duplicate</span>
          </ContextMenuItem>
          <ContextMenuItem
            disabled={layer?.zIndex === zIndex?.max}
            onClick={() => bringToFront(layer.id)}
          >
            <GoMoveToTop className="size-4" />
            <span>Bring To Front</span>
          </ContextMenuItem>
          <ContextMenuItem
            disabled={layer?.zIndex === zIndex?.max}
            onClick={() => moveForward(layer.id)}
          >
            <TbChevronUp className="size-4" />
            <span>Move Forward</span>
          </ContextMenuItem>
          <ContextMenuItem
            disabled={layer?.zIndex === zIndex?.min}
            onClick={() => moveBackward(layer.id)}
          >
            <TbChevronDown className="size-4" />
            <span>Move Backward</span>
          </ContextMenuItem>
          <ContextMenuItem
            disabled={layer?.zIndex === zIndex?.min}
            onClick={() => sendToBack(layer.id)}
          >
            <GoMoveToBottom className="size-4" />
            <span>Bring To Back</span>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              setLayers((prev) => prev.filter((l) => l.id !== layer.id))
            }
          >
            <Trash2Icon className="size-4" />
            <span>Delete</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
);

export default LayerItem;
