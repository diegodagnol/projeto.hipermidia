import { useEffect } from 'react';
import { useInput, useRecordContext } from 'react-admin';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import './RichTextInput.css';

function Toolbar({ editor }) {
  if (!editor) return null;

  const btn = (active, onClick, title, children) => (
    <button
      type="button"
      title={title}
      className={`rte-btn${active ? ' is-active' : ''}`}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    >
      {children}
    </button>
  );

  return (
    <div className="rte-toolbar">
      <div className="rte-group">
        {btn(editor.isActive('bold'),      () => editor.chain().focus().toggleBold().run(),      'Negrito',    <b>N</b>)}
        {btn(editor.isActive('italic'),    () => editor.chain().focus().toggleItalic().run(),    'Itálico',    <i>I</i>)}
        {btn(editor.isActive('strike'),    () => editor.chain().focus().toggleStrike().run(),    'Tachado',    <s>S</s>)}
      </div>
      <div className="rte-group">
        {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'Título 2', 'H2')}
        {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'Título 3', 'H3')}
      </div>
      <div className="rte-group">
        {btn(editor.isActive('bulletList'),  () => editor.chain().focus().toggleBulletList().run(),  'Lista',          '• —')}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Lista numerada', '1.')}
        {btn(editor.isActive('blockquote'),  () => editor.chain().focus().toggleBlockquote().run(),  'Citação',        '❝')}
      </div>
      <div className="rte-group">
        {btn(false, () => {
          const url = window.prompt('URL do link:');
          if (url) editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
        }, 'Inserir link', '🔗')}
        {btn(editor.isActive('link'), () => editor.chain().focus().unsetLink().run(), 'Remover link', '🔗✕')}
      </div>
      <div className="rte-group">
        {btn(false, () => editor.chain().focus().undo().run(), 'Desfazer', '↩')}
        {btn(false, () => editor.chain().focus().redo().run(), 'Refazer',  '↪')}
      </div>
    </div>
  );
}

export default function RichTextInput({ source, label, placeholder = 'Digite o conteúdo...' }) {
  const record = useRecordContext();

  const {
    field: { value, onChange },
  } = useInput({ source });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      const html = editor.isEmpty ? '' : editor.getHTML();
      onChange(html);
    },
  });

  // Sincroniza quando o registro carrega no modo edição
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [record?.id]);

  return (
    <div className="rte-wrapper">
      {label && <label className="rte-label">{label}</label>}
      <div className="rte-container">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} className="rte-editor" />
      </div>
    </div>
  );
}
