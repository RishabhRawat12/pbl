import { useState, useEffect } from 'react';
import { Folder, FolderOpen, FileText, Plus, ChevronRight, ChevronDown, FileCode2 } from 'lucide-react';

export default function FileExplorer({ onSelectFile, currentFileId }) {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isCreating, setIsCreating] = useState(null); // 'file' or 'folder'
  const [newItemName, setNewItemName] = useState('');

  const fetchTree = async () => {
    const token = localStorage.getItem('compiler_token');
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/fs/tree', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders);
        setFiles(data.files);
      }
    } catch (err) {
      console.error("Failed to fetch file tree", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTree(); }, []);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) newSet.delete(folderId);
      else newSet.add(folderId);
      return newSet;
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const token = localStorage.getItem('compiler_token');
    const endpoint = isCreating === 'file' ? '/api/fs/file' : '/api/fs/folder';
    
    const payload = {
      name: newItemName,
      folder_id: null, // Creating at root level for this version
      parent_id: null,
      content: isCreating === 'file' ? '// New File\n' : undefined
    };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setNewItemName('');
        setIsCreating(null);
        fetchTree();
      }
    } catch (err) {
      console.error("Creation failed", err);
    }
  };

  // --- RECURSIVE TREE RENDERER ---
  const renderTree = (parentId = null, depth = 0) => {
    const currentFolders = folders.filter(f => f.parent_id === parentId);
    const currentFiles = files.filter(f => f.folder_id === parentId);

    return (
      <div style={{ paddingLeft: depth === 0 ? '0' : '1rem' }}>
        {/* Render Folders First */}
        {currentFolders.map(folder => {
          const isExpanded = expandedFolders.has(folder.id);
          return (
            <div key={`dir-${folder.id}`}>
              <div 
                onClick={() => toggleFolder(folder.id)}
                style={itemStyle(false, depth)}
              >
                {isExpanded ? <ChevronDown size={14} color="var(--text-secondary)"/> : <ChevronRight size={14} color="var(--text-secondary)"/>}
                {isExpanded ? <FolderOpen size={14} color="#f59e0b" /> : <Folder size={14} color="#f59e0b" />}
                <span style={{ color: 'var(--text-primary)' }}>{folder.name}</span>
              </div>
              {/* Recursively render contents if folder is expanded */}
              {isExpanded && renderTree(folder.id, depth + 1)}
            </div>
          );
        })}

        {/* Render Files */}
        {currentFiles.map(file => {
          const isActive = currentFileId === file.id;
          return (
            <div 
              key={`file-${file.id}`} 
              onClick={() => onSelectFile(file)}
              style={itemStyle(isActive, depth)}
            >
              <FileCode2 size={14} color={isActive ? "var(--accent)" : "#60a5fa"} style={{ marginLeft: '1.2rem' }} />
              <span style={{ color: isActive ? '#fff' : 'var(--text-secondary)' }}>{file.name}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading workspace...</div>;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
      {/* Explorer Header */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', fontWeight: 600 }}>Explorer</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setIsCreating('file')} style={actionBtnStyle} title="New File"><FileText size={14} /></button>
          <button onClick={() => setIsCreating('folder')} style={actionBtnStyle} title="New Folder"><Folder size={14} /></button>
        </div>
      </div>

      {/* Inline Creation Form */}
      {isCreating && (
        <form onSubmit={handleCreate} style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', background: 'rgba(102, 252, 241, 0.1)' }}>
          {isCreating === 'folder' ? <Folder size={14} color="#f59e0b" /> : <FileCode2 size={14} color="#60a5fa" />}
          <input 
            autoFocus
            type="text" 
            placeholder={`New ${isCreating}...`}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.875rem' }}
          />
          <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}><Plus size={16}/></button>
          <button type="button" onClick={() => setIsCreating(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>x</button>
        </form>
      )}

      {/* Tree View Container */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0.5rem 0' }}>
        {renderTree(null, 0)}
        
        {files.length === 0 && folders.length === 0 && !isCreating && (
          <div style={{ padding: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Workspace is empty.<br/>Click the + icons above to start.
          </div>
        )}
      </div>
    </div>
  );
}

// Styling helpers
const actionBtnStyle = { background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.2s' };
const itemStyle = (isActive, depth) => ({
  display: 'flex', alignItems: 'center', gap: '0.4rem', 
  padding: `0.3rem 1rem 0.3rem ${depth === 0 ? '1rem' : '0.5rem'}`,
  cursor: 'pointer', fontSize: '0.875rem', userSelect: 'none',
  background: isActive ? 'rgba(102, 252, 241, 0.1)' : 'transparent',
  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
  transition: 'background 0.1s'
});