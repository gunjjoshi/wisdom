import React, { useEffect, useRef } from "react";

type GraphProps = {
  tokens: string[];
  matrix: number[][];
  activeToken: number | null;
  onTokenHover: (idx: number | null) => void;
  onTokenClick: (idx: number) => void;
};

export default function GraphView({ tokens, matrix, activeToken, onTokenHover, onTokenClick }: GraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<{x: number, y: number, r: number, idx: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const n = tokens.length;
    
    // Auto-size
    const size = Math.min(container.clientWidth, container.clientHeight) - 40;
    
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 40; // Padding for text

    // Pre-calculate node positions
    const nodes = [];
    for (let i = 0; i < n; i++) {
      // Start from top (-Math.PI/2) and go clockwise
      const angle = -Math.PI / 2 + (i / n) * 2 * Math.PI;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      nodes.push({ x, y, r: 12, idx: i, angle });
    }
    nodesRef.current = nodes;

    // 1. Draw edges
    ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const val = matrix[i][j];
        if (val < 0.05 && activeToken === null) continue; // Filter out noise for clarity

        let strokeStyle = `rgba(234, 179, 8, ${val})`; // Primary color

        if (activeToken !== null) {
          if (i === activeToken) {
            strokeStyle = `rgba(234, 179, 8, ${Math.max(0.1, val)})`; // Highlight outgoing
          } else if (j === activeToken) {
            strokeStyle = `rgba(217, 119, 6, ${Math.max(0.1, val)})`; // Highlight incoming
          } else {
            continue; // Hide other edges when token is active
          }
        }

        ctx.beginPath();
        ctx.strokeStyle = strokeStyle;
        
        // Draw quadratic curve towards center to make it look nicer than straight lines
        const cpX = cx;
        const cpY = cy;
        
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.quadraticCurveTo(cpX, cpY, nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }

    // 2. Draw nodes
    for (let i = 0; i < n; i++) {
      const node = nodes[i];
      const isActive = activeToken === i;
      const isHovered = activeToken === null && false; // We can add hover state if needed
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, 2 * Math.PI);
      
      if (isActive) {
        ctx.fillStyle = "#EAB308"; // Primary
        ctx.shadowColor = "#EAB308";
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = "#27272a"; // Surface hover
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
      ctx.strokeStyle = isActive ? "#18181b" : "#3f3f46";
      ctx.stroke();
      
      ctx.shadowBlur = 0; // reset

      // 3. Draw text
      ctx.fillStyle = isActive ? "#18181b" : "#a1a1aa";
      ctx.font = isActive ? "bold 12px monospace" : "11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Position text outside the circle
      const textRadius = radius + 25;
      const tx = cx + textRadius * Math.cos(node.angle);
      const ty = cy + textRadius * Math.sin(node.angle);
      
      // Rotate text
      ctx.save();
      ctx.translate(tx, ty);
      let textAngle = node.angle;
      if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
        textAngle += Math.PI;
      }
      ctx.rotate(textAngle);
      ctx.fillText(tokens[i].replace("##", ""), 0, 0);
      ctx.restore();
    }
    
  }, [tokens, matrix, activeToken]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find hovered node
    let found = null;
    for (const node of nodesRef.current) {
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx * dx + dy * dy <= node.r * node.r * 4) { // slightly larger hit area
        found = node.idx;
        break;
      }
    }

    onTokenHover(found);
  };

  const handleMouseLeave = () => {
    onTokenHover(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    let found = null;
    for (const node of nodesRef.current) {
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx * dx + dy * dy <= node.r * node.r * 4) {
        found = node.idx;
        break;
      }
    }

    if (found !== null) {
      onTokenClick(found);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center relative p-8 h-full w-full" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
    </div>
  );
}
