import { useState, useEffect } from 'react';
import Split from 'react-split';
import { Play, Download, Settings, RefreshCw, Terminal, Save, FolderOpen } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import CompilationPanel from '../components/CompilationPanel';
import { codeAPI } from '../utils/api';
import { estimateResources } from '../utils/compilerLogic';

export default function Workspace() {
    const [code, setCode] = useState('#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [title, setTitle] = useState('Untitled');
    const [history, setHistory] = useState([]);
    const [runMetrics, setRunMetrics] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [editorOptions, setEditorOptions] = useState({ fontSize: 16, wordWrap: 'on' });
    const [editorTheme, setEditorTheme] = useState('vs-dark');

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const response = await codeAPI.getHistory();
            setHistory(response.data);
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    };

    const handleSave = async () => {
        try {
            await codeAPI.saveSnippet({ title, code, language: 'c' });
            loadHistory(); 
            alert('Code saved successfully!');
        } catch (error) {
            alert('Failed to save code');
        }
    };

    const handleLoad = (snippet) => {
        setTitle(snippet.title);
        setCode(snippet.code);
        setShowHistory(false);
    };

    const handleExport = () => {
        try {
            const blob = new Blob([code], { type: 'text/x-c' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title || 'code'}.c`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to export file');
        }
    };

    const handleRun = async () => {
        setIsRunning(true);
        setOutput('Compiling and executing...\n');
        const startTime = performance.now();

        try {
            const response = await fetch('https://wandbox.org/api/compile.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    compiler: 'gcc-head-c',
                    code: code
                })
            });

            const result = await response.json();
            
            const endTime = performance.now();
            const durationMs = Math.round(endTime - startTime);

            if (result.status !== '0' && result.compiler_error) {
                setOutput(`Compilation Error:\n${result.compiler_error}`);
                        } else if (result.status === '0' || result.program_output) {
                const out = result.program_output || '';
                const err = result.program_error ? `\nStandard Error:\n${result.program_error}` : '';
                setOutput(`Output:\n-----------------------\n${out}${err}\n\n[Program exited with status ${result.status}]`);
                                const metrics = estimateResources(code, durationMs, result);
                                setRunMetrics(metrics);
            } else {
                setOutput(`Execution failed.\n${result.program_error || 'Please try again. API could be rate limited.'}`);
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div style={{ position: 'relative', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>
            {/* Workspace Toolbar */}
            <div className="glass-panel" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1.5rem', margin: '0 1rem 1rem 1rem', borderRadius: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '4px',
                            padding: '0.5rem 1rem',
                            color: 'var(--accent)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            outline: 'none'
                        }}
                        placeholder="Enter title"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={handleSave} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        <Save size={16} /> Save
                    </button>
                    <button className="btn-secondary" onClick={() => setShowHistory(!showHistory)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        <FolderOpen size={16} /> Load
                    </button>
                    <button className="btn-secondary" onClick={() => setShowSettings(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        <Settings size={16} /> Settings
                    </button>
                    <button className="btn-secondary" onClick={handleExport} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
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

            {showHistory && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '72px',
                    left: '1rem',
                    right: '1rem',
                    padding: '1rem',
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    zIndex: 50
                }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Your Code History</h3>
                    {history.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No saved code yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {history.map((snippet) => (
                                <div
                                    key={snippet._id}
                                    onClick={() => handleLoad(snippet)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        border: '1px solid var(--glass-border)',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.4)'}
                                    onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.2)'}
                                >
                                    <div style={{ fontWeight: 600, color: 'var(--accent)' }}>{snippet.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {new Date(snippet.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showSettings && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '72px',
                    right: '1rem',
                    width: '320px',
                    padding: '1rem',
                    zIndex: 60
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--accent)' }}>Editor Settings</h3>
                        <button className="btn-secondary" onClick={() => setShowSettings(false)} style={{ padding: '0.25rem 0.5rem' }}>Close</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Font size</label>
                        <input type="number" value={editorOptions.fontSize} min={10} max={28} onChange={(e) => setEditorOptions(prev => ({ ...prev, fontSize: Number(e.target.value) }))} className="input-field" />

                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Word wrap</label>
                        <select value={editorOptions.wordWrap} onChange={(e) => setEditorOptions(prev => ({ ...prev, wordWrap: e.target.value }))} className="input-field">
                            <option value="on">On</option>
                            <option value="off">Off</option>
                        </select>

                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Theme</label>
                        <select value={editorTheme} onChange={(e) => setEditorTheme(e.target.value)} className="input-field">
                            <option value="vs-dark">Dark</option>
                            <option value="light">Light</option>
                        </select>
                    </div>
                </div>
            )}

            
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
                        <CodeEditor code={code} onChange={setCode} options={editorOptions} theme={editorTheme} />
                    </div>
                </div>

                
                <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <CompilationPanel code={code} isRunning={isRunning} executionOutput={output} runMetrics={runMetrics} />
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
