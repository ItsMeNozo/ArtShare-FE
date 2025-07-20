import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Color from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import FontFamily from '@tiptap/extension-font-family';
import Gapcursor from '@tiptap/extension-gapcursor';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import History from '@tiptap/extension-history';
import Image from '@tiptap/extension-image';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Text from '@tiptap/extension-text';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import {
  Mark,
  MarkType,
  Node as ProseMirrorNode,
  ResolvedPos,
} from '@tiptap/pm/model';
import { EditorView } from '@tiptap/pm/view';
import { EditorContent, useEditor } from '@tiptap/react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import ImageResize from 'tiptap-extension-resize-image';
import { FontSizeExtension } from '../extensions/font-size';
import { LineHeightExtension } from '../extensions/line-height';
import { useEditorStore } from '../stores/use-editor-store';
import './Editor.css';

interface EditorProps {
  onChange?: () => void;
}

export type EditorHandle = {
  getContent: () => string | undefined;
  setContent: (content: string) => void;
  getImages: () => { src: string; alt?: string; title?: string }[];
  focus: () => void;
};

// Custom Image Extension with better attribute persistence
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute('height'),
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
      'data-align': {
        default: null,
        parseHTML: (element) => element.getAttribute('data-align'),
        renderHTML: (attributes) => {
          if (!attributes['data-align']) return {};
          return { 'data-align': attributes['data-align'] };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          const img = element as HTMLImageElement;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
            style: img.getAttribute('style'),
            'data-align': img.getAttribute('data-align'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes];
  },
});

// ...existing helper functions remain the same...
const getMarkRange = ($pos?: ResolvedPos, type?: MarkType) => {
  if (!$pos || !type) {
    return false;
  }

  const nodeBefore = $pos.nodeBefore;
  const nodeAfter = $pos.nodeAfter;
  let targetNode: ProseMirrorNode | null | undefined = null;
  let targetNodePos = -1;

  if ($pos.parent.isTextblock && $pos.depth > 0) {
    if ($pos.textOffset > 0) {
      targetNode = $pos.parent.child($pos.index());
      targetNodePos =
        $pos.start() + $pos.parent.child($pos.index()).attrs.offset;
      targetNodePos = $pos.pos - $pos.textOffset;
    } else if ($pos.index() > 0 && $pos.parent.child($pos.index() - 1).isText) {
      targetNode = $pos.parent.child($pos.index() - 1);
      targetNodePos = $pos.pos - targetNode.nodeSize;
    } else if ($pos.parent.child($pos.index()).isText) {
      targetNode = $pos.parent.child($pos.index());
      targetNodePos = $pos.pos;
    }
  }

  if (!targetNode) {
    if (nodeBefore && nodeBefore.isText) {
      targetNode = nodeBefore;
      targetNodePos = $pos.pos - nodeBefore.nodeSize;
    } else if (nodeAfter && nodeAfter.isText) {
      targetNode = nodeAfter;
      targetNodePos = $pos.pos;
    }
  }

  if (!targetNode || !targetNode.isText) {
    const marksAtPos = $pos.marks();
    const markAtCursor = marksAtPos.find((m) => m.type === type);
    if (markAtCursor) {
      let from = $pos.pos;
      let to = $pos.pos;
      if (
        $pos.nodeAfter &&
        $pos.nodeAfter.isText &&
        markAtCursor.isInSet($pos.nodeAfter.marks)
      ) {
        to = $pos.pos + $pos.nodeAfter.nodeSize;
      } else if (
        $pos.nodeBefore &&
        $pos.nodeBefore.isText &&
        markAtCursor.isInSet($pos.nodeBefore.marks)
      ) {
        from = $pos.pos - $pos.nodeBefore.nodeSize;
      } else {
        const textNode =
          $pos.textOffset > 0
            ? $pos.parent.child($pos.index())
            : $pos.nodeAfter;
        if (textNode && textNode.isText) {
          from = $pos.pos - $pos.textOffset;
          to = from + textNode.nodeSize;
        } else {
          return false;
        }
      }
      return { from, to, mark: markAtCursor };
    }
    return false;
  }

  const mark = targetNode.marks.find((m) => m.type === type);
  if (!mark) {
    return false;
  }

  const currentPos = targetNodePos;
  let from = currentPos;
  let to = currentPos + targetNode.nodeSize;

  let currentIndex = $pos.parent.childCount;
  for (let i = 0; i < $pos.parent.childCount; i++) {
    if ($pos.parent.child(i) === targetNode) {
      currentIndex = i;
      break;
    }
  }

  while (currentIndex > 0) {
    const prevNode = $pos.parent.child(currentIndex - 1);
    if (prevNode.isText && mark.isInSet(prevNode.marks)) {
      from -= prevNode.nodeSize;
      currentIndex--;
    } else {
      break;
    }
  }

  for (let i = 0; i < $pos.parent.childCount; i++) {
    if ($pos.parent.child(i) === targetNode) {
      currentIndex = i;
      break;
    }
  }

  while (currentIndex < $pos.parent.childCount - 1) {
    const nextNode = $pos.parent.child(currentIndex + 1);
    if (nextNode.isText && mark.isInSet(nextNode.marks)) {
      to += nextNode.nodeSize;
      currentIndex++;
    } else {
      break;
    }
  }

  return {
    from,
    to,
    mark,
  };
};

const findLinkRange = (doc: ProseMirrorNode, pos: number, linkMark: Mark) => {
  let start = pos;
  let end = pos;

  while (start > 0) {
    const prevPos = doc.resolve(start - 1);
    const hasLink = prevPos
      .marks()
      .some(
        (m: Mark) =>
          m.type === linkMark.type && m.attrs.href === linkMark.attrs.href,
      );
    if (hasLink) {
      start--;
    } else {
      break;
    }
  }

  while (end < doc.content.size) {
    const nextPos = doc.resolve(end);
    const hasLink = nextPos
      .marks()
      .some(
        (m: Mark) =>
          m.type === linkMark.type && m.attrs.href === linkMark.attrs.href,
      );
    if (hasLink) {
      end++;
    } else {
      break;
    }
  }

  return { start, end };
};

interface LinkRange {
  start: number;
  end: number;
}

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSave: (url: string) => void;
  position: { x: number; y: number };
}

// Link Edit Modal Component with dark mode
const LinkEditModal = ({
  isOpen,
  onClose,
  currentUrl,
  onSave,
  position,
}: LinkModalProps) => {
  const [url, setUrl] = useState(currentUrl || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(url);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="dark:bg-mountain-800 dark:border-mountain-600 fixed z-50 min-w-80 rounded-md border border-gray-200 bg-white p-3 shadow-lg"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        Edit Link
      </div>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter URL..."
        className="dark:border-mountain-600 dark:bg-mountain-700 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400"
        autoFocus
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleSave}
          className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="dark:bg-mountain-600 dark:hover:bg-mountain-500 rounded bg-gray-300 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-400 dark:text-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const Editor = forwardRef<EditorHandle, EditorProps>(({ onChange }, ref) => {
  const { setEditor } = useEditorStore();
  const [linkModal, setLinkModal] = useState<{
    isOpen: boolean;
    url: string;
    position: { x: number; y: number };
    linkRange: LinkRange | null;
    view: EditorView | null;
  }>({
    isOpen: false,
    url: '',
    position: { x: 0, y: 0 },
    linkRange: null,
    view: null,
  });

  const editor = useEditor(
    {
      immediatelyRender: true,
      editable: true,
      content: '',
      extensions: [
        Bold,
        BulletList,
        Color,
        Document,
        FontFamily,
        FontSizeExtension,
        Gapcursor,
        Heading.configure({ levels: [1, 2, 3] }),
        Highlight.configure({ multicolor: true }),
        History,
        ListItem,
        LineHeightExtension.configure({
          types: ['heading', 'paragraph'],
          defaultLineHeight: 'normal',
        }),
        Paragraph,
        Italic,
        // Use custom image instead of regular Image
        CustomImage,
        // Configure ImageResize with better attribute handling
        ImageResize.configure({
          inline: false,
          allowBase64: true,
        }),
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        TaskList,
        TaskItem.configure({ nested: true }),
        Text,
        // Include 'image' in TextAlign types to support image alignment
        TextAlign.configure({
          types: ['heading', 'paragraph', 'image'],
          alignments: ['left', 'center', 'right', 'justify'],
          defaultAlignment: 'left',
        }),
        TextStyle,
        Underline,
        OrderedList,
        Placeholder.configure({ placeholder: 'Write something …' }),
        Youtube.configure({
          inline: true,
          controls: true,
          allowFullscreen: true,
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }),
      ],
      editorProps: {
        attributes: {
          class: `focus:outline-none print:border-0 bg-white dark:bg-mountain-800 border border-[#C7C7C7] dark:border-mountain-600 flex flex-col min-h-full w-[816px] cursor-text reset-tailwind p-10 text-gray-900 dark:text-gray-100`,
          style: 'all:revert;',
        },
        handleClick: (view, pos, event) => {
          const { schema, doc } = view.state;
          const range = doc.resolve(pos);
          const link = range
            .marks()
            .find((mark) => mark.type === schema.marks.link);

          if (link && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            window.open(link.attrs.href, '_blank', 'noopener,noreferrer');
            return true;
          }
          return false;
        },
        handleDOMEvents: {
          contextmenu: (view, event) => {
            const { schema, doc } = view.state;
            const pos = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            if (!pos) return false;

            const range = doc.resolve(pos.pos);
            const link = range
              .marks()
              .find((mark) => mark.type === schema.marks.link);

            if (link) {
              event.preventDefault();

              const contextMenu = document.createElement('div');
              // Check if dark mode is active
              const isDarkMode =
                document.documentElement.classList.contains('dark');
              contextMenu.className = isDarkMode
                ? 'fixed bg-mountain-800 border border-mountain-600 rounded-md shadow-lg p-1 z-50'
                : 'fixed bg-white border border-gray-200 rounded-md shadow-lg p-1 z-50';
              contextMenu.style.left = `${event.clientX}px`;
              contextMenu.style.top = `${event.clientY}px`;

              // Open Link option
              const openButton = document.createElement('button');
              openButton.className = isDarkMode
                ? 'block w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-mountain-700 rounded'
                : 'block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded';
              openButton.innerHTML = '🔗 Open Link';
              openButton.onclick = () => {
                window.open(link.attrs.href, '_blank', 'noopener,noreferrer');
                document.body.removeChild(contextMenu);
              };

              // Edit Link option
              const editButton = document.createElement('button');
              editButton.className = isDarkMode
                ? 'block w-full text-left px-3 py-2 text-sm hover:bg-blue-800/30 text-blue-400 rounded'
                : 'block w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-blue-600 rounded';
              editButton.innerHTML = '✏️ Edit Link';
              editButton.onclick = () => {
                const linkRange = findLinkRange(doc, pos.pos, link);
                setLinkModal({
                  isOpen: true,
                  url: link.attrs.href,
                  position: { x: event.clientX, y: event.clientY },
                  linkRange,
                  view,
                });
                document.body.removeChild(contextMenu);
              };

              // Remove Link option
              const unlinkButton = document.createElement('button');
              unlinkButton.className = isDarkMode
                ? 'block w-full text-left px-3 py-2 text-sm hover:bg-red-800/30 text-red-400 rounded'
                : 'block w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded';
              unlinkButton.innerHTML = '🔓 Remove Link';
              unlinkButton.onclick = () => {
                const $pos = view.state.doc.resolve(pos.pos);
                const markRange = getMarkRange($pos, schema.marks.link);

                if (markRange) {
                  const tr = view.state.tr.removeMark(
                    markRange.from,
                    markRange.to,
                    schema.marks.link,
                  );
                  view.dispatch(tr);
                } else {
                  view.dispatch(
                    view.state.tr.removeMark(
                      pos.pos,
                      pos.pos + 1,
                      schema.marks.link,
                    ),
                  );
                }

                document.body.removeChild(contextMenu);
              };

              contextMenu.appendChild(openButton);
              contextMenu.appendChild(editButton);
              contextMenu.appendChild(unlinkButton);
              document.body.appendChild(contextMenu);

              const removeMenu = () => {
                if (document.body.contains(contextMenu)) {
                  document.body.removeChild(contextMenu);
                }
                document.removeEventListener('click', removeMenu);
              };
              setTimeout(
                () => document.addEventListener('click', removeMenu),
                0,
              );

              return true;
            }
            return false;
          },
        },
      },
      onCreate({ editor }) {
        setEditor(editor);
      },
      onUpdate() {
        if (onChange) {
          onChange();
        }
      },
    },
    [],
  );

  const handleLinkSave = (newUrl: string) => {
    if (linkModal.view && linkModal.linkRange) {
      const { view, linkRange } = linkModal;
      const { schema } = view.state;

      const tr = view.state.tr
        .removeMark(linkRange.start, linkRange.end, schema.marks.link)
        .addMark(
          linkRange.start,
          linkRange.end,
          schema.marks.link.create({ href: newUrl }),
        );

      view.dispatch(tr);
    }
  };

  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getHTML(),
    setContent: (content: string) => {
      if (editor) {
        editor.commands.setContent(content);
        setTimeout(() => {
          if (editor && !editor.isDestroyed) {
            editor.chain().focus().run();
          }
        }, 50);
      }
    },
    getImages: () => {
      const images: { src: string; alt?: string; title?: string }[] = [];
      editor?.state.doc.descendants((node) => {
        if (node.type.name === 'image') {
          images.push({
            src: node.attrs.src,
            alt: node.attrs.alt,
            title: node.attrs.title,
          });
        }
      });
      return images;
    },
    focus: () => {
      if (editor && !editor.isDestroyed) {
        editor.chain().focus().run();
        setTimeout(() => {
          const dom = document.querySelector('.tiptap');
          if (dom) {
            (dom as HTMLElement).focus();
          }
        }, 10);
      }
    },
  }));

  return (
    <>
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert max-w-full"
      />
      <LinkEditModal
        isOpen={linkModal.isOpen}
        onClose={() => setLinkModal((prev) => ({ ...prev, isOpen: false }))}
        currentUrl={linkModal.url}
        onSave={handleLinkSave}
        position={linkModal.position}
      />
    </>
  );
});

export default Editor;
