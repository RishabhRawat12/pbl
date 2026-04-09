import Editor from '@monaco-editor/react';
import { useRef, useEffect } from 'react';
import { calculateDiagnostics } from '../utils/compilerLogic';

export default function CodeEditor({ code, onChange, options = {}, theme = 'vs-dark' }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const applyMarkers = (value) => {
    if (!editorRef.current || !monacoRef.current) return;
    try {
      const diagnostics = calculateDiagnostics(value || '');
      const monaco = monacoRef.current;
      const model = editorRef.current.getModel();
      const markers = diagnostics.map(d => ({
        startLineNumber: d.startLineNumber,
        startColumn: d.startColumn,
        endLineNumber: d.endLineNumber,
        endColumn: d.endColumn,
        message: d.message,
        severity: d.severity === 'warning' ? monaco.MarkerSeverity.Warning : (d.severity === 'info' ? monaco.MarkerSeverity.Info : monaco.MarkerSeverity.Error)
      }));
      monaco.editor.setModelMarkers(model, 'customLinter', markers);
    } catch (e) {
      // ignore marker errors
    }
  };

  const handleEditorChange = (value) => {
    if (onChange) onChange(value);
    applyMarkers(value);
  };

  const defaultOptions = {
    minimap: { enabled: false },
    fontSize: 16,
    fontFamily: 'var(--font-mono)',
    wordWrap: 'on',
    lineNumbersMinChars: 3,
    padding: { top: 16 },
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    formatOnPaste: true,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <Editor
      height="100%"
      language="c"
      theme={theme}
      value={code}
      onChange={handleEditorChange}
      onMount={(editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        applyMarkers(code);
      }}
      options={mergedOptions}
      loading={
        <div style={{ color: 'var(--text-secondary)', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          Loading Editor...
        </div>
      }
    />
  );
}
