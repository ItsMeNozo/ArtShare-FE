import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { X } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';

interface CategoryListProps {
  selectedCategories: string[];
  setSelectedCategories: Dispatch<SetStateAction<string[]>>;
}

const CategoryList: React.FC<CategoryListProps> = ({
  selectedCategories,
  setSelectedCategories,
}) => {
  const maxVisible = 5;
  const visibleCategories = selectedCategories.slice(0, maxVisible);
  const hiddenCategories = selectedCategories.slice(maxVisible);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center">
      {visibleCategories.map((cate, index) => (
        <div
          key={index}
          className="mx-1 flex h-10 items-center justify-center rounded-lg bg-white px-4 shadow"
        >
          <p className="mr-2 line-clamp-1 text-sm">{cate}</p>
          <X
            className="text-mountain-400 size-4 cursor-pointer hover:text-red-600"
            onClick={() =>
              setSelectedCategories((prev) => prev.filter((c) => c !== cate))
            }
          />
        </div>
      ))}

      {hiddenCategories.length > 0 && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div
              className="border-mountain-200 mx-1 flex h-10 cursor-pointer items-center rounded-lg border bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-1 text-sm shadow"
              onMouseEnter={() => setIsOpen(true)}
            >
              + {hiddenCategories.length} categories
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            className="mt-1 flex w-48 flex-col border-none p-0 py-2"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {hiddenCategories.map((cate, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded px-2 py-1 hover:bg-gray-100"
              >
                <p className="mr-2 text-sm">{cate}</p>
                <X
                  className="text-mountain-400 size-4 cursor-pointer hover:text-red-600"
                  onClick={() =>
                    setSelectedCategories((prev) =>
                      prev.filter((c) => c !== cate),
                    )
                  }
                />
              </div>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default CategoryList;
