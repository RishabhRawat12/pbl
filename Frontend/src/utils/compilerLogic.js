export function runLexer(code) {
  const tokens = [];
  const lines = code.split('\n');
  const keywords = ['int', 'float', 'return', 'void', 'char', 'if', 'else', 'for', 'while', 'include'];
  
  lines.forEach((line, lineIdx) => {
    let activeLine = line.split('//')[0];
    if (!activeLine.trim()) return;

    let words = activeLine.split(/(\s+|;|[()[\]{}<>=+\-*/#,])/).filter(w => w.trim().length > 0);
    
    words.forEach(word => {
      let type = 'IDENTIFIER';
      if (keywords.includes(word)) type = 'KEYWORD';
      else if (!isNaN(word)) type = 'NUMBER';
      else if (word.match(/^[()[\]{}]$/)) type = 'PUNCTUATION';
      else if (word.match(/^[=+\-*/<>]$/)) type = 'OPERATOR';
      else if (word.startsWith('"') || word.startsWith("'") || word.includes('.h')) type = 'STRING';
      else if (word === ';') type = 'SEPARATOR';
      else if (word === '#') type = 'PREPROCESSOR';
      
      tokens.push({ type, lexeme: word, line: lineIdx + 1 });
    });
  });
  return tokens;
}

export function generateSymbolTable(tokens) {
  const symbols = [];
  let currentScope = 'Global';
  
  for(let i=0; i < tokens.length; i++) {
    if (tokens[i].type === 'KEYWORD' && ['int', 'float', 'char', 'void'].includes(tokens[i].lexeme)) {
      if (tokens[i+1] && tokens[i+1].type === 'IDENTIFIER') {
        const type = tokens[i].lexeme;
        const name = tokens[i+1].lexeme;
        let value = 'undefined';
        
        if (tokens[i+2] && tokens[i+2].lexeme === '(') {
          symbols.push({ name, type: "Function (" + type + ")", scope: 'Global', value: 'Code Block' });
          currentScope = name; 
        } else {
          if (tokens[i+2] && tokens[i+2].lexeme === '=' && tokens[i+3]) {
            value = tokens[i+3].lexeme;
          }
          symbols.push({ name, type, scope: currentScope, value });
        }
      }
    }
  }
  return symbols;
}

export function calculateErrors(code) {
  let newErrors = { lexical: [], syntax: [], semantic: [] };
  
  if (code.includes('@@')) {
    newErrors.lexical.push("Line 4: Unrecognized token '@@' is not valid in C syntax.");
  }
  
  const functionMatch = code.match(/int main\s*\(/);
  if (functionMatch && !code.includes('}')) {
    newErrors.syntax.push("Line 6: Expected '}' to close function body.");
  }
  if (code.includes('if (') && !code.includes(')')) {
    newErrors.syntax.push("Line 5: Expected ')' to close if condition.");
  }
  
  if (code.includes('int x = "hello"')) {
    newErrors.semantic.push("Line 4: Type mismatch. Cannot assign string literal to 'int'.");
  }
  if (code.match(/printf\([^"]*\)/)) {
    newErrors.semantic.push("Line 5: Invalid format string inside printf().");
  }

  return newErrors;
}

export function calculateDiagnostics(code) {
  const markers = [];

  function indexToPos(idx) {
    const before = code.slice(0, idx);
    const lines = before.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    return { line, col };
  }

  // Unrecognized token @@
  let searchIdx = 0;
  while ((searchIdx = code.indexOf('@@', searchIdx)) !== -1) {
    const start = indexToPos(searchIdx);
    const end = indexToPos(searchIdx + 2);
    markers.push({ startLineNumber: start.line, startColumn: start.col, endLineNumber: end.line, endColumn: end.col, message: "Unrecognized token '@@'", severity: 'error', suggestedFix: "Remove the '@@' token or replace with valid code." });
    searchIdx += 2;
  }

  // Unbalanced braces
  let braceCount = 0;
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') braceCount++;
    else if (code[i] === '}') braceCount--;
  }
  if (braceCount > 0) {
    const pos = indexToPos(code.length - 1);
    markers.push({ startLineNumber: pos.line, startColumn: Math.max(1, pos.col - 1), endLineNumber: pos.line, endColumn: pos.col, message: "Expected '}' to close function or block.", severity: 'error', suggestedFix: "Add a closing '}' to match an opening brace." });
  }

  const ifIdx = code.indexOf('if (');
  if (ifIdx !== -1) {
    const closeParenIdx = code.indexOf(')', ifIdx);
    if (closeParenIdx === -1) {
      const start = indexToPos(ifIdx);
      markers.push({ startLineNumber: start.line, startColumn: start.col, endLineNumber: start.line, endColumn: start.col + 3, message: "Expected ')' to close if condition.", severity: 'error', suggestedFix: "Add a closing ')' after the if condition." });
    }
  }

  // Type mismatch
  const mismatchIdx = code.indexOf('int ');
  if (mismatchIdx !== -1) {
    const strMatch = code.match(/int\s+[a-zA-Z_][\w]*\s*=\s*"[^"]*"/);
    if (strMatch) {
      const start = indexToPos(code.indexOf(strMatch[0]));
      const end = indexToPos(code.indexOf(strMatch[0]) + strMatch[0].length);
        markers.push({ startLineNumber: start.line, startColumn: start.col, endLineNumber: end.line, endColumn: end.col, message: "Type mismatch: assigning string to int.", severity: 'error', suggestedFix: "Change variable type to const char* or assign an integer value instead." });
    }
  }

  const printfRegex = /printf\s*\(([^)]*)\)/g;
  let pm;
  while ((pm = printfRegex.exec(code)) !== null) {
    const inside = pm[1];
    if (inside.includes('"') && !inside.includes('%')) {
      const start = indexToPos(pm.index);
      const end = indexToPos(pm.index + pm[0].length);
      markers.push({ startLineNumber: start.line, startColumn: start.col, endLineNumber: end.line, endColumn: end.col, message: "printf may be missing format specifier '%' for provided arguments.", severity: 'warning', suggestedFix: "Add an appropriate format specifier, e.g. printf(\"%s\\n\", str);" });
    }
  }

  return markers;
}

export const getTokenColor = (type) => {
  switch(type) {
    case 'KEYWORD': return '#66fcf1';
    case 'IDENTIFIER': return '#10b981';
    case 'NUMBER': return '#ef4444';
    case 'STRING': return '#f59e0b';
    case 'OPERATOR': return '#c084fc';
    case 'PREPROCESSOR': return '#93c5fd';
    default: return '#c5c6c7';
  }
};

export function generateAST(code) {
  const root = { type: 'Program', name: 'Program', children: [] };
  const lines = code.split('\n');

  lines.forEach(line => {
    const t = line.trim();
    if (t.startsWith('#')) {
      root.children.push({ type: 'Preprocessor', name: t.replace(/^#/, '').trim(), children: [] });
    }
  });

  const codeStr = code;
  const funcRegex = /(int|void|char|float)\s+([a-zA-Z_][\w]*)\s*\(([^)]*)\)\s*\{/g;
  let match;
  while ((match = funcRegex.exec(codeStr)) !== null) {
    const returnType = match[1];
    const name = match[2];
    const startIdx = match.index + match[0].length - 1; 

    let braceCount = 1;
    let i = startIdx + 1;
    while (i < codeStr.length && braceCount > 0) {
      if (codeStr[i] === '{') braceCount++;
      else if (codeStr[i] === '}') braceCount--;
      i++;
    }
    const body = codeStr.slice(startIdx + 1, i - 1);

    const funcNode = { type: 'FunctionDeclaration', name, returnType, children: [] };

    const varRegex = /(int|float|char)\s+([a-zA-Z_][\w]*)\s*(=\s*([^;]+))?\s*;/g;
    let vmatch;
    while ((vmatch = varRegex.exec(body)) !== null) {
      funcNode.children.push({ type: 'VariableDeclaration', name: vmatch[2], dataType: vmatch[1], value: vmatch[4] ? vmatch[4].trim() : undefined, children: [] });
    }

    const callRegex = /([a-zA-Z_][\w]*)\s*\(/g;
    let cmatch;
    while ((cmatch = callRegex.exec(body)) !== null) {
      const callName = cmatch[1];
      if (!['if', 'for', 'while', 'switch', 'return'].includes(callName)) {
        funcNode.children.push({ type: 'FunctionCall', name: callName, children: [] });
      }
    }

    const returnRegex = /return\s+([^;]+);/g;
    let rmatch;
    while ((rmatch = returnRegex.exec(body)) !== null) {
      funcNode.children.push({ type: 'ReturnStatement', value: rmatch[1].trim(), children: [] });
    }

    root.children.push(funcNode);
  }

  return root;
}

export function estimateResources(code, executionTimeMs = 0, response = {}) {
  const body = code;
  const nestedFor = /for\s*\([^{]*\)\s*\{[\s\S]*for\s*\([^{]*\)/.test(body);
  const nestedWhile = /while\s*\([^{]*\)\s*\{[\s\S]*while\s*\([^{]*\)/.test(body);
  let timeComplexity = 'O(1)';
  if (nestedFor || nestedWhile) timeComplexity = 'O(n^2)';
  else if (/for\s*\(|while\s*\(/.test(body)) timeComplexity = 'O(n)';

  const output = (response.program_output || '') + (response.program_error || '');
  const outputBytes = new Blob([output]).size || output.length;
  const codeBytes = new Blob([code]).size || code.length;
  const estimatedMemoryKB = Math.max(4, Math.round((outputBytes + codeBytes) / 1024));

  return {
    timeComplexity,
    executionTimeMs,
    memoryKB: estimatedMemoryKB,
    raw: { outputBytes, codeBytes }
  };
}

export function analyzeCodeQuality(code) {
  const warnings = [];

  // Missing stdio include when printf is used
  if (/printf\s*\(/.test(code) && !/#include\s*<stdio\.h>/.test(code)) {
    warnings.push({
      id: 'missing-stdio',
      severity: 'warning',
      message: 'Using printf without including <stdio.h>.',
      suggestion: 'Add #include <stdio.h> at the top of your file.',
      fix: '#include <stdio.h>\n'
    });
  }

  // int main without return
  const mainMatch = code.match(/int\s+main\s*\([^)]*\)\s*\{([\s\S]*?)\}/);
  if (mainMatch) {
    const body = mainMatch[1];
    if (!/return\s+/.test(body)) {
      warnings.push({
        id: 'missing-return-main',
        severity: 'info',
        message: "Function 'main' does not have an explicit return statement.",
        suggestion: "Add 'return 0;' at the end of main to indicate successful execution.",
        fix: '...\n    return 0;\n}'
      });
    }
  }

  const magicMatches = [...code.matchAll(/([^_\w])([2-9][0-9]*)([^_\w])/g)];
  if (magicMatches.length > 0) {
    warnings.push({
      id: 'magic-numbers',
      severity: 'info',
      message: `Found ${magicMatches.length} numeric literal(s) that may be magic numbers.`,
      suggestion: 'Consider defining named constants using #define or const variables for readability.',
      fix: '// Example:\n#define BUFFER_SIZE 256\n// use BUFFER_SIZE instead of 256'
    });
  }

  if (/\bgets\s*\(/.test(code)) {
    warnings.push({ id: 'danger-gets', severity: 'error', message: 'Use of gets() which is unsafe and removed from C11.', suggestion: 'Use fgets() with a size limit instead.', fix: `char buf[256];\nfgets(buf, sizeof(buf), stdin);` });
  }
  if (/\bstrcpy\s*\(/.test(code)) {
    warnings.push({ id: 'danger-strcpy', severity: 'warning', message: 'Use of strcpy() can cause buffer overflows.', suggestion: 'Use strncpy() or strlcpy() and ensure buffer sizes are respected.', fix: `strncpy(dest, src, dest_size-1);\ndest[dest_size-1] = '\\0';` });
  }

  const funcMatches = [...code.matchAll(/(int|void|char|float)\s+[a-zA-Z_][\w]*\s*\([^)]*\)\s*\{([\s\S]*?)\}/g)];
  funcMatches.forEach(m => {
    const body = m[2];
    const lines = body.split('\n').length;
    if (lines > 60) {
      warnings.push({ id: 'long-function', severity: 'info', message: `Function appears long (${lines} lines).`, suggestion: 'Consider refactoring into smaller helper functions for readability and maintainability.', fix: '// Extract helper functions to reduce complexity' });
    }
  });

  const longLine = code.split('\n').find(l => l.length > 200);
  if (longLine) {
    warnings.push({ id: 'long-line', severity: 'info', message: 'Found very long line(s).', suggestion: 'Wrap long lines or split complex expressions into multiple statements.', fix: '// Wrap long lines for readability' });
  }

  const printfRegex = /printf\s*\(([^)]*)\)/g;
  let pm;
  while ((pm = printfRegex.exec(code)) !== null) {
    const inside = pm[1];
    if (inside.includes('\"') && !inside.includes('%')) {
      warnings.push({ id: 'printf-format', severity: 'warning', message: 'printf may be missing format specifier for provided arguments.', suggestion: 'Add appropriate format specifiers like %d, %s.', fix: 'printf("%s", str);' });
    }
  }

  return warnings;
}
