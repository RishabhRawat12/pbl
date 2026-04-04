import { useState } from 'react';
import Split from 'react-split';
import { Play, Download, Settings, RefreshCw } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import CompilationPanel from '../components/CompilationPanel';
import { compileCode, extractTokens, extractSymbolTable, extractErrors } from '../utils/compilerLogic';

export default function Workspace() {
    const [code, setCode] = useState('#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    
    // Centralized state for the compiler outputs
    const [compilerData, setCompilerData] = useState({
        tokens: [],
        symbols: [],
        astData: null,
        errors: { lexical: [], syntax: [], semantic: [] }
    });

    const handleRun = async () => {
        setIsRunning(true);
        setOutput('Analyzing phases and executing...\n');

        try {
            // 1. Fetch from your local Python backend for AST, Tokens, and Semantic data
            const localResult = await compileCode(code);
            setCompilerData({
                tokens: extractTokens(localResult),
                symbols: extractSymbolTable(localResult),
                astData: localResult?.syntax?.ast || null,
                errors: extractErrors(localResult)
            });

            // 2. Fetch from Wandbox for the actual program console output
            const response = await fetch('https://wandbox.org/api/compile.json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ compiler: 'gcc-head-c', code: code })
            });

            const result = await response.json();
            
            if (result.status !== '0' && result.compiler_error) {
                setOutput(`Compilation Error:\n${result.compiler_error}`);
            } else if (result.status === '0' || result.program_output) {
                const out = result.program_output || '';
                const err = result.program_error ? `\nStandard Error:\n${result.program_error}` : '';
                setOutput(`Output:\n-----------------------\n${out}${err}\n\n[Program exited with status ${result.status}]`);
            } else {
                setOutput(`Execution failed.\n${result.program_error || 'Please try again.'}`);
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>
            <div className="glass-panel" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1.5rem', margin: '0 1rem 1rem 1rem', borderRadius: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem' }}>main.c</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        <Settings size={16} /> Settings
                    </button>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        <Download size={16} /> Export
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleRun}
                        disabled={isRunning}
                        style={{ padding: '0.5rem 1.5rem', opacity: isRunning ? 0.7 : 1 }}
                    >
                        {isRunning ? <RefreshCw size={18} className="spin" /> : <Play size={18} />}
                        {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                </div>
            </div>

            <Split
                sizes={[60, 40]}
                minSize={300}
                expandToMin={false}
                gutterSize={10}
                gutterAlign="center"
                snapOffset={30}
                dragInterval={1}
                direction="horizontal"
                cursor="col-resize"
                style={{ display: 'flex', flex: 1, height: '100%', padding: '0 1rem 1rem 1rem' }}
            >
                <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Code Editor
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', padding: '0.5rem 0' }}>
                        <CodeEditor code={code} onChange={setCode} />
                    </div>
                </div>

                <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <CompilationPanel isRunning={isRunning} executionOutput={output} compilerData={compilerData} />
                </div>
            </Split>

            <style>{`
        .gutter {
          background-color: transparent;
          background-repeat: no-repeat;
          background-position: 50%;
          cursor: col-resize;
          position: relative;
        }
        .gutter::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          height: 30px;
          width: 4px;
          background: var(--glass-border);
          border-radius: 4px;
          transition: background 0.2s;
        }
        .gutter:hover::after {
          background: var(--accent);
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}