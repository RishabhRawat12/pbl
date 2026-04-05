import { useState, useEffect } from 'react';
import { Folder, FileText, Plus, Edit2, Trash2, FileCode2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FileExplorer({ onSelectFile, currentFileId }) {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isCreating, setIsCreating] = useState(null); 
  const [newItemName, setNewItemName] = useState('');

  const fetchTree = async () => {
    const token = localStorage.getItem('compiler_token');
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
      console.log(err);
    }
  };

  useEffect(() => { fetchTree(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const token = localStorage.getItem('compiler_token');
    const endpoint = isCreating === 'file' ? '/api/fs/file' : '/api/fs/folder';
    
    try {
      await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newItemName, content: '// New file\n' })
      });
      setNewItemName('');
      setIsCreating(null);
      fetchTree();
      toast.success(`${isCreating} created`);
    } catch (err) {
      toast.error('Failed to create');
    }
  };

  const handleDelete = async (e, id, type) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    const token = localStorage.getItem('compiler_token');
    try {
      await fetch(`http://localhost:5000/api/fs/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success(`${type} deleted`);
      fetchTree();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleRename = async (e, id, type, oldName) => {
    e.stopPropagation();
    const newName = window.prompt("Enter new name:", oldName);
    if (!newName || newName === oldName) return;

    const token = localStorage.getItem('compiler_token');
    try {
      await fetch(`http://localhost:5000/api/fs/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newName })
      });
      toast.success('Renamed successfully');
      fetchTree();
    } catch (err) {
      toast.error('Rename failed');
    }
  };

  return (
    <div className="explorer-container">
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <span style={{color: '#888', fontSize: '12px'}}>EXPLORER</span>
        <div style={{display: 'flex', gap: '10px'}}>
          <FileText size={14} style={{cursor: 'pointer'}} onClick={() => setIsCreating('file')} />
          <Folder size={14} style={{cursor: 'pointer'}} onClick={() => setIsCreating('folder')} />
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} style={{ padding: '5px 10px', display: 'flex' }}>
          <input 
            autoFocus
            type="text" 
            placeholder={`Name...`}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            style={{ width: '100%', background: '#222', border: '1px solid #444', color: 'white', padding: '4px' }}
          />
        </form>
      )}

      <div style={{ padding: '10px', overflowY: 'auto' }}>
        {folders.map(f => (
          <div key={`folder-${f.id}`} className="file-item-row">
            <div style={{display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b'}}>
               <Folder size={14} /> <span>{f.name}</span>
            </div>
            <div className="file-item-actions">
                <Edit2 size={12} className="action-icon" onClick={(e) => handleRename(e, f.id, 'folder', f.name)} />
                <Trash2 size={12} className="action-icon" onClick={(e) => handleDelete(e, f.id, 'folder')} />
            </div>
          </div>
        ))}
        {files.map(f => (
          <div key={`file-${f.id}`} className="file-item-row" onClick={() => onSelectFile(f)}>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px', color: currentFileId === f.id ? '#66fcf1' : '#ccc'}}>
               <FileCode2 size={14} /> <span>{f.name}</span>
            </div>
            <div className="file-item-actions">
                <Edit2 size={12} className="action-icon" onClick={(e) => handleRename(e, f.id, 'file', f.name)} />
                <Trash2 size={12} className="action-icon" onClick={(e) => handleDelete(e, f.id, 'file')} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}