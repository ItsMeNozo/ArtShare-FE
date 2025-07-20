import { Button } from '@/components/ui/button';
import AttributeFilters from '@/features/explore/components/AttributeFilters';
import MediumFilters from '@/features/explore/components/MediumFilters';
import { useState } from 'react';
import { BsFilter } from 'react-icons/bs';
import { IoMdArrowDropdown } from 'react-icons/io';
import { TbCategory } from 'react-icons/tb';
import 'react-photo-album/rows.css';
import { PostSearchResultsGallery } from './PostSearchResultsGallery';

interface PostSearchResultsProps {
  finalQuery: string | null;
}

const PostSearchResults = ({ finalQuery }: PostSearchResultsProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMedium, setSelectedMedium] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [isAi, setIsAi] = useState(false);

  return (
    <div className="relative flex h-screen min-h-0 flex-col">
      <div className="dark:from-mountain-1000 to-mountain-50 dark:to-mountain-950 sticky z-10 flex flex-col gap-4 bg-gradient-to-t from-white px-4 py-1 pt-3 dark:bg-gradient-to-t">
        <div className="flex items-center space-x-4">
          <div
            className={`hover:bg-mountain-50 dark:hover:bg-mountain-900 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 ${
              showFilters
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
              <MediumFilters
                selectedMedium={selectedMedium}
                setSelectedMedium={setSelectedMedium}
              >
                {({ onClick }) => (
                  <Button
                    variant="outline"
                    className="dark:bg-mountain-900 hover:bg-mountain-50 dark:hover:bg-mountain-800 border-mountain-200 dark:border-mountain-700 text-mountain-950 dark:text-mountain-200 flex w-auto cursor-pointer items-center justify-center rounded-full border bg-white px-3 py-1"
                    onClick={onClick}
                  >
                    <TbCategory size={16} className="mr-1" />
                    <p className="mr-1">Mediums</p>
                    <IoMdArrowDropdown />
                  </Button>
                )}
              </MediumFilters>
              <AttributeFilters
                selectedAttributes={selectedAttributes}
                setSelectedAttributes={setSelectedAttributes}
                isAi={isAi}
                setIsAi={setIsAi}
              >
                {({ onClick }) => (
                  <Button
                    variant="outline"
                    className="dark:bg-mountain-900 hover:bg-mountain-50 dark:hover:bg-mountain-800 border-mountain-200 dark:border-mountain-700 text-mountain-950 dark:text-mountain-200 flex w-auto cursor-pointer items-center justify-center rounded-full border bg-white px-3 py-1"
                    onClick={onClick}
                  >
                    <TbCategory size={16} className="mr-1" />
                    <p className="mr-1">Attributes</p>
                    <IoMdArrowDropdown />
                  </Button>
                )}
              </AttributeFilters>
            </div>
          )}
        </div>

        {selectedAttributes.length === 0 && !selectedMedium && (
          <div className="flex h-12 w-full items-center justify-center">
            <div className="text-mountain-400 dark:text-mountain-500">
              Tips: Want more specific results? Try adding filters.
            </div>
          </div>
        )}
      </div>

      <PostSearchResultsGallery
        finalQuery={finalQuery}
        selectedMedium={selectedMedium}
        selectedAttributes={selectedAttributes}
        isAi={isAi}
      />
    </div>
  );
};

export default PostSearchResults;
