import PromptResult from "@/features/gen-art/components/PromptResult";
import { HistoryFilter } from "@/features/gen-art/enum";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { CircularProgress } from "@mui/material";
import { Clock } from "lucide-react";

const BrowsePromptHistory = () => {
  const { scrollRef, displayedResults, loading, historyFilter, setHistoryFilter } = usePromptHistory();

  return (
    <div className='flex justify-between flex-1 min-h-0'>

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
              className={`flex p-2 px-4 cursor-pointer transition-colors duration-150
                      ${historyFilter === filter ? 'bg-mountain-100 text-mountain-700 font-medium' : 'hover:bg-mountain-100 text-mountain-600'}`}
            >
              <p className="capitalize">{filter.label}</p>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-start mt-4 w-full h-full">
          <div className='flex items-center space-x-4'>
            <CircularProgress size={32} thickness={4} />
            <p className='text-sm'>Loading...</p>
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className={`flex flex-col flex-1 min-h-0 gap-2 custom-scrollbar my-4 overflow-y-auto`}>
          {displayedResults && displayedResults.length > 0 && (
            displayedResults.map((result, index) => (
              <PromptResult
                key={index}
                result={result}
                useToShare={true}
              />
            ))
          )}
        </div>
      )}
      <div className='bottom-0 z-0 absolute flex bg-white blur-3xl w-full h-20' />
    </div>
  );
}

export default BrowsePromptHistory;
