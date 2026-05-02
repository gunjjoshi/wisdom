import React, { useEffect, useRef } from "react";

type HeatmapProps = {
  tokens: string[];
  matrix: number[][];
  activeToken: number | null;
  onTokenHover: (idx: number | null) => void;
  onTokenClick: (idx: number) => void;
};

export default function HeatmapView({ tokens, matrix, activeToken, onTokenHover, onTokenClick }: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const n = tokens.length;
    
    // Auto-size based on container
    const size = Math.min(container.clientWidth, container.clientHeight) - 40;
    const cellSize = size / n;
    
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.clearRect(0, 0, size, size);

    // Draw cells
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const val = matrix[i][j];
        
        // Base color: Purple
        // If activeToken is set, highlight its row and column
        let opacity = val;
        let r = 234, g = 179, b = 8; // Gold

        if (activeToken !== null) {
          if (i === activeToken) {
            // Outgoing attention (Row)
            r = 234; g = 179; b = 8; // Gold
            opacity = val > 0.05 ? val : 0.05;
          } else if (j === activeToken) {
            // Incoming attention (Col)
            r = 217; g = 119; b = 6; // Copper/Amber Gold
            opacity = val > 0.05 ? val : 0.05;
          } else {
            // Dim others
            opacity = val * 0.1;
          }
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);

        // Grid lines (subtle)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }, [tokens, matrix, activeToken]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const n = tokens.length;
    const cellSize = canvas.width / n;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    // If we want hover to be specific to token, we can just highlight row/col
    // Let's highlight the token corresponding to the diagonal for simplicity, 
    // or just the row if we are hovering a specific cell
    if (col >= 0 && col < n && row >= 0 && row < n) {
       // Just pick row for active token
       onTokenHover(row);
    }
  };

  const handleMouseLeave = () => {
    onTokenHover(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const n = tokens.length;
    const cellSize = canvas.width / n;
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < n) {
       onTokenClick(row);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center relative p-8 h-full w-full" ref={containerRef}>
      <div className="relative flex flex-col items-center">
        {/* Top Labels */}
        <div className="absolute -top-6 left-0 text-xs text-gray-500 transform -translate-y-full w-full text-center">
          Attended To (Keys) &rarr;
        </div>
        {/* Left Labels */}
        <div className="absolute top-1/2 -left-6 text-xs text-gray-500 transform -translate-x-full -translate-y-1/2 -rotate-90">
          Attended From (Queries) &rarr;
        </div>
        
        <canvas
          ref={canvasRef}
          className="bg-surface rounded border border-surface-hover shadow-lg cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}
