import { useCallback } from 'react';
import type { DragEvent as ReactDragEvent, ClipboardEvent as ReactClipboardEvent } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import type { AttachmentRef } from '@pah/contracts';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  entityType: 'project' | 'prompt' | 'inbox';
  entityId: string;
  height?: string;
}

export function MarkdownEditor({ value, onChange, entityType, entityId, height = '300px' }: MarkdownEditorProps) {
  const handleFiles = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files as any as File[]);
      const snippets: string[] = [];

      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);

        const url = `http://localhost:3001/api/attachments?entityType=${encodeURIComponent(
          entityType,
        )}&entityId=${encodeURIComponent(entityId)}`;

        try {
          const response = await fetch(url, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            let message = '附件上傳失敗';
            try {
              const errorData = (await response.json()) as { message?: string; error?: string };
              message = errorData.message || errorData.error || message;
            } catch {
              // ignore JSON parsing errors
            }
            throw new Error(message);
          }

          const attachment = (await response.json()) as AttachmentRef;
          const isImage = file.type.startsWith('image/');
          const label = file.name || attachment.filename;
          const reference = isImage
            ? `![${label}](${attachment.storagePath})`
            : `[${label}](${attachment.storagePath})`;

          snippets.push(reference);
        } catch (error) {
          console.error('Attachment upload failed', error);
          alert(error instanceof Error ? error.message : '附件上傳失敗');
        }
      }

      if (snippets.length > 0) {
        const base = value || '';
        const separator = base.endsWith('\n') ? '' : '\n\n';
        const next = base + separator + snippets.join('\n');
        onChange(next);
      }
    },
    [entityType, entityId, onChange, value],
  );

  const handleDrop = useCallback(
    async (event: ReactDragEvent<HTMLDivElement>) => {
      if (!event.dataTransfer || !event.dataTransfer.files?.length) return;
      event.preventDefault();
      event.stopPropagation();
      await handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const handlePaste = useCallback(
    async (event: ReactClipboardEvent<HTMLDivElement>) => {
      const files = event.clipboardData?.files;
      if (!files || files.length === 0) return;
      event.preventDefault();
      event.stopPropagation();
      await handleFiles(files);
    },
    [handleFiles],
  );

  return (
    <div
      className="border border-subtle rounded-md overflow-hidden"
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      <CodeMirror
        value={value}
        height={height}
        extensions={[markdown()]}
        onChange={onChange}
        theme="light"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
}
