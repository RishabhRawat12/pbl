import { useState, useEffect } from 'react';
import Split from 'react-split';
import { Play, Save, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CodeEditor from '../components/CodeEditor';
import CompilationPanel from '../components/CompilationPanel';
import FileExplorer from '../components/FileExplorer';

export default function Workspace() {
    const navigate = useNavigate();
    
    const [openFiles, setOpenFiles] = useState([]);
    const [activeFileId, setActiveFileId] = useState(null);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [compilerData, setCompilerData] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem('compiler_token')) {
            navigate('/');
        }
    }, [navigate]);

    const activeFile = openFiles.find(f => f.id === activeFileId);

    const handleFileSelect = (file) => {
        const alreadyOpen = openFiles.find(f => f.id === file.id);
        if (!alreadyOpen) {
            setOpenFiles([...openFiles, file]);
        }
        setActiveFileId(file.id);
    };

    const handleCloseTab = (e, fileId) => {
        e.stopPropagation();
        const newFiles = openFiles.filter(f => f.id !== fileId);
        setOpenFiles(newFiles);
        if (activeFileId === fileId) {
            setActiveFileId(newFiles.length > 0 ? newFiles[newFiles.length - 1].id : null);
        }
    };

    const handleCodeChange = (newCode) => {
        setOpenFiles(openFiles.map(f => {
            if (f.id === activeFileId) return { ...f, content: newCode };
            return f;
        }));
    };

    const handleSave = async () => {
        if (!activeFile || !activeFile.id) return;
        
        const token = localStorage.getItem('compiler_token');
        const savePromise = fetch(`http://localhost:5000/api/fs/file/${activeFile.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: activeFile.content })
        });

        toast.promise(savePromise, {
            loading: 'Saving file...',
            success: 'File saved successfully!',
            error: 'Failed to save file.'
        });
    };

    const handleRun = async () => {
        if (!activeFile) return;
        
        await handleSave();
        setIsRunning(true);
        setOutput('Compiling code...\n');

        try {
            const response = await fetch('http://localhost:5000/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: activeFile.content })
            });

            const result = await response.json();
            setCompilerData(result);
            
            if (result.success) {
                toast.success('Compilation Successful');
                setOutput(`Compilation Successful!\n\nCompiler Logs:\n${result.compiler_logs}`);
            } else {
                toast.error('Compilation Failed');
                setOutput(`Compilation Failed.\nError: ${result.error}\n\nCompiler Logs:\n${result.compiler_logs}`);
            }
        } catch (error) {
            toast.error('Server error');
            setOutput(`Server Connection Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="workspace-wrapper">
            <div className="workspace-toolbar">
                <div style={{ color: 'var(--text-secondary)' }}>
                    Workspace Environment
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleSave} className="btn-secondary" disabled={!activeFile}>
                        <Save size={16} style={{marginRight: '5px'}} /> Save
                    </button>
                    <button className="btn-primary" onClick={handleRun} disabled={isRunning || !activeFile}>
                        {isRunning ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
                        <span style={{marginLeft: '5px'}}>{isRunning ? 'Compiling...' : 'Run Code'}</span>
                    </button>
                </div>
            </div>

            <Split
                sizes={[20, 45, 35]} 
                minSize={[200, 300, 300]}
                expandToMin={false}
                gutterSize={10}
                direction="horizontal"
                style={{ display: 'flex', flex: 1, padding: '0 1rem 1rem 1rem', overflow: 'hidden' }}
            >
                <div className="glass-panel" style={{ height: '100%', overflow: 'hidden' }}>
                    <FileExplorer onSelectFile={handleFileSelect} currentFileId={activeFileId} />
                </div>

                <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="editor-tabs">
                        {openFiles.length === 0 && <div className="tab-item">No files open</div>}
                        {openFiles.map(f => (
                            <div key={f.id} className={`tab-item ${activeFileId === f.id ? 'active' : ''}`} onClick={() => setActiveFileId(f.id)}>
                                {f.name}
                                <button className="tab-close" onClick={(e) => handleCloseTab(e, f.id)}>x</button>
                            </div>
                        ))}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        {activeFile ? (
                            <CodeEditor code={activeFile.content} onChange={handleCodeChange} compilerData={compilerData} />
                        ) : (
                            <div style={{ padding: '2rem', color: '#666', textAlign: 'center' }}>Select a file from the explorer to start editing.</div>
                        )}
                    </div>
                </div>

                <div className="glass-panel" style={{ height: '100%', overflow: 'hidden' }}>
                    <CompilationPanel isRunning={isRunning} executionOutput={output} compilerData={compilerData} />
                </div>
            </Split>
        </div>
    );
}