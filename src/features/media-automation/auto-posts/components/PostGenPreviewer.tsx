import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const PostViewer = ({ content }: { content: string }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        editable: false,
    });

    useEffect(() => {
        if (editor && content) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) return <p>Loading post...</p>;

    return <EditorContent editor={editor} />;
};

export default PostViewer;
