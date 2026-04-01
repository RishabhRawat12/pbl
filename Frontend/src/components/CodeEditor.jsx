import Editor from '@monaco-editor/react';

export default function CodeEditor({ code, onChange }) {
  const handleEditorChange = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <Editor
      height="100%"
      language="c"
      theme="vs-dark"
      value={code}
      onChange={handleEditorChange}
      options={{
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
      }}
      loading={
        <div style={{ color: 'var(--text-secondary)', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          Loading Editor...
        </div>
      }
    />
  );
}
