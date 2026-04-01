import { useState, useEffect } from 'react';
import { Terminal, Layers, Network, Table, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { runLexer, generateSymbolTable, calculateErrors, getTokenColor } from '../utils/compilerLogic';

export default function CompilationPanel({ code, isRunning, executionOutput }) {
  const [activeTab, setActiveTab] = useState('source'); 
  const [tokens, setTokens] = useState([]);
  const [symbols, setSymbols] = useState([]);
  const [errors, setErrors] = useState({ lexical: [], syntax: [], semantic: [] });

  useEffect(() => {
    const t = runLexer(code);
    setTokens(t);
    setSymbols(generateSymbolTable(t));
    setErrors(calculateErrors(code));
  }, [code]);

  useEffect(() => {
    if (isRunning) setActiveTab('source');
  }, [isRunning]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#050505', borderRadius: '0 0 8px 8px' }}>
      
      {/* Navigation Header for Right Pane */}
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

      {/* Content Views */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* SOURCE / TERMINAL VIEW */}
        {activeTab === 'source' && (
          <div style={{ flex: 1, padding: '1rem', overflow: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {executionOutput || <span style={{ color: 'var(--text-secondary)' }}>Ready for execution. Press Run Code.</span>}
          </div>
        )}

        {/* TOKENS VIEW */}
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
                      <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{token.line}</td>
                      <td style={{ padding: '0.5rem', color: getTokenColor(token.type), fontWeight: 600 }}>{token.type}</td>
                      <td style={{ padding: '0.5rem', color: '#fff' }}>"{token.lexeme}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PARSE TREE VIEW */}
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
              <div style={{ color: 'var(--accent)', fontWeight: 600 }}>Program (Root)</div>
              <div style={{ paddingLeft: '1.5rem', borderLeft: '1px solid rgba(102, 252, 241, 0.2)' }}>
                <div style={{ color: '#c5c6c7' }}>├── PreprocessorDirective {"<stdio.h>"}</div>
                <div style={{ color: '#c5c6c7' }}>└── FunctionDeclaration <span style={{color: 'var(--accent)'}}>main</span></div>
                <div style={{ paddingLeft: '1.5rem', borderLeft: '1px solid rgba(102, 252, 241, 0.2)' }}>
                  <div style={{ color: '#c5c6c7' }}>├── ReturnType <span style={{color: '#66fcf1'}}>int</span></div>
                  <div style={{ color: '#c5c6c7' }}>└── BlockStatement</div>
                  <div style={{ paddingLeft: '1.5rem', borderLeft: '1px dashed rgba(102, 252, 241, 0.2)' }}>
                    {symbols.filter(s => s.scope === 'main').map((sym, i) => (
                      <div key={i} style={{ color: '#c5c6c7' }}>
                        ├── VariableDeclaration <span style={{color: '#10b981'}}>{sym.name}</span>
                        <div style={{ paddingLeft: '1.5rem' }}>
                          ├── Type: {sym.type}<br />
                          └── Value: {sym.value}
                        </div>
                      </div>
                    ))}
                    <div style={{ color: '#c5c6c7' }}>├── FunctionCall <span style={{color: '#10b981'}}>printf</span></div>
                    <div style={{ color: '#c5c6c7' }}>└── ReturnStatement</div>
                    <div style={{ paddingLeft: '1.5rem' }}>└── Literal 0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEMANTIC VIEW */}
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
                     <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Value</th>
                   </tr>
                 </thead>
                 <tbody>
                   {symbols.map((sym, idx) => (
                     <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                       <td style={{ padding: '0.5rem', color: '#10b981', fontWeight: 600 }}>{sym.name}</td>
                       <td style={{ padding: '0.5rem', color: '#66fcf1' }}>{sym.type}</td>
                       <td style={{ padding: '0.5rem', color: 'var(--text-primary)' }}>{sym.scope}</td>
                       <td style={{ padding: '0.5rem', color: '#ef4444' }}>{sym.value}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}

// Inline styles for tab buttons
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
