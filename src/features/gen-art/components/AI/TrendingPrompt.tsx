import { useEffect, useRef, useState } from 'react';

// UI Components
import { Button } from '@mui/material';
import Avatar from 'boring-avatars';

// Icons
import { Skeleton } from '@/components/ui/skeleton';
import { IoCopyOutline } from 'react-icons/io5';
import { LuImagePlus } from 'react-icons/lu';
import { PiStarFourFill } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import { getTrendingAiPosts } from '../../api/get-trending-ai';
interface TrendingPromptProps {
  onClose: () => void;
}

const TrendingPrompt: React.FC<TrendingPromptProps> = ({ onClose }) => {
  const [translateY, setTranslateY] = useState(10);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const handleApplyPrompt = () => {
    if (!trending.length) return;
    const t = selectedItem;
    if (!t) return;
    onClose();
    navigate('/image/tool/text-to-image', {
      state: {
        ...t,
      },
    });
  };

  const scrollStep = 1; // scroll 1 item each step
  const scrollThreshold = 40; // px delta before switching item
  const scrollAccumulator = useRef(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TrendingItem | null>(null);

  // -----------------------------------------------------
  // Fetch trending AI posts
  // -----------------------------------------------------
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const data = await getTrendingAiPosts();
        setTrending(data);
        if (data.length > 0) {
          setSelectedItem(data[0]);
        }
      } catch (error) {
        console.error('Failed to load trending posts:', error);
      }
    };
    fetchTrendingPosts();
  }, []);

  // -----------------------------------------------------
  // Wheel scroll handler for thumbnail column
  // -----------------------------------------------------
  useEffect(() => {
    const container = document.getElementById('trending-container');
    if (!container) return;
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      scrollAccumulator.current += e.deltaY;
      if (Math.abs(scrollAccumulator.current) >= scrollThreshold) {
        const direction = scrollAccumulator.current > 0 ? 1 : -1;
        const currentIndex = trending.findIndex(
          (item) => item === selectedItem,
        );
        if (currentIndex === -1) return;
        let next = currentIndex + direction * scrollStep;
        next = Math.min(Math.max(next, 0), trending.length - 1);
        setSelectedItem(trending[next]);
        // update translateY for smooth scroll
        if (next <= 5) {
          setTranslateY(10);
        } else {
          const offsetPerItem = 64 + 8; // 64px + 8px gap
          const itemsAbove = next - 5;
          const newY = 10 - offsetPerItem * itemsAbove;
          setTranslateY(Math.max(newY, -1500));
        }
        scrollAccumulator.current = 0;
      }
    };
    container.addEventListener('wheel', handleScroll);
    return () => container.removeEventListener('wheel', handleScroll);
  }, [trending, selectedItem]);

  // -----------------------------------------------------
  // Thumbnail click → select image & adjust scroll
  // -----------------------------------------------------
  const handleImageClick = (item: TrendingItem) => {
    setSelectedItem(item);
    const index = trending.findIndex((i) => i === item);
    if (index <= 5) {
      setTranslateY(10);
    } else {
      const offsetPerItem = 64 + 8;
      const itemsAbove = index - 5;
      const newY = 10 - offsetPerItem * itemsAbove;
      setTranslateY(Math.max(newY, -1500));
    }
  };
  const isLoading = !selectedItem;
  return (
    <div
      id="trending-container"
      ref={containerRef}
      className="flex h-full w-full justify-start"
    >
      {/* Thumbnail column */}
      <div className="relative flex h-full w-[8%] flex-col overflow-hidden rounded-xl">
        {/* top blur */}
        <div
          className="flex h-[2000px] w-full flex-col items-center space-y-2"
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={`h-16 rounded-lg ${index === 0 ? 'w-20' : 'w-16'}`}
                />
              ))
            : trending.map((item, index) => (
                <img
                  key={index}
                  src={item.image}
                  onClick={() => handleImageClick(item)}
                  className={`cursor-pointer rounded-lg object-cover ${
                    selectedItem === item ? 'w-20' : 'w-16'
                  } max-h-16 min-h-16 transition-all duration-150`}
                />
              ))}
          <div />
        </div>
        {/* bottom blur */}
        <div className="absolute -bottom-2 z-10 flex h-10 w-full bg-white/60 blur-sm" />
      </div>
      {/* Main preview image */}
      <div className="bg-mountain-100 relative flex h-full w-[62%] items-center justify-center">
        <div className="absolute top-6 flex items-center justify-center rounded-full bg-white p-3 px-9 text-sm font-medium">
          <p>
            <span className="text-xl">👑</span> Top Trending Prompt Results
          </p>
        </div>
        <div className="relative flex h-128 w-full items-center justify-center">
          {!imageLoaded && (
            <Skeleton className="bg-mountain-50 absolute h-full w-128 animate-pulse rounded-lg" />
          )}
          <img
            src={selectedItem?.image}
            alt="Selected"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              setImageLoaded(true);
            }}
            className={`h-128 rounded-lg object-contain shadow-lg transition-all duration-200 ${!imageLoaded ? 'invisible' : ''}`}
          />
        </div>
      </div>
      {/* Prompt & metadata */}
      <div className="flex h-full w-[30%]">
        <div className="relative flex w-full flex-col">
          {/* Author */}
          <div className="border-mountain-100 flex h-28 w-full items-end justify-between border-b p-4">
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded" />
                </>
              ) : (
                <>
                  {selectedItem?.author.profilePictureUrl ? (
                    <img
                      src={selectedItem?.author.profilePictureUrl}
                      alt={selectedItem?.author.username}
                      className="dark:border-mountain-700 h-7 w-7 rounded-full border border-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <Avatar
                      name={selectedItem.author.username || 'Unknown'}
                      colors={['#84bfc3', '#ff9b62', '#d96153']}
                      variant="beam"
                      size={80}
                    />
                  )}
                  <p className="font-medium">{selectedItem?.author.username}</p>
                </>
              )}
            </div>
          </div>
          {/* Prompt text */}
          <div className="border-mountain-100 flex h-1/2 w-full flex-col space-y-2 border-b p-4">
            <div className="flex w-full items-center justify-between">
              <p className="font-medium">Prompt</p>
              <Button
                disabled={isLoading}
                title="Copy"
                className="bg-indigo-100 disabled:opacity-50"
              >
                <IoCopyOutline className="size-5" />
              </Button>
            </div>
            {isLoading ? (
              <Skeleton className="flex h-full w-full rounded-lg" />
            ) : (
              <div className="bg-mountain-50 custom-scrollbar flex max-h-full overflow-y-auto rounded-lg p-2 text-sm">
                {selectedItem?.prompt}
              </div>
            )}
          </div>
          {/* Style · Lighting · Camera */}
          <div className="grid w-full grid-cols-[40%_60%] gap-y-3 p-4 text-sm">
            {/* Style */}
            <div className="flex items-center space-x-2">
              <PiStarFourFill className="text-mountain-600 size-4" />
              <p className="font-medium text-gray-800">Style</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-4 w-24 rounded" />
            ) : (
              <p className="text-mountain-600 capitalize">
                {selectedItem?.style ?? 'Default'}
              </p>
            )}
            {/* Aspect Ratio */}
            <div className="flex items-center space-x-2">
              <PiStarFourFill className="text-mountain-600 size-4" />
              <p className="font-medium text-gray-800">Aspect Ratio</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-4 w-24 rounded" />
            ) : (
              <p className="text-mountain-600">
                {selectedItem?.aspectRatio
                  ? selectedItem.aspectRatio.charAt(0).toUpperCase() +
                    selectedItem.aspectRatio.slice(1).toLowerCase()
                  : 'Default'}
              </p>
            )}
            {/* Lighting */}
            <div className="flex items-center space-x-2">
              <PiStarFourFill className="text-mountain-600 size-4" />
              <p className="font-medium text-gray-800">Lighting</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-4 w-20 rounded" />
            ) : (
              <p className="text-mountain-600 capitalize">
                {selectedItem?.lighting ?? 'Default'}
              </p>
            )}
            {/* Camera */}
            <div className="flex items-center space-x-2">
              <PiStarFourFill className="text-mountain-600 size-4" />
              <p className="font-medium text-gray-800">Camera</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-4 w-20 rounded" />
            ) : (
              <p className="text-mountain-600 capitalize">
                {selectedItem?.camera ?? 'Default'}
              </p>
            )}
          </div>
          <div className="absolute bottom-0 w-full p-4">
            <Button
              disabled={isLoading}
              onClick={handleApplyPrompt}
              className="bg-mountain-950 hover:bg-mountain-900 h-12 w-full font-normal text-white shadow-sm disabled:opacity-50"
            >
              <LuImagePlus className="mr-2 size-5" />
              <p>Apply This Prompt</p>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingPrompt;
