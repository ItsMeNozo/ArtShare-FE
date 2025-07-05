//Icons
import { Tooltip } from '@mui/material';
import { InfoIcon } from 'lucide-react';
import { AiOutlineSave } from 'react-icons/ai';
import { FaArrowLeftLong, FaEye } from 'react-icons/fa6';
import { MdCheckCircle, MdLockOutline } from 'react-icons/md';
//Components
import UserButton from '@/components/header/user-button';
import UserInAppConfigs from '@/components/popovers/UserInAppConfigs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
//Context
import { useUser } from '@/contexts/user';
import { Link, useNavigate, useParams } from 'react-router-dom';

interface TextEditorHeaderProps {
  handleExport: () => void;
  handleSaveBlog: (blogName: string) => void;
  text: string;
  setText: (text: string) => void;
  isPublished: boolean;
  tooltipOpen: boolean;
  saveStatus?: React.ReactNode;
}

const TextEditorHeader: React.FC<TextEditorHeaderProps> = ({
  handleExport,
  handleSaveBlog,
  text,
  setText,
  isPublished,
  tooltipOpen,
  saveStatus,
}) => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const { blogId } = useParams<{ blogId: string }>();

  const baseWidth = 300;
  const maxWidth = 600;

  const dynamicWidth = Math.min(
    baseWidth + Math.max(0, (text.length - 36) * 8),
    maxWidth,
  );

  const handlePreview = () => {
    if (blogId && blogId !== 'new') {
      navigate(`/blogs/${blogId}`);
    }
  };

  return (
    <nav
      className={`dark:from-mountain-900 dark:via-mountain-800 dark:to-mountain-900 border-b-mountain-100 dark:border-b-mountain-700 sticky top-0 z-50 flex h-16 w-full items-center justify-between gap-4 border-b-1 bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-50 px-4 dark:bg-gradient-to-r`}
    >
      {/* ===== Left Section ===== */}
      <div className="flex flex-shrink-0 items-center gap-4">
        <Link
          to="/docs"
          className="hover:bg-mountain-50 dark:hover:bg-mountain-700 flex items-center justify-center rounded-lg p-2 transition-colors"
        >
          <FaArrowLeftLong className="text-mountain-600 dark:text-mountain-300 size-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">
            My Writing
          </span>
          <Tooltip
            title={'Share your experience through characters, paragraphs...'}
          >
            <InfoIcon className="text-mountain-600 dark:text-mountain-300 size-4" />
          </Tooltip>
        </div>
      </div>

      {/* ===== Center Section ===== */}
      <div className="flex flex-grow items-center justify-center gap-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: `${dynamicWidth}px` }}
          className="dark:bg-mountain-800/80 dark:border-mountain-600 placeholder:text-mountain-600 dark:placeholder:text-mountain-400 h-12 flex-shrink rounded-full border border-gray-200 bg-white/60 px-4 text-gray-900 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 dark:text-gray-100 dark:focus:ring-blue-400"
          placeholder="Name Your Document Here..."
        />
        {saveStatus && <div className="flex-shrink-0">{saveStatus}</div>}
      </div>

      {/* ===== Right Section ===== */}
      <div className="flex flex-shrink-0 items-center gap-2">
        <Tooltip
          title={
            blogId === 'new' ? 'Save document first to preview' : 'Preview blog'
          }
        >
          <div>
            <Button
              onClick={handlePreview}
              variant="outline"
              size="icon"
              disabled={blogId === 'new'}
              className="dark:bg-mountain-700/80 dark:hover:bg-mountain-600/90 dark:border-mountain-600 h-9 w-9 rounded-full border-gray-300 bg-white/60 transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaEye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>
        </Tooltip>

        <Button
          onClick={() => handleSaveBlog(text)}
          className="flex h-9 items-center gap-2 rounded-full border border-emerald-700 bg-green-600 px-4 font-medium text-white shadow transition-colors hover:bg-green-700 hover:brightness-95 dark:border-emerald-800 dark:bg-green-700 dark:hover:bg-green-800"
        >
          <AiOutlineSave className="h-4 w-4" />
          <span className="whitespace-nowrap">
            {isPublished ? 'Save and publish' : 'Publish'}
          </span>
        </Button>

        <Button
          type="submit"
          onClick={handleExport}
          disabled={!isPublished}
          className="border-mountain-400 flex h-9 w-36 items-center justify-center gap-2 rounded-full border bg-indigo-400 font-medium text-white shadow transition-colors hover:bg-indigo-500 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
        >
          {tooltipOpen && isPublished ? (
            <>
              <span>Link copied!</span>
              <MdCheckCircle />
            </>
          ) : (
            <>
              <MdLockOutline />
              <span>Share blog</span>
            </>
          )}
        </Button>

        <div className="flex items-center">
          <UserButton user={user!} loading={loading!} />
          <UserInAppConfigs />
        </div>
      </div>
    </nav>
  );
};

export default TextEditorHeader;
