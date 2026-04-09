import { useState, useEffect } from 'react';
import { Terminal, Layers, Network, Table, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { runLexer, generateSymbolTable, calculateErrors, getTokenColor, generateAST, analyzeCodeQuality, calculateDiagnostics } from '../utils/compilerLogic';
import ASTVisualizer from './ASTVisualizer';

export default function CompilationPanel({ code, isRunning, executionOutput, runMetrics }) {
  const [activeTab, setActiveTab] = useState('source'); 
  const [tokens, setTokens] = useState([]);
  const [symbols, setSymbols] = useState([]);
  const [errors, setErrors] = useState({ lexical: [], syntax: [], semantic: [] });
  const [ast, setAst] = useState(null);
  const [warningsList, setWarningsList] = useState([]);
  const [showResources, setShowResources] = useState(false);
  const [diagnostics, setDiagnostics] = useState([]);

  useEffect(() => {
    const t = runLexer(code);
    setTokens(t);
    setSymbols(generateSymbolTable(t));
    setErrors(calculateErrors(code));
    try {
      setAst(generateAST(code));
    } catch (e) {
      setAst(null);
    }
    try {
      setWarningsList(analyzeCodeQuality(code));
    } catch (e) {
      setWarningsList([]);
    }
    try {
      setDiagnostics(calculateDiagnostics(code));
    } catch (e) {
      setDiagnostics([]);
    }
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
          <button onClick={() => setActiveTab('warnings')} style={tabStyle(activeTab === 'warnings')}><AlertTriangle size={14} /> Warnings</button>
          <button onClick={() => setActiveTab('errors')} style={tabStyle(activeTab === 'errors')}><AlertTriangle size={14} /> Errors</button>
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
        {/* Resource button shown after a run produces output/metrics */}
        <div style={{ marginLeft: '0.75rem' }}>
          {(executionOutput || runMetrics) && (
            <button onClick={() => setShowResources(s => !s)} className="btn-secondary" style={{ padding: '0.35rem 0.6rem' }}>{showResources ? 'Hide Resources' : 'Resources'}</button>
          )}
        </div>
      </div>

      {/* Content Views */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* SOURCE / TERMINAL VIEW */}
        {activeTab === 'source' && (
          <div style={{ flex: 1, padding: '1rem', overflow: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {executionOutput || <span style={{ color: 'var(--text-secondary)' }}>Ready for execution. Press Run Code.</span>}

            {showResources && runMetrics && (
              <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent)' }}>Resource Usage</div>
                  <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Time Complexity: <strong style={{ color: '#fff' }}>{runMetrics.timeComplexity}</strong></div>
                  <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Execution Time: <strong style={{ color: '#fff' }}>{runMetrics.executionTimeMs} ms</strong></div>
                  <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Memory Estimate: <strong style={{ color: '#fff' }}>{runMetrics.memoryKB} KB</strong></div>
                </div>

                <div style={{ width: '140px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Memory</div>
                  {/* simple speedometer-like circular bar using conic-gradient */}
                  {(() => {
                    const maxKB = 1024; // 1 MB as display cap
                    const pct = Math.min(100, Math.round((runMetrics.memoryKB / maxKB) * 100));
                    const bg = `conic-gradient(#10b981 ${pct}%, rgba(255,255,255,0.06) ${pct}% 100%)`;
                    return (
                      <div style={{ width: 100, height: 100, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <div style={{ color: '#000', background: 'rgba(255,255,255,0.85)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{pct}%</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
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
                <div style={{ height: '100%', minHeight: '300px' }}>
                  {ast ? (
                    <ASTVisualizer ast={ast} />
                  ) : (
                    <div style={{ color: '#c5c6c7' }}>No AST available.</div>
                  )}
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

        {/* WARNINGS VIEW */}
        {activeTab === 'warnings' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Code Quality & Suggestions</h3>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Automated suggestions to improve code quality and safety.</div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
              {warningsList.length === 0 ? (
                <div style={{ color: '#10b981' }}>No issues detected.</div>
              ) : (
                warningsList.map((w, i) => (
                  <div key={w.id + i} style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: w.severity === 'error' ? '#ef4444' : '#f59e0b' }}>{w.message}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{w.suggestion}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {w.fix && (
                          <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(w.fix); }} className="btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>Copy Fix</button>
                        )}
                      </div>
                    </div>
                    {w.fix && (
                      <pre style={{ marginTop: '0.75rem', background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '6px', overflow: 'auto', color: '#d1d5db' }}>{w.fix}</pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {/* ERRORS VIEW */}
        {activeTab === 'errors' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Errors & Fixes</h3>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Detected errors with line numbers and suggested fixes.</div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
              {diagnostics.length === 0 ? (
                <div style={{ color: '#10b981' }}>No errors detected.</div>
              ) : (
                diagnostics.map((d, i) => (
                  <div key={i} style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: d.severity === 'error' ? '#ef4444' : '#f59e0b' }}>{d.message}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Line {d.startLineNumber}, Col {d.startColumn}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {d.suggestedFix && (
                          <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(d.suggestedFix); }} className="btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>Copy Fix</button>
                        )}
                      </div>
                    </div>
                    {d.suggestedFix && (
                      <pre style={{ marginTop: '0.75rem', background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '6px', overflow: 'auto', color: '#d1d5db' }}>{d.suggestedFix}</pre>
                    )}
                  </div>
                ))
              )}
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
