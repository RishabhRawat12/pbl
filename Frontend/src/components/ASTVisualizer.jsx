import { useRef, useEffect } from 'react';
import { DataSet, Network } from 'vis-network/standalone';

function buildVisData(ast) {
  const nodes = [];
  const edges = [];
  let idCounter = 1;

  function nextId() { return idCounter++; }

  function visit(node, parentId = null) {
    const id = nextId();
    const labelParts = [];
    if (node.type) labelParts.push(node.type);
    if (node.name) labelParts.push(node.name);
    if (node.returnType) labelParts.push('-> ' + node.returnType);
    if (node.dataType) labelParts.push(node.dataType);

    // color map based on node type
    const colorMap = {
      Program: '#93c5fd',
      Preprocessor: '#f59e0b',
      FunctionDeclaration: '#60a5fa',
      VariableDeclaration: '#10b981',
      FunctionCall: '#f472b6',
      ReturnStatement: '#fb7185'
    };

    const bg = colorMap[node.type] || '#66fcf1';

    // compute readable font color (black for light bg, white for dark bg)
    function hexToRgb(hex) {
      const h = hex.replace('#', '');
      const bigint = parseInt(h, 16);
      return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    }
    function luminance({ r, g, b }) {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    }

    const lum = luminance(hexToRgb(bg));
    const fontColor = lum > 0.5 ? '#000' : '#fff';

    nodes.push({ id, label: labelParts.join(' '), shape: 'box', color: { background: bg, border: '#0f172a' }, font: { color: fontColor } });
    if (parentId) edges.push({ from: parentId, to: id });

    // ensure edges have white color for visibility
    if (parentId) {
      const last = edges[edges.length - 1];
      last.color = { color: '#ffffff', highlight: '#ffffff', hover: '#ffffff', opacity: 1 };
    }

    if (Array.isArray(node.children)) {
      node.children.forEach(child => visit(child, id));
    }
    return id;
  }

  visit(ast, null);
  return { nodes: new DataSet(nodes), edges: new DataSet(edges) };
}

export default function ASTVisualizer({ ast }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!ast || !containerRef.current) return;
    const { nodes, edges } = buildVisData(ast);

    const data = { nodes, edges };
    const options = {
      layout: { hierarchical: { enabled: true, direction: 'UD', sortMethod: 'directed' } },
      nodes: { shape: 'box', margin: 8, font: { multi: true } },
      edges: { color: { color: '#ffffff', highlight: '#ffffff', hover: '#ffffff', opacity: 1 }, arrows: { to: { enabled: true } }, smooth: { type: 'cubicBezier' } },
      interaction: { hover: true, navigationButtons: true, keyboard: true }
    };

    if (networkRef.current) networkRef.current.destroy();
    networkRef.current = new Network(containerRef.current, data, options);
  }, [ast]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
