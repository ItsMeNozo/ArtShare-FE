import { Box } from '@mui/material';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { MAX_WORDS } from '../../constants';

interface PostContentEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  canEdit: boolean;
}

const PostContentEditor = ({
  value,
  onChange,
  canEdit,
}: PostContentEditorProps) => {
  const editor = useEditor({
    editable: canEdit,
    extensions: [
      StarterKit,
      Underline,
      CharacterCount.configure({
        wordCounter: (text) =>
          text.split(/\s+/).filter((word) => word !== '').length,
        limit: MAX_WORDS,
      }),
      Placeholder.configure({
        placeholder: 'Write something about this post...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none flex flex-col overflow-x-hidden cursor-text',
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <Box
      className={`border-mountain-200 relative flex h-[520px] w-full flex-col border bg-white shadow-md ${!canEdit ? 'cursor-not-allowed bg-gray-50' : ''} `}
    >
      <div className="border-mountain-200 flex h-12 shrink-0 items-center gap-2 rounded-t-md border-b bg-white px-4">
        {editor && (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-mountain-600 text-sm">
                Tips: Click on text editor to start editing
              </span>
            </div>
            <div
              className={`text-mountain-600 character-count flex transform rounded-md bg-white p-2 text-xs opacity-50 duration-300 ease-in-out select-none hover:z-50 hover:opacity-100 ${editor.storage.characterCount.words() >= MAX_WORDS ? 'text-red-500' : ''}`}
            >
              {editor.storage.characterCount.words()} / {MAX_WORDS} words
            </div>
          </div>
        )}
      </div>
      {editor ? (
        <div className="custom-scrollbar h-full w-full overflow-auto p-4 text-left">
          <EditorContent editor={editor} />
        </div>
      ) : (
        <p>Loading editor...</p>
      )}
    </Box>
  );
};

export default PostContentEditor;
