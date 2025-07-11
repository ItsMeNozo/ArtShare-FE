import { Category } from '@/types/category';

interface PostTagsProps {
  categories?: Category[];
}

const PostTags: React.FC<PostTagsProps> = ({ categories = [] }) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white px-4 py-6">
      <div className="text-xl font-bold">Categories</div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-mountain-50 rounded px-2 py-1 text-xs"
          >
            {category.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostTags;
