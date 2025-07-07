import { HorizontalSlider } from '@/components/sliders/HorizontalSlider';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { LockIcon } from 'lucide-react';
import React from 'react';
import { FiPlus as AddIcon, FiX as DeleteIcon } from 'react-icons/fi';
import { SelectedCollectionId, SliderItem } from '../types/collection';

const CARD_MIN_WIDTH = 256;

interface CollectionSliderProps {
  items: SliderItem[];
  selectedId: SelectedCollectionId;
  loading: boolean;
  onSelect: (id: SelectedCollectionId) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

const getSliderItemId = (item: SliderItem): string => {
  switch (item.type) {
    case 'all':
      return 'all-posts';
    case 'collection':
      return `collection-${item.id}`;
    case 'add':
      return 'add-collection';
    default:
      return `unknown-${Math.random()}`;
  }
};

const renderSliderItem = (
  item: SliderItem,
  selectedId: SelectedCollectionId,
  loadingCollections: boolean,
  onSelect: (id: SelectedCollectionId) => void,
  onAdd: () => void,
  onRemove: (id: number) => void,
) => {
  const baseCardSx = {
    width: CARD_MIN_WIDTH,
    minWidth: CARD_MIN_WIDTH,
    minHeight: 220,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.3s, border-color 0.3s',
    height: '100%',
    '&:hover': { boxShadow: 3 },
    overflow: 'hidden',
  };

  switch (item.type) {
    case 'all':
    case 'collection': {
      const isSelected =
        (item.type === 'all' && selectedId === 'all') ||
        (item.type === 'collection' && selectedId === item.id);
      const title = item.type === 'all' ? 'All' : item.name;
      const itemId = item.type === 'all' ? 'all' : item.id;
      const thumbnailUrl = item.thumbnailUrl;
      const isCollection = item.type === 'collection';

      return (
        <Card
          key={getSliderItemId(item)}
          variant="outlined"
          sx={{
            ...baseCardSx,
            borderColor: isSelected ? 'primary.main' : 'grey.300',
            borderWidth: isSelected ? 2 : 1,
            position: 'relative',
          }}
        >
          {/* --- Remove Button --- */}
          {isCollection && (
            <Tooltip title="Remove collection">
              <IconButton
                aria-label="Remove collection"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
                className="collection-delete-button"
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  zIndex: 10,
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  opacity: 0,
                  transition: 'opacity 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(200, 0, 0, 0.8)',
                    opacity: 1,
                  },
                  '.group:hover &': {
                    opacity: 1,
                  },
                }}
              >
                <DeleteIcon fontSize={16} />
                {/* Slightly smaller icon */}
              </IconButton>
            </Tooltip>
          )}
          {/* --- End Remove Button --- */}
          <CardActionArea
            onClick={() => onSelect(itemId)}
            disabled={loadingCollections}
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              p: 1.5,
              height: '100%',
            }}
          >
            <Box sx={{ position: 'relative', width: '100%' }}>
              {thumbnailUrl ? (
                <CardMedia
                  component="img"
                  image={thumbnailUrl}
                  alt={title}
                  sx={{
                    aspectRatio: '16 / 9',
                    objectFit: 'cover',
                    width: '100%',
                    borderRadius: 1,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    aspectRatio: '16 / 9',
                    width: '100%',
                    borderRadius: 1,
                    flexShrink: 0,
                    bgcolor: 'grey.200',
                  }}
                ></Box>
              )}
            </Box>
            <CardContent sx={{ flexGrow: 1, width: '100%', p: 0, pt: 1.5 }}>
              <Typography
                gutterBottom
                variant="subtitle2"
                component="div"
                noWrap
                fontWeight="medium"
              >
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {loadingCollections ? '...' : `${item.count} items`}
              </Typography>
            </CardContent>
            {isCollection && item.isPrivate && (
              <Tooltip title="Private">
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    zIndex: 1,
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderRadius: '50%',
                    p: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LockIcon size={12} />
                </Box>
              </Tooltip>
            )}
          </CardActionArea>
        </Card>
      );
    }
    case 'add': {
      return (
        <Paper
          key={getSliderItemId(item)}
          variant="outlined"
          onClick={onAdd}
          sx={{
            ...baseCardSx,
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            borderColor: 'grey.400',
            borderStyle: 'dashed',
            color: 'grey.600',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          <AddIcon fontSize={28} />
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ lineHeight: 1.3, mt: 1 }}
          >
            Add new collection
          </Typography>
        </Paper>
      );
    }
    default:
      return null;
  }
};

export const CollectionSlider: React.FC<CollectionSliderProps> = ({
  items,
  selectedId,
  loading,
  onSelect,
  onAdd,
  onRemove,
}) => {
  if (loading && items.length === 0) {
    return (
      <Box display="flex" gap={2} py={1} overflow="hidden">
        {[...Array(5)].map((_, index) => (
          <Paper
            key={`placeholder-${index}`}
            variant="outlined"
            sx={{
              minWidth: CARD_MIN_WIDTH,
              height: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              borderColor: 'grey.300',
              borderStyle: 'dashed',
              color: 'grey.500',
              flexShrink: 0,
            }}
          >
            <CircularProgress size={24} color="inherit" />
          </Paper>
        ))}
      </Box>
    );
  }

  return (
    <HorizontalSlider
      data={items}
      renderItem={(item) =>
        renderSliderItem(item, selectedId, loading, onSelect, onAdd, onRemove)
      }
      getItemId={getSliderItemId}
      wrapperClassName="collection-slider"
    />
  );
};
