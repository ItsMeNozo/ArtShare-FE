import { Button } from '@/components/ui/button';
import AttributeFilters from '@/features/explore/components/AttributeFilters';
import MediumFilters from '@/features/explore/components/MediumFilters';
import { useState } from 'react';
import { BsFilter } from 'react-icons/bs';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { TbCategory } from 'react-icons/tb';
import 'react-photo-album/rows.css';
import { PostSearchResultsGallery } from './PostSearchResultsGallery';

interface PostSearchResultsProps {
  finalQuery: string | null;
}

const PostSearchResults = ({ finalQuery }: PostSearchResultsProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(
    null,
  );
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);
  const [isAi, setIsAi] = useState(false);
  const [isAttributeOpen, setIsAttributeOpen] = useState(false);
  const [isMediumOpen, setIsMediumOpen] = useState(false);

  return (
    <div className="relative flex flex-col h-screen min-h-0 overflow-y-auto">
      <div className="z-10 sticky flex flex-col gap-4 dark:bg-gradient-to-t dark:from-mountain-1000 dark:to-mountain-950 px-4 py-1 pt-3">
        <div className="relative flex items-center space-x-4 w-full h-12">
          <div
            className={`hover:bg-mountain-50 dark:hover:bg-mountain-900 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 ${showFilters
              ? 'text-mountain-950 dark:text-mountain-50 font-medium'
              : 'text-mountain-600 dark:text-mountain-400 font-normal'
              }`}
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <BsFilter size={16} />
            <p>Filter</p>
          </div>
          {showFilters && (
            <div className="flex gap-2">
              <AttributeFilters
                selectedAttribute={selectedAttribute}
                setSelectedAttribute={setSelectedAttribute}
                onOpenChange={setIsAttributeOpen}
              >
                {({ onClick }) => (
                  <Button
                    variant="outline"
                    className="flex justify-center items-center bg-white hover:bg-mountain-50 dark:bg-mountain-900 dark:hover:bg-mountain-800 px-3 py-1 border border-mountain-200 dark:border-mountain-700 rounded-full w-auto text-mountain-950 dark:text-mountain-200 cursor-pointer"
                    onClick={onClick}
                  >
                    <TbCategory size={16} className="mr-1" />
                    <p className="mr-1">Attributes</p>
                    {isAttributeOpen ? (
                      <IoMdArrowDropup />
                    ) : (
                      <IoMdArrowDropdown />
                    )}
                  </Button>
                )}
              </AttributeFilters>
              <MediumFilters
                selectedMediums={selectedMediums}
                setSelectedMediums={setSelectedMediums}
                isAi={isAi}
                setIsAi={setIsAi}
                onOpenChange={setIsMediumOpen}
              >
                {({ onClick }) => (
                  <Button
                    variant="outline"
                    className="flex justify-center items-center bg-white hover:bg-mountain-50 dark:bg-mountain-900 dark:hover:bg-mountain-800 px-3 py-1 border border-mountain-200 dark:border-mountain-700 rounded-full w-auto text-mountain-950 dark:text-mountain-200 cursor-pointer"
                    onClick={onClick}
                  >
                    <TbCategory size={16} className="mr-1" />
                    <p className="mr-1">Mediums</p>
                    {isMediumOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
                  </Button>
                )}
              </MediumFilters>
            </div>
          )}
          {selectedMediums.length === 0 && !selectedAttribute && (
            <div className="top-1/2 left-1/2 absolute flex -translate-x-1/2 -translate-y-1/2">
              <div className="text-mountain-400 dark:text-mountain-500">
                Tips: Want more specific results? Try adding filters.
              </div>
            </div>
          )}
        </div>
      </div>

      <PostSearchResultsGallery
        finalQuery={finalQuery}
        selectedAttribute={selectedAttribute}
        selectedMediums={selectedMediums}
        isAi={isAi}
      />
    </div>
  );
};

export default PostSearchResults;
