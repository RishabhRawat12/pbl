import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

export default function CodeEditor({ code, onChange, compilerData }) {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      const model = monaco.editor.getModels()[0];
      if (!model) return;

      let markers = [];
      
      // parse errors from the backend response if they exist
      if (compilerData && compilerData.errors) {
         // Gather all error messages
         const allErrors = [
            ...(compilerData.errors.lexical || []),
            ...(compilerData.errors.syntax || []),
            ...(compilerData.errors.semantic || [])
         ];

         allErrors.forEach(errString => {
            // Student hack: try to find 'line X' in the error string to position the marker
            const lineMatch = errString.match(/line (\d+)/i);
            const lineNum = lineMatch ? parseInt(lineMatch[1], 10) : 1;

            markers.push({
               message: errString,
               severity: monaco.MarkerSeverity.Error,
               startLineNumber: lineNum,
               startColumn: 1,
               endLineNumber: lineNum,
               endColumn: 100
            });
         });
      }

      monaco.editor.setModelMarkers(model, 'compiler', markers);
    }
  }, [monaco, compilerData, code]);

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
        fontSize: 15,
        fontFamily: 'var(--font-mono)',
        wordWrap: 'on'
      }}
    />
  );
}