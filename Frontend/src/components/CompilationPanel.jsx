import { useState, useEffect } from 'react';
import { Terminal, Layers, Network, Table, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getTokenColor } from '../utils/compilerLogic';

// Helper component to display dynamic JSON trees for the AST
const TreeViewer = ({ data, depth = 0 }) => {
  if (!data) return <div style={{ color: '#c5c6c7' }}>Empty Node</div>;
  
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return <span style={{ color: '#66fcf1' }}>{String(data)}</span>;
  }

  if (Array.isArray(data)) {
    return (
      <div style={{ paddingLeft: depth > 0 ? '1.5rem' : '0' }}>
        {data.map((item, index) => (
          <div key={index} style={{ borderLeft: '1px dashed rgba(102, 252, 241, 0.2)', paddingLeft: '0.5rem', marginBottom: '0.25rem' }}>
             <TreeViewer data={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof data === 'object') {
    return (
      <div style={{ paddingLeft: depth > 0 ? '1.5rem' : '0' }}>
        {Object.entries(data).map(([key, value], index) => (
          <div key={index} style={{ borderLeft: depth > 0 ? '1px solid rgba(102, 252, 241, 0.2)' : 'none', paddingLeft: depth > 0 ? '0.5rem' : '0' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{key}: </span>
            <TreeViewer data={value} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CompilationPanel({ isRunning, executionOutput, compilerData }) {
  const [activeTab, setActiveTab] = useState('source'); 
  const { tokens, symbols, astData, errors } = compilerData;

  useEffect(() => {
    if (isRunning) setActiveTab('source');
  }, [isRunning]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#050505', borderRadius: '0 0 8px 8px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(31,40,51,0.8)' }}>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('source')} style={tabStyle(activeTab === 'source')}><Terminal size={14} /> Output</button>
          <button onClick={() => setActiveTab('tokens')} style={tabStyle(activeTab === 'tokens')}><Layers size={14} /> Tokens</button>
          <button onClick={() => setActiveTab('tree')} style={tabStyle(activeTab === 'tree')}><Network size={14} /> AST</button>
          <button onClick={() => setActiveTab('semantic')} style={tabStyle(activeTab === 'semantic')}><Table size={14} /> Semantic</button>
        </div>

        <select 
          className="input-field" 
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', appearance: 'auto', border: '1px solid rgba(102, 252, 241, 0.4)', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', color: '#fff' }}
          value={activeTab === 'source' ? '' : activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          <option value="" disabled>Analyze Phase...</option>
          <option value="tokens">1. Lexical Analysis</option>
          <option value="tree">2. Syntax Analysis</option>
          <option value="semantic">3. Semantic Analysis</option>
        </select>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {isRunning && activeTab !== 'source' ? (
          <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Analyzing compiler phases...</div>
        ) : (
          <>
            {activeTab === 'source' && (
              <div style={{ flex: 1, padding: '1rem', overflow: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {executionOutput || <span style={{ color: 'var(--text-secondary)' }}>Ready for execution. Press Run Code.</span>}
              </div>
            )}

            {activeTab === 'tokens' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Lexical Analysis (Scanner)</h3>
                  {errors.lexical.length > 0 ? (
                    <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <AlertTriangle size={14} /> {errors.lexical[0]}
                    </div>
                  ) : (
                    <div style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <CheckCircle2 size={14} /> No lexical errors detected.
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Line</th>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Token Type</th>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Lexeme</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.map((token, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{token.line || '-'}</td>
                          <td style={{ padding: '0.5rem', color: getTokenColor(token.type), fontWeight: 600 }}>{token.type || 'UNKNOWN'}</td>
                          <td style={{ padding: '0.5rem', color: '#fff' }}>"{token.lexeme || token.value || ''}"</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'tree' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Syntax Analysis (Parse Tree)</h3>
                  {errors.syntax.length > 0 ? (
                    <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <AlertTriangle size={14} /> {errors.syntax[0]}
                    </div>
                  ) : (
                    <div style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <CheckCircle2 size={14} /> AST generated successfully.
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', lineHeight: '1.8' }}>
                  {astData ? <TreeViewer data={astData} /> : <div style={{color: 'var(--text-secondary)'}}>No AST available. Check for syntax errors.</div>}
                </div>
              </div>
            )}

            {activeTab === 'semantic' && (
               <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                 <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                   <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Semantic Analysis (Symbol Table)</h3>
                   {errors.semantic.length > 0 ? (
                     <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                       <AlertTriangle size={14} /> {errors.semantic[0]}
                     </div>
                   ) : (
                     <div style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                       <CheckCircle2 size={14} /> Symbol table verified.
                     </div>
                   )}
                 </div>
                 <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                     <thead>
                       <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                         <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Identifier</th>
                         <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Data Type</th>
                         <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Scope</th>
                         <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Line</th>
                       </tr>
                     </thead>
                     <tbody>
                       {symbols.map((sym, idx) => (
                         <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                           <td style={{ padding: '0.5rem', color: '#10b981', fontWeight: 600 }}>{sym.name}</td>
                           <td style={{ padding: '0.5rem', color: '#66fcf1' }}>{sym.type}</td>
                           <td style={{ padding: '0.5rem', color: 'var(--text-primary)' }}>{sym.scope}</td>
                           <td style={{ padding: '0.5rem', color: '#ef4444' }}>{sym.line}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function tabStyle(isActive) {
  return {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
    background: isActive ? 'rgba(102, 252, 241, 0.15)' : 'transparent',
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    fontWeight: isActive ? 600 : 500, transition: 'all 0.2s', fontSize: '0.75rem',
    textTransform: 'uppercase', letterSpacing: '0.5px'
  };
}