import { Tooltip } from '@mui/material';
import { InfoIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { AiOutlineSave } from 'react-icons/ai';
import { FaArrowLeftLong, FaEye } from 'react-icons/fa6';
import { MdCheckCircle, MdLockOutline } from 'react-icons/md';

import UserButton from '@/components/header/user-button';
import UserInAppConfigs from '@/components/popovers/UserInAppConfigs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  isTitleLoading?: boolean;
  isPublishDisabled?: boolean;
  isTitleEmpty?: boolean;
  hasContent?: boolean;
}

const TITLE_WIDTH_CONFIG = {
  base: 300,
  max: 600,
  charMultiplier: 8,
  baseCharCount: 36,
} as const;

const COMMON_BUTTON_CLASSES = {
  iconButton:
    'h-9 w-9 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  primaryButton:
    'flex h-9 items-center gap-2 rounded-full font-medium text-white shadow transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50',
} as const;

const TextEditorHeader = memo<TextEditorHeaderProps>(
  ({
    handleExport,
    handleSaveBlog,
    text,
    setText,
    isPublished,
    tooltipOpen,
    saveStatus,
    isTitleLoading,
    isPublishDisabled,
    isTitleEmpty,
    hasContent = false,
  }) => {
    const { user, loading } = useUser();
    const navigate = useNavigate();
    const { blogId } = useParams<{ blogId: string }>();

    const isNewDocument = blogId === 'new';

    const dynamicWidth = useMemo(() => {
      const { base, max, charMultiplier, baseCharCount } = TITLE_WIDTH_CONFIG;
      return Math.min(
        base + Math.max(0, (text.length - baseCharCount) * charMultiplier),
        max,
      );
    }, [text.length]);

    const handlePreview = () => {
      if (blogId && !isNewDocument) {
        navigate(`/blogs/${blogId}`);
      }
    };

    const getShareButtonContent = () => {
      if (tooltipOpen && isPublished) {
        return (
          <>
            <span>Link copied!</span>
            <MdCheckCircle />
          </>
        );
      }
      return (
        <>
          <MdLockOutline />
          <span>Share blog</span>
        </>
      );
    };

    const getShareDisableReason = () => {
      if (!isPublished) return 'Document must be published first to share';
      return '';
    };

    const getPublishDisableReason = () => {
      if (isTitleEmpty && !hasContent) {
        return 'Add a title and content to publish';
      }
      if (isTitleEmpty) {
        return 'Add a title to publish';
      }
      if (!hasContent) {
        return 'Add content to publish';
      }
      return '';
    };

    return (
      <nav className="dark:from-mountain-900 dark:via-mountain-800 dark:to-mountain-900 border-b-mountain-100 dark:border-b-mountain-700 sticky top-0 z-50 flex h-16 w-full items-center justify-between gap-4 border-b-1 bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-50 px-4 dark:bg-gradient-to-r">
        {/* Left Section */}
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
            <Tooltip title="Share your experience through characters, paragraphs...">
              <InfoIcon className="text-mountain-600 dark:text-mountain-300 size-4" />
            </Tooltip>
          </div>
        </div>

        {/* Center Section */}
        <div className="flex flex-grow items-center justify-center gap-4">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: `${dynamicWidth}px` }}
            className={`dark:bg-mountain-800/80 dark:border-mountain-600 placeholder:text-mountain-600 dark:placeholder:text-mountain-400 h-12 flex-shrink rounded-full border border-gray-200 bg-white/60 px-4 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
              isTitleEmpty
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-gray-900 dark:text-gray-100'
            }`}
            placeholder="Name Your Document Here..."
            disabled={isTitleLoading}
          />
          {saveStatus && <div className="flex-shrink-0">{saveStatus}</div>}
        </div>

        {/* Right Section */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <Tooltip
            title={
              isNewDocument ? 'Save document first to preview' : 'Preview blog'
            }
          >
            <div>
              <Button
                onClick={handlePreview}
                variant="outline"
                size="icon"
                disabled={isNewDocument}
                className={`dark:bg-mountain-700/80 dark:hover:bg-mountain-600/90 dark:border-mountain-600 border-gray-300 bg-white/60 hover:bg-white/90 ${COMMON_BUTTON_CLASSES.iconButton}`}
              >
                <FaEye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </Button>
            </div>
          </Tooltip>

          <Tooltip title={getPublishDisableReason()}>
            <div>
              <Button
                onClick={() => handleSaveBlog(text)}
                disabled={isPublishDisabled}
                className={`${COMMON_BUTTON_CLASSES.primaryButton} border border-emerald-700 bg-green-600 px-4 hover:bg-green-700 dark:border-emerald-800 dark:bg-green-700 dark:hover:bg-green-800`}
              >
                <AiOutlineSave className="h-4 w-4" />
                <span className="whitespace-nowrap">
                  {isPublished ? 'Save and publish' : 'Publish'}
                </span>
              </Button>
            </div>
          </Tooltip>

          <Tooltip title={getShareDisableReason()}>
            <div>
              <Button
                type="submit"
                onClick={handleExport}
                disabled={!isPublished}
                className={`border-mountain-400 w-36 justify-center border bg-indigo-400 hover:bg-indigo-500 dark:border-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 ${COMMON_BUTTON_CLASSES.primaryButton}`}
              >
                {getShareButtonContent()}
              </Button>
            </div>
          </Tooltip>

          <div className="flex items-center">
            <UserButton user={user!} loading={loading!} />
            <UserInAppConfigs />
          </div>
        </div>
      </nav>
    );
  },
);

TextEditorHeader.displayName = 'TextEditorHeader';

export default TextEditorHeader;
