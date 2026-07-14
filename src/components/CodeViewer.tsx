import { Editor } from '@monaco-editor/react';

interface CodeViewerProps {
  value: string;
  language?: string;
  fileName?: string;
  readOnly?: boolean;
  height?: string;
}

function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'rpy':
      return 'python';
    case 'ks':
      return 'plaintext';
    case 'txt':
      return 'plaintext';
    default:
      return 'plaintext';
  }
}

export default function CodeViewer({
  value,
  language,
  fileName,
  readOnly = true,
  height = '100%',
}: CodeViewerProps) {
  const resolvedLanguage = language || (fileName ? getLanguageFromFileName(fileName) : 'plaintext');

  return (
    <div style={{ width: '100%', height: height }}>
      <Editor
        height="100%"
        language={resolvedLanguage}
        value={value}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: true },
          lineNumbers: 'on',
          fontSize: 13,
          fontFamily: 'Consolas, "Courier New", monospace',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 10, bottom: 10 },
        }}
      />
    </div>
  );
}
