//Core
import { useEffect, useRef, useState } from 'react';

//Components
import { Button, CircularProgress, TextareaAutosize } from '@mui/material';
import AIBot from './components/AI/AIBot';
import PromptResult from './components/PromptResult';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';

//Icons
import { BiInfoCircle } from 'react-icons/bi';

//Css files
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

//Mock/Enum
import {
  aspectOptions,
  cameraOptions,
  lightingOptions,
  ModelKey,
} from "./enum";
import { MockModelOptionsData } from "./data/Data";

//API Backend
import {
  BackendErrorResponse,
  DEFAULT_ERROR_MSG,
} from '@/api/types/error-response.type';
import AIHeader from '@/features/gen-art/components/AIHeader';
import { usePromptHistory } from '@/hooks/usePromptHistory';
import { useScrollBottom } from '@/hooks/useScrollBottom';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useSubscriptionInfo } from '@/hooks/useSubscription';
import { useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useLocation } from 'react-router-dom';
import { generateImages } from './api/generate-imges.api';
import { buildTempPromptResult } from './helper/image-gen.helper';

{
  /*
A stunning realistic scene featuring a woman astronaut curiously peeking out of 
her dormitory window aboard a futuristic space station, overlooking the breathtaking 
view of Earth below. The setting showcases a vibrant blue planet adorned with swirling 
clouds and continents. Surrounding the space station are sleek construction drones actively 
working, along with various spacecraft gliding gracefully through the cosmos. 
The artwork is richly detailed and realistic, inspired by the visionary style of Syd Mead, 
capturing the intricate design of the space station and the dynamic activity in orbit, 
with stars twinkling in the background creating a sense of vastness in space.
*/
}

const PAGE_SIZE = 5;

const ArtGenAI = () => {
  const { showSnackbar } = useSnackbar();
  const [expanded, setExpanded] = useState<boolean>(true);
  const [promptExpanded, setPromptExpanded] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const location = useLocation();
  //Setting Panel
  const [modelKey, setModelKey] = useState<ModelKey>(ModelKey.GPT_IMAGE_1);
  const [style, setStyle] = useState<StyleOption>(MockModelOptionsData[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectOption>(
    aspectOptions[0],
  );
  const [lighting, setLighting] = useState<LightingOption>(lightingOptions[0]);
  const [camera, setCamera] = useState<CameraOption>(cameraOptions[0]);
  const [numberOfImages, setNumberOfImages] = useState<number>(1);

  // Subscription
  const queryClient = useQueryClient();
  const { data: subscriptionInfo } = useSubscriptionInfo();

  // Prompt History results and filtering management
  const { scrollRef, displayedResults, setDisplayedResults, loading } =
    usePromptHistory();
  useScrollBottom(scrollRef, [scrollTrigger], 200);

  useEffect(() => {
    if (!location.state) return;
    const { prompt, modelKey, aspectRatio, lighting, camera, style } =
      location.state;

    if (prompt) setUserPrompt(prompt);

    // modelKey is enum – keep your existing default if parsing fails
    if (modelKey && Object.values(ModelKey).includes(modelKey))
      setModelKey(modelKey as ModelKey);

    // helper to look up option objects by value
    const findOpt = <T extends { value: string }>(arr: T[], v?: string) =>
      arr.find((o) => o.value === v) ?? arr[0];

    setAspectRatio(findOpt(aspectOptions, aspectRatio));
    setLighting(findOpt(lightingOptions, lighting));
    setCamera(findOpt(cameraOptions, camera));

    // style list = array of { name: "anime", … }
    const styleOpt =
      MockModelOptionsData.find(
        (o) => o.name.toLowerCase() === (style ?? '').toLowerCase(),
      ) ?? MockModelOptionsData[0];
    setStyle(styleOpt);
  }, [location.state]);
  const placeholderIdRef = useRef<number>(-1);

  const handleGenerate = async () => {
    if (!userPrompt.trim()) return;
    if (subscriptionInfo?.aiCreditRemaining === 0) {
      showSnackbar(
        'You’ve run out of AI credits. Upgrade your plan or come back later.',
        'warning',
      );
      return;
    }

    const promptText = userPrompt.trim();

    const placeholder: PromptResult = {
      ...buildTempPromptResult(promptText, numberOfImages),
      id: placeholderIdRef.current--,
      generating: true,
    };

    setDisplayedResults((prev) => [...prev, placeholder].slice(-PAGE_SIZE));
    setUserPrompt('');
    setScrollTrigger((prev) => prev + 1);

    try {
      const newPromptResult = await generateImages({
        prompt: promptText,
        modelKey,
        style: style.name.toLowerCase(),
        n: numberOfImages,
        aspectRatio: aspectRatio.value,
        lighting: lighting.value,
        camera: camera.value,
      });

      setDisplayedResults((prev) =>
        prev.map((r) => (r.id === placeholder.id ? newPromptResult : r)),
      );
      setScrollTrigger((prev) => prev + 1);
    } catch (e) {
      // Remove the placeholder result
      setDisplayedResults((prev) =>
        prev.filter((r) => r.id !== placeholder.id),
      );
      const msg = axios.isAxiosError(e)
        ? ((e as AxiosError<BackendErrorResponse>).response?.data?.message ??
          DEFAULT_ERROR_MSG)
        : DEFAULT_ERROR_MSG;

      showSnackbar(msg, 'error');
      console.error('Image generation failed:', e);
    } finally {
      queryClient.invalidateQueries({ queryKey: ['subscriptionInfo'] });
    }
  };

  const handlePrompt = () => {
    setPromptExpanded(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0); // ensures it's after expansion
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setPromptExpanded(false);
      }
    };
    if (promptExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [promptExpanded]);

  return (
    <div className="flex pr-0 w-full h-screen">
      <div className='absolute flex p-2 h-full'>
        <SettingsPanel
          isExpanded={expanded}
          setIsExpanded={setExpanded}
          numberOfImages={numberOfImages}
          setNumberOfImages={setNumberOfImages}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          lighting={lighting}
          setLighting={setLighting}
          camera={camera}
          setCamera={setCamera}
          style={style}
          setStyle={setStyle}
        />
      </div>
      <div className="flex flex-col w-full h-full">
        <div className="flex flex-col items-end border-mountain-200 border-b-1">
          <AIHeader />
        </div>
        <div className="relative flex justify-end bg-gradient-to-b from-mountain-50 to-white w-full h-full">
          <div
            className={`custom-scrollbar relative flex h-full flex-col ${expanded ? 'w-[calc(100vw-18rem)]' : 'w-full delay-300'} items-start transition-all duration-200 ease-in-out`}
          >
            {loading ? (
              <div className="flex justify-center items-start mt-4 w-full h-full">
                <div className="flex items-center space-x-4">
                  <CircularProgress size={32} thickness={4} />
                </div>
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="flex flex-col space-y-10 p-4 w-full h-full overflow-y-auto custom-scrollbar"
              >
                {displayedResults && displayedResults.length > 0 ? (
                  displayedResults.map((result) => (
                    <PromptResult key={result.id} result={result} />
                  ))
                ) : (
                  <div className="flex justify-center items-center w-full h-full text-mountain-600">
                    <BiInfoCircle className="mr-2 size-5" />
                    <p className="">
                      There is no prompt result. What's on your mind?
                    </p>
                  </div>
                )}
                <div className="flex flex-col space-y-2">
                  <div className="flex h-64" />
                </div>
              </div>
            )}
          </div>
          <div className="bottom-0 z-0 absolute flex bg-white blur-3xl w-full h-40" />
        </div>
        {/* Prompt Chat */}
        <div
          className={`absolute bottom-4 left-1/2 z-50 flex transform items-end duration-300 ease-in-out ${expanded ? '-translate-x-1/4' : '-translate-x-1/2 delay-300'}`}
        >
          <div
            className={`flex flex-col border bg-white ${promptExpanded ? 'border-indigo-600 shadow-lg' : 'border-mountain-300 shadow-md'} relative w-[720px] rounded-xl`}
          >
            <div
              className={`flex w-[718px] transform overflow-hidden rounded-xl rounded-b-none border-0 bg-white transition-all duration-400 ease-in-out ${promptExpanded ? 'h-24 scale-y-100 py-2 opacity-100' : 'h-0 opacity-0'} overflow-y-auto`}
            >
              <TextareaAutosize
                value={userPrompt}
                ref={textareaRef}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="What do you imagine about?"
                className={`custom-scrollbar placeholder:text-mountain-400 flex h-full w-full resize-none overflow-y-auto rounded-xl rounded-b-none bg-white p-2 text-sm outline-none focus:border-transparent focus:ring-0 focus:outline-none`}
              />
            </div>
            <div
              onClick={() => handlePrompt()}
              className={`${promptExpanded && 'pointer-events-none rounded-t-none'
                } line-clamp-1 flex h-15 w-[718px] items-center overflow-y-auto rounded-xl bg-white px-2 py-4 text-sm hover:cursor-pointer`}
            >
              {userPrompt ? (
                <p
                  className={`line-clamp-1 pr-26 ${promptExpanded && 'hidden'}`}
                >
                  {userPrompt}
                </p>
              ) : (
                <p
                  className={`text-mountain-400 pr-26 ${promptExpanded && 'hidden'}`}
                >
                  What do you imagine about?
                </p>
              )}
            </div>
            <Button
              onClick={handleGenerate}
              className="right-4 -bottom-2 absolute flex items-center bg-indigo-100 px-4 -translate-y-1/2"
            >
              Generate
            </Button>
          </div>
          <AIBot />
        </div>
      </div>
    </div>
  );
};

export default ArtGenAI;
