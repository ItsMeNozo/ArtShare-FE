import { HistoryFilter } from '@/features/gen-art/enum';
import { usePromptHistory } from '@/hooks/usePromptHistory';
import { CircularProgress } from '@mui/material';
import { Clock, Sparkles } from 'lucide-react';
import PromptResultForAutoPost from './PromptResultForAutoPost';

const BrowseGenHistory = () => {
  const {
    scrollRef,
    displayedResults,
    loading,
    historyFilter,
    setHistoryFilter,
  } = usePromptHistory();

  return (
    <div className="flex flex-1 justify-between min-h-0">
      <div className="flex flex-col bg-mountain-50 m-4 border border-mountain-200 rounded-md w-[220px] min-w-[220px]">
        <div className="flex justify-center items-center border-mountain-200 border-b-1 w-full h-12">
          <Clock className="mr-2 size-4" />
          <p>Prompt History</p>
        </div>
        <div className="flex flex-col justify-center">
          {Object.values(HistoryFilter).map((filter, index) => (
            <div
              key={index}
              onClick={() => setHistoryFilter(filter)}
              className={`flex cursor-pointer p-2 px-4 transition-colors duration-150 ${historyFilter === filter ? 'bg-mountain-100 text-mountain-700 font-medium' : 'hover:bg-mountain-100 text-mountain-600'}`}
            >
              <p className="capitalize">{filter.label}</p>
            </div>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-start mt-4 w-full h-full">
          <div className="flex items-center space-x-4">
            <CircularProgress size={32} thickness={4} />
            <p className="text-sm">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header with count information */}
          <div className="flex justify-between items-center p-4 border-mountain-200 border-b">
            <div className="flex items-center space-x-2">
              <Sparkles className="size-5 text-purple-500" />
              <div>
                <h2 className="font-semibold text-mountain-800 text-lg">
                  Post With Your AI Images
                </h2>
                <p className="text-mountain-600 text-sm">
                  You have {displayedResults.length} previous{' '}
                  {displayedResults.length === 1 ? 'chat' : 'chats'} with
                  ArtNova.
                </p>
              </div>
            </div>
          </div>

          {/* Prompt results */}
          <div
            ref={scrollRef}
            className={`custom-scrollbar my-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto`}
          >
            {displayedResults &&
              displayedResults.length > 0 &&
              displayedResults.map((result, index) => (
                <PromptResultForAutoPost
                  key={index}
                  result={result}
                  useToShare={true}
                />
              ))}
          </div>
        </div>
      )}
      <div className="bottom-0 z-0 absolute flex bg-white blur-3xl w-full h-20" />
    </div>
  );
};

export default BrowseGenHistory;
