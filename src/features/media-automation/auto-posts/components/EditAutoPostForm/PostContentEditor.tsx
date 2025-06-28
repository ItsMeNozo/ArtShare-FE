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
}

const PostContentEditor = ({ value, onChange }: PostContentEditorProps) => {
  const editor = useEditor({
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

  // 4. CRITICAL: This effect syncs the editor if the `value` prop changes from the outside
  // (e.g., form reset, async data load).
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, false); // `false` prevents an infinite loop
    }
  }, [value, editor]);

  return (
    <Box
      className={
        'border-mountain-200 relative flex h-[520px] w-xl flex-col border bg-white shadow-md'
      }
    >
      <div className="border-mountain-200 flex h-12 shrink-0 items-center gap-2 rounded-t-md border-b bg-white px-2">
        {editor && (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button" // Add type="button" to prevent form submission
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`border-mountain-200 rounded border px-2 py-1 text-sm font-bold shadow ${editor.isActive('bold') ? 'bg-indigo-100' : ''}`}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`border-mountain-200 rounded border px-2 py-1 text-sm italic shadow ${editor.isActive('italic') ? 'bg-indigo-100' : ''}`}
              >
                I
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`border-mountain-200 rounded border px-2 py-1 text-sm underline shadow ${editor.isActive('underline') ? 'bg-indigo-100' : ''}`}
              >
                U
              </button>
              <button
                type="button"
                className="hover:bg-mountain-50/60 border-mountain-200 cursor-pointer rounded-sm border px-2 py-1 text-sm shadow"
              >
                <p>
                  😀<span>Emoji</span>
                </p>
              </button>
            </div>
            <div
              // FIX: Using MAX_WORDS for the warning check
              className={`text-mountain-600 character-count flex transform rounded-md bg-white p-2 text-xs opacity-50 duration-300 ease-in-out select-none hover:z-50 hover:opacity-100 ${editor.storage.characterCount.words() >= MAX_WORDS ? 'text-red-500' : ''}`}
            >
              {editor.storage.characterCount.words()} / {MAX_WORDS} words
            </div>
          </div>
        )}
      </div>
      {editor ? (
        <div className="custom-scrollbar h-full w-xl overflow-auto p-4 text-left">
          <EditorContent editor={editor} />
        </div>
      ) : (
        <p>Loading editor...</p>
      )}
    </Box>
  );
};

export default PostContentEditor;
