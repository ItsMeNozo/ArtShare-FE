import { useState, useEffect, useRef } from "react";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@mui/material";

// Icons
import { IoIosSquareOutline } from "react-icons/io";
import { IoCopyOutline } from "react-icons/io5";
import { LuImagePlus } from "react-icons/lu";
import { getTrendingAiPosts } from "../../api/get-trending-ai";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getUserProfile,
  UserProfile,
} from "@/features/user-profile-public/api/user-profile.api";
interface TrendingItem {
  image: string;
  prompt: string;
  style: string;
  lighting: string;
  camera: string;
  aspect_ratio: string;
  model_key: string;
}
// =====================================================
// Component
// =====================================================
interface TrendingPromptProps {
  onClose: () => void;
}
const example_1 =
  "https://res.cloudinary.com/dqxtf297o/image/upload/f_auto,q_auto/v1/Models-Mock/Model-1/dzu0q9a2zxvtu3w1r29a";

const TrendingPrompt: React.FC<TrendingPromptProps> = ({
  onClose,
}) => {
  const [translateY, setTranslateY] = useState(10);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const handleApplyPrompt = () => {
    // ③ new helper
    if (!trending.length) return;
    const t = trending[selectedImageIndex];
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

  // ✅ fixed typo: selectedImageIndex (not “seletected”)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const scrollStep = 1; // scroll 1 item each step
  const scrollThreshold = 40; // px delta before switching item
  const scrollAccumulator = useRef(0);

  const [trending, setTrending] = useState<TrendingItem[]>([]);

  const { data: profileData } = useQuery<UserProfile, Error>({
    queryKey: ["userProfile"],
    queryFn: () => getUserProfile(),
  });

  // formData is used for AvatarSection's immediate display and updates
  const [formData, setFormData] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (profileData) {
      setFormData(profileData);
    }
  }, [profileData]);

  // -----------------------------------------------------
  // Fetch trending AI posts
  // -----------------------------------------------------
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const data = await getTrendingAiPosts();
        setTrending(data);
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

        setSelectedImageIndex((prev) => {
          let next = prev + direction * scrollStep;
          next = Math.min(Math.max(next, 0), trending.length - 1);

          // update translateY for smooth scroll
          setTranslateY(() => {
            if (next <= 5) return 10; // keep the first six items in view
            const offsetPerItem = 64 + 8; // 64px thumbnail + 8px gap
            const itemsAbove = next - 5;
            const newY = 10 - offsetPerItem * itemsAbove;
            return Math.max(newY, -1500);
          });

          return next;
        });

        scrollAccumulator.current = 0;
      }
    };

    container.addEventListener("wheel", handleScroll);
    return () => container.removeEventListener("wheel", handleScroll);
  }, [trending]);

  // -----------------------------------------------------
  // Thumbnail click → select image & adjust scroll
  // -----------------------------------------------------
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);

    if (index <= 5) {
      setTranslateY(10);
    } else {
      const offsetPerItem = 64 + 8;
      const itemsAbove = index - 5;
      const newY = 10 - offsetPerItem * itemsAbove;
      setTranslateY(Math.max(newY, -1500));
    }
  };

  // -----------------------------------------------------
  // Render
  // -----------------------------------------------------
  return (
    <div
      id="trending-container"
      ref={containerRef}
      className="flex justify-start w-full h-full"
    >
      {/* Main preview image */}
      <div className="relative flex justify-center items-center bg-mountain-100 w-[60%] h-full">
        <div className="top-6 absolute flex justify-center items-center bg-white p-3 px-9 rounded-full font-medium text-sm">
          <p>
            <span className="text-xl">👑</span> Top Trending Prompt Results
          </p>
        </div>

        <img
          src={trending[selectedImageIndex]?.image}
          alt="Selected"
          className="flex shadow-lg rounded-lg h-128 object-contain transition-all duration-200"
        />
      </div>

      {/* Prompt & metadata */}
      <div className="flex border-mountain-200 border-r w-[30%] h-full">
        <div className="relative flex flex-col w-full">
          {/* Author */}
          <div className="flex justify-between items-end p-4 border-mountain-100 border-b w-full h-28">
            <div className="flex items-center space-x-2">
              <Avatar className="size-12">
                {formData?.profile_picture_url ? (
                  <AvatarImage
                    src={formData.profile_picture_url}
                    alt={formData.username || "User"}
                  />
                ) : (
                  <AvatarFallback>
                    {formData?.username?.slice(0, 3).toUpperCase() || "US"}
                  </AvatarFallback>
                )}
              </Avatar>
              <p className="font-medium">{formData?.username}</p>
            </div>
          </div>

          {/* Prompt text */}
          <div className="flex flex-col space-y-2 p-4 border-mountain-100 border-b w-full h-1/2">
            <div className="flex justify-between items-center w-full">
              <p className="font-medium">Prompt</p>
              <Button title="Copy" className="bg-mountain-100">
                <IoCopyOutline className="size-5" />
              </Button>
            </div>

            <div className="flex bg-mountain-50 p-2 rounded-lg max-h-full overflow-y-auto text-sm custom-scrollbar">
              {trending[selectedImageIndex]?.prompt}
            </div>
          </div>

          {/* Model & aspect ratio */}
          <div className="flex space-x-4 p-4 w-full">
            {/* Model */}
            <div className="flex flex-col space-y-2 w-1/3">
              <p className="font-medium">Model</p>
              <div className="flex items-center space-x-2">
                {/* Replace example_1 if you have distinct icons per model */}
                <img src={example_1} className="rounded-xs w-5 h-5" />
                <p className="text-mountain-600 line-clamp-1">GPT</p>
              </div>
            </div>

            {/* Aspect ratio */}
            <div className="flex flex-col space-y-2 w-1/3">
              <p className="font-medium">Aspect Ratio</p>
              <div className="flex items-center space-x-2">
                <IoIosSquareOutline className="size-5" />
                <p className="text-mountain-600">
                  {trending[selectedImageIndex]?.aspect_ratio}
                </p>
              </div>
            </div>
          </div>

          {/* Style · Lighting · Camera */}
          <div className="flex justify-between px-4 w-full">
            <div className="flex flex-col space-y-2">
              <p className="font-medium">Style</p>
              <p className="text-mountain-600">
                {trending[selectedImageIndex]?.style}
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="font-medium">Lighting</p>
              <p className="text-mountain-600">
                {trending[selectedImageIndex]?.lighting}
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="font-medium">Camera</p>
              <p className="text-mountain-600">
                {trending[selectedImageIndex]?.camera}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="bottom-0 absolute p-4 w-full">
            <Button
              onClick={handleApplyPrompt}
              className="bg-mountain-100 shadow-sm w-full h-12 font-normal text-mountain-700"
            >
              <LuImagePlus className="mr-2 size-5" />
              <p>Apply This Prompt</p>
            </Button>
          </div>
        </div>
      </div>

      {/* Thumbnail column */}
      <div className="relative flex flex-col rounded-xl w-[10%] h-full overflow-hidden">
        {/* top blur */}

        <div
          className="flex flex-col items-end space-y-2 mt-10 pr-3 w-full h-[2000px]"
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {trending.map((item, index) => (
            <img
              key={index}
              src={item.image}
              onClick={() => handleImageClick(index)}
              className={`rounded-lg object-cover cursor-pointer ${selectedImageIndex === index ? "w-20" : "w-16"
                } min-h-16 max-h-16 transition-all duration-150`}
            />
          ))}
          <div />
        </div>
        {/* bottom blur */}
        <div className="-bottom-2 z-10 absolute flex bg-white/60 blur-sm w-full h-10" />
      </div>
    </div>
  );
};

export default TrendingPrompt;
