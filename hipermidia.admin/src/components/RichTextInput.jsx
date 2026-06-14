import { useEffect } from 'react';
import { useInput, useRecordContext } from 'react-admin';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TableKit } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import './RichTextInput.css';

function btn(active, onClick, title, children, extra = '', disabled = false) {
  return (
    <button
      key={title}
      type="button"
      title={title}
      disabled={disabled}
      className={`rte-btn${active ? ' is-active' : ''}${extra ? ' ' + extra : ''}`}
      onMouseDown={(e) => { e.preventDefault(); if (!disabled) onClick(); }}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }) {
  if (!editor) return null;

  const inTable = editor.isActive('table');

  return (
    <>
      <div className="rte-toolbar">
        {/* Formatação */}
        <div className="rte-group">
          {btn(editor.isActive('bold'),   () => editor.chain().focus().toggleBold().run(),   'Negrito', <b>N</b>)}
          {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Itálico', <i>I</i>)}
          {btn(editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), 'Tachado', <s>S</s>)}
        </div>

        {/* Títulos */}
        <div className="rte-group">
          {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'Título 2', 'H2')}
          {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'Título 3', 'H3')}
        </div>

        {/* Alinhamento */}
        <div className="rte-group">
          {btn(editor.isActive({ textAlign: 'left' }),    () => editor.chain().focus().setTextAlign('left').run(),    'Alinhar à esquerda', '⬤←')}
          {btn(editor.isActive({ textAlign: 'center' }),  () => editor.chain().focus().setTextAlign('center').run(),  'Centralizar',        '⬤≡')}
          {btn(editor.isActive({ textAlign: 'right' }),   () => editor.chain().focus().setTextAlign('right').run(),   'Alinhar à direita',  '⬤→')}
          {btn(editor.isActive({ textAlign: 'justify' }), () => editor.chain().focus().setTextAlign('justify').run(), 'Justificar',         '☰')}
        </div>

        {/* Listas e citação */}
        <div className="rte-group">
          {btn(editor.isActive('bulletList'),  () => editor.chain().focus().toggleBulletList().run(),  'Lista',          '• —')}
          {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Lista numerada', '1.')}
          {btn(editor.isActive('blockquote'),  () => editor.chain().focus().toggleBlockquote().run(),  'Citação',        '❝')}
        </div>

        {/* Link */}
        <div className="rte-group">
          {btn(false, () => {
            const url = window.prompt('URL do link:');
            if (url) editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
          }, 'Inserir link', '🔗')}
          {btn(editor.isActive('link'), () => editor.chain().focus().unsetLink().run(), 'Remover link', '🔗✕')}
        </div>

        {/* Mídia */}
        <div className="rte-group">
          {btn(false, () => {
            const url = window.prompt('URL da imagem:');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }, 'Inserir imagem', '🖼')}
          {btn(false, () => {
            const entrada = window.prompt('Cole a URL do YouTube ou o código <iframe> de incorporação:');
            if (!entrada) return;
            // Aceita tanto a URL pura quanto o código <iframe ... src="..."> colado inteiro
            const matchIframe = entrada.match(/<iframe[^>]*\bsrc=["']([^"']+)["']/i);
            const url = (matchIframe ? matchIframe[1] : entrada).trim();
            const ok = editor.chain().focus().setYoutubeVideo({ src: url }).run();
            if (!ok) window.alert('URL do YouTube inválida. Use um link como https://www.youtube.com/watch?v=ID');
          }, 'Inserir vídeo do YouTube', '▶')}
          {btn(false, () => editor.chain().focus().setHorizontalRule().run(), 'Linha divisória', '—')}
        </div>

        {/* Tabela */}
        <div className="rte-group">
          {!inTable && btn(false, () =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
            'Inserir tabela', '⊞'
          )}
          {inTable && btn(false, () => editor.chain().focus().addRowAfter().run(),    'Adicionar linha',   '+L', '', !editor.can().addRowAfter())}
          {inTable && btn(false, () => editor.chain().focus().deleteRow().run(),      'Remover linha',     '-L', '', !editor.can().deleteRow())}
          {inTable && btn(false, () => editor.chain().focus().addColumnAfter().run(), 'Adicionar coluna',  '+C', '', !editor.can().addColumnAfter())}
          {inTable && btn(false, () => editor.chain().focus().deleteColumn().run(),   'Remover coluna',    '-C', '', !editor.can().deleteColumn())}
          {inTable && btn(false, () => editor.chain().focus().deleteTable().run(),    'Excluir tabela',    '🗑', 'rte-btn-danger', !editor.can().deleteTable())}
        </div>

        {/* Histórico */}
        <div className="rte-group">
          {btn(false, () => editor.chain().focus().undo().run(), 'Desfazer', '↩')}
          {btn(false, () => editor.chain().focus().redo().run(), 'Refazer',  '↪')}
        </div>
      </div>
    </>
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
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TableKit.configure({ table: { resizable: false } }),
      Image,
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
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
