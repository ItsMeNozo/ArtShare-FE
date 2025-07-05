import { useState, useEffect, useRef } from "react";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@mui/material";

// Icons
import { IoCopyOutline } from "react-icons/io5";
import { LuImagePlus } from "react-icons/lu";
import { getTrendingAiPosts } from "../../api/get-trending-ai";
import { useNavigate } from "react-router-dom";
import { PiStarFourFill } from "react-icons/pi";
import { Skeleton } from "@/components/ui/skeleton";
interface TrendingPromptProps {
  onClose: () => void;
}

const TrendingPrompt: React.FC<TrendingPromptProps> = ({
  onClose,
}) => {
  const [translateY, setTranslateY] = useState(10);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const handleApplyPrompt = () => {
    if (!trending.length) return;
    const t = selectedItem;
    if (!t) return;
    onClose();
    navigate("/image/tool/text-to-image", {
      state: {
        prompt: t.prompt,
        modelKey: t.model_key,
        aspectRatio: t.aspect_ratio,
        lighting: t.lighting,
        camera: t.camera,
        style: t.style,
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
        console.error("Failed to load trending posts:", error);
      }
    };
    fetchTrendingPosts();
  }, []);

  // -----------------------------------------------------
  // Wheel scroll handler for thumbnail column
  // -----------------------------------------------------
  useEffect(() => {
    const container = document.getElementById("trending-container");
    if (!container) return;
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      scrollAccumulator.current += e.deltaY;
      if (Math.abs(scrollAccumulator.current) >= scrollThreshold) {
        const direction = scrollAccumulator.current > 0 ? 1 : -1;
        const currentIndex = trending.findIndex((item) => item === selectedItem);
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
    container.addEventListener("wheel", handleScroll);
    return () => container.removeEventListener("wheel", handleScroll);
  }, [trending, selectedItem]);


  // -----------------------------------------------------
  // Thumbnail click → select image & adjust scroll
  // -----------------------------------------------------
  const handleImageClick = (item: TrendingItem) => {
    setSelectedItem(item);
    const index = trending.findIndex(i => i === item);
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
      className="flex justify-start w-full h-full"
    >
      {/* Thumbnail column */}
      <div className="relative flex flex-col rounded-xl w-[8%] h-full overflow-hidden">
        {/* top blur */}
        <div
          className="flex flex-col items-center space-y-2 w-full h-[2000px]"
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className={`rounded-lg h-16 ${index === 0 ? "w-20" : "w-16"}`}
              />
            ))
            : trending.map((item, index) => (
              <img
                key={index}
                src={item.image}
                onClick={() => handleImageClick(item)}
                className={`rounded-lg object-cover cursor-pointer ${selectedItem === item ? "w-20" : "w-16"
                  } min-h-16 max-h-16 transition-all duration-150`}
              />
            ))}
          <div />
        </div>
        {/* bottom blur */}
        <div className="-bottom-2 z-10 absolute flex bg-white/60 blur-sm w-full h-10" />
      </div>
      {/* Main preview image */}
      <div className="relative flex justify-center items-center bg-mountain-100 w-[62%] h-full">
        <div className="top-6 absolute flex justify-center items-center bg-white p-3 px-9 rounded-full font-medium text-sm">
          <p><span className="text-xl">👑</span> Top Trending Prompt Results</p>
        </div>
        <div className="relative flex justify-center items-center w-full h-128">
          {!imageLoaded && (
            <Skeleton className="absolute bg-mountain-50 rounded-lg w-128 h-full animate-pulse" />
          )}
          <img
            src={selectedItem?.image}
            alt="Selected"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              setImageLoaded(true);
            }}
            className={`shadow-lg rounded-lg h-128 object-contain transition-all duration-200 ${!imageLoaded ? "invisible" : ""}`}
          />
        </div>
      </div>
      {/* Prompt & metadata */}
      <div className="flex w-[30%] h-full">
        <div className="relative flex flex-col w-full">
          {/* Author */}
          <div className="flex justify-between items-end p-4 border-mountain-100 border-b w-full h-28">
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <>
                  <Skeleton className="rounded-full w-12 h-12" />
                  <Skeleton className="rounded w-24 h-4" />
                </>
              ) : (
                <>
                  <Avatar className="size-12">
                    {selectedItem?.author.profile_picture_url ? (
                      <AvatarImage
                        src={selectedItem.author.profile_picture_url}
                        alt={selectedItem.author.username || "User"}
                      />
                    ) : (
                      <AvatarFallback className="bg-mountain-100">
                        {selectedItem.author.username
                          ?.slice(0, 3)
                          .toUpperCase() || "US"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <p className="font-medium">{selectedItem?.author.username}</p>
                </>
              )}
            </div>
          </div>
          {/* Prompt text */}
          <div className="flex flex-col space-y-2 p-4 border-mountain-100 border-b w-full h-1/2">
            <div className="flex justify-between items-center w-full">
              <p className="font-medium">Prompt</p>
              <Button disabled={isLoading} title="Copy" className="bg-indigo-100 disabled:opacity-50">
                <IoCopyOutline className="size-5" />
              </Button>
            </div>
            {isLoading ? (
              <Skeleton className="flex rounded-lg w-full h-full" />
            ) : (
              <div className="flex bg-mountain-50 p-2 rounded-lg max-h-full overflow-y-auto text-sm custom-scrollbar">
                {selectedItem?.prompt}
              </div>
            )}
          </div>
          {/* Style · Lighting · Camera */}
          <div className="gap-y-3 grid grid-cols-[40%_60%] p-4 w-full text-sm">
            {/* Style */}
            <div className="flex items-center space-x-2">
              <PiStarFourFill className="size-4 text-mountain-600" />
              <p className="font-medium text-gray-800">Style</p>
            </div>
            {isLoading ? (
              <Skeleton className="rounded w-24 h-4" />
            ) : (
              <p className="text-mountain-600 capitalize">{selectedItem?.style ?? "Default"}</p>
            )}
            {/* Aspect Ratio */}
            <div className="flex items-center space-x-2">
              <PiStarFourFill className="size-4 text-mountain-600" />
              <p className="font-medium text-gray-800">Aspect Ratio</p>
            </div>
            {isLoading ? (
              <Skeleton className="rounded w-24 h-4" />
            ) : (
              <p className="text-mountain-600">
                {selectedItem?.aspect_ratio
                  ? selectedItem.aspect_ratio.charAt(0).toUpperCase() +
                  selectedItem.aspect_ratio.slice(1).toLowerCase()
                  : "Default"}
              </p>
            )}
            {/* Lighting */}
            <div className="flex items-center space-x-2">
              <PiStarFourFill className="size-4 text-mountain-600" />
              <p className="font-medium text-gray-800">Lighting</p>
            </div>
            {isLoading ? (
              <Skeleton className="rounded w-20 h-4" />
            ) : (
              <p className="text-mountain-600 capitalize">{selectedItem?.lighting ?? "Default"}</p>
            )}
            {/* Camera */}
            <div className="flex items-center space-x-2">
              <PiStarFourFill className="size-4 text-mountain-600" />
              <p className="font-medium text-gray-800">Camera</p>
            </div>
            {isLoading ? (
              <Skeleton className="rounded w-20 h-4" />
            ) : (
              <p className="text-mountain-600 capitalize">{selectedItem?.camera ?? "Default"}</p>
            )}
          </div>
          <div className="bottom-0 absolute p-4 w-full">
            <Button
              disabled={isLoading}
              onClick={handleApplyPrompt}
              className="bg-mountain-950 hover:bg-mountain-900 disabled:opacity-50 shadow-sm w-full h-12 font-normal text-white"
            >
              <LuImagePlus className="mr-2 size-5" />
              <p>Apply This Prompt</p>
            </Button>
          </div>
        </div>
      </div>
    </div >
  );
};

export default TrendingPrompt;
