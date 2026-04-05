import { useState, useEffect } from 'react';
import Split from 'react-split';
import { Play, Download, Settings, RefreshCw, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import CompilationPanel from '../components/CompilationPanel';
import FileExplorer from '../components/FileExplorer';

export default function Workspace() {
    const navigate = useNavigate();
    
    // State for the currently opened file
    const [activeFile, setActiveFile] = useState({ id: null, name: 'untitled.c', content: '// Select or create a file in the explorer\n' });
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [compilerData, setCompilerData] = useState(null);

    // Auth Protection Check
    useEffect(() => {
        if (!localStorage.getItem('compiler_token')) {
            navigate('/');
        }
    }, [navigate]);

    // Handle selecting a file from the sidebar
    const handleFileSelect = (file) => {
        setActiveFile(file);
    };

    // Update active file content as user types
    const handleCodeChange = (newCode) => {
        setActiveFile(prev => ({ ...prev, content: newCode }));
    };

    // Save the file to the database
    const handleSave = async () => {
        if (!activeFile.id) return; // Don't save an unsaved/temporary file
        setIsSaving(true);
        const token = localStorage.getItem('compiler_token');
        
        try {
            await fetch(`http://localhost:5000/api/fs/file/${activeFile.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: activeFile.content })
            });
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRun = async () => {
        // Auto-save before running
        await handleSave();
        
        setIsRunning(true);
        setOutput('Sending code to local compiler...\n');

        try {
            const response = await fetch('http://localhost:5000/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: activeFile.content })
            });

            const result = await response.json();
            setCompilerData(result);
            
            if (result.success) {
                setOutput(`Compilation Successful!\n-----------------------\nCompiler Logs:\n${result.compiler_logs || 'Processed with 0 errors.'}`);
            } else {
                setOutput(`Compilation Failed.\n-----------------------\nError: ${result.error}\n\nCompiler Logs:\n${result.compiler_logs || ''}`);
            }
        } catch (error) {
            setOutput(`Server Connection Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>
            
            {/* Workspace Toolbar */}
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', margin: '0 1rem 1rem 1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active File:</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem' }}>{activeFile.name}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={handleSave} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} disabled={!activeFile.id || isSaving}>
                        <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn-primary" onClick={handleRun} disabled={isRunning} style={{ padding: '0.5rem 1.5rem', opacity: isRunning ? 0.7 : 1 }}>
                        {isRunning ? <RefreshCw size={18} className="spin" /> : <Play size={18} />}
                        {isRunning ? 'Compiling...' : 'Run Code'}
                    </button>
                </div>
            </div>

            {/* 3-Pane Split Layout */}
            <Split
                sizes={[20, 45, 35]} // Sidebar, Editor, Compiler Panel
                minSize={[200, 300, 300]}
                expandToMin={false}
                gutterSize={10}
                gutterAlign="center"
                direction="horizontal"
                style={{ display: 'flex', flex: 1, height: '100%', padding: '0 1rem 1rem 1rem' }}
            >
                {/* Left Pane: File Explorer */}
                <div className="glass-panel" style={{ height: '100%', overflow: 'hidden', borderRadius: '8px 0 0 8px' }}>
                    <FileExplorer onSelectFile={handleFileSelect} currentFileId={activeFile.id} />
                </div>

                {/* Center Pane: Editor */}
                <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '0' }}>
                    <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Editor
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', padding: '0.5rem 0' }}>
                        <CodeEditor code={activeFile.content} onChange={handleCodeChange} />
                    </div>
                </div>

                {/* Right Pane: Compilation Panel */}
                <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '0 8px 8px 0' }}>
                    <CompilationPanel code={activeFile.content} isRunning={isRunning} executionOutput={output} compilerData={compilerData} />
                </div>
            </Split>

            <style>{`
        .gutter { background-color: transparent; cursor: col-resize; position: relative; }
        .gutter::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); height: 30px; width: 4px; background: var(--glass-border); border-radius: 4px; transition: background 0.2s; }
        .gutter:hover::after { background: var(--accent); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}