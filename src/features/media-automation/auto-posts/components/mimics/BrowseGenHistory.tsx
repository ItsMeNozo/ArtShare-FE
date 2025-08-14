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
    totalFilteredCount,
  } = usePromptHistory();

  return (
    <div className="flex min-h-0 flex-1 justify-between">
      <div className="bg-mountain-50 border-mountain-200 m-4 flex w-[220px] min-w-[220px] flex-col rounded-md border">
        <div className="border-mountain-200 flex h-12 w-full items-center justify-center border-b-1">
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
        <div className="mt-4 flex h-full w-full items-start justify-center">
          <div className="flex items-center space-x-4">
            <CircularProgress size={32} thickness={4} />
            <p className="text-sm">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Header with count information */}
          <div className="border-mountain-200 flex items-center justify-between border-b p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="size-5 text-purple-500" />
              <div>
                <h2 className="text-mountain-800 text-lg font-semibold">
                  Post With Your AI Images
                </h2>
                <p className="text-mountain-600 text-sm">
                  You have {totalFilteredCount} previous{' '}
                  {totalFilteredCount === 1 ? 'chat' : 'chats'} with ArtNova.
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
      <div className="absolute bottom-0 z-0 flex h-20 w-full bg-white blur-3xl" />
    </div>
  );
};

export default BrowseGenHistory;
