import { useState, useMemo } from "react";
import HeatmapView from "./HeatmapView";
import GraphView from "./GraphView";

type AttentionData = {
  tokens: string[];
  attentions: number[][][][]; // [layer][head][token][token]
  num_layers: number;
  num_heads: number;
};

export default function AttentionVisualizer({ data }: { data: AttentionData }) {
  const [layer, setLayer] = useState(0);
  const [head, setHead] = useState(0);
  const [viewMode, setViewMode] = useState<"heatmap" | "graph">("heatmap");
  const [hoveredToken, setHoveredToken] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);

  // Extract the specific attention matrix for the selected layer and head
  const attentionMatrix = useMemo(() => {
    return data.attentions[layer][head];
  }, [data, layer, head]);

  const activeToken = selectedToken !== null ? selectedToken : hoveredToken;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar - Controls */}
      <div className="w-64 flex-none bg-surface border-r border-surface-hover p-4 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-base font-semibold uppercase text-gray-400 mb-3 tracking-wider">Controls</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-base text-gray-300">Layer</label>
                <span className="text-base text-primary font-mono">{layer + 1} / {data.num_layers}</span>
              </div>
              <input
                type="range"
                min={0}
                max={data.num_layers - 1}
                value={layer}
                onChange={(e) => setLayer(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-base text-gray-300">Head</label>
                <span className="text-base text-primary font-mono">{head + 1} / {data.num_heads}</span>
              </div>
              <input
                type="range"
                min={0}
                max={data.num_heads - 1}
                value={head}
                onChange={(e) => setHead(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {Array.from({ length: data.num_heads }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHead(i)}
                    className={`w-6 h-6 text-xs rounded flex items-center justify-center transition-colors ${
                      head === i ? 'bg-primary text-white' : 'bg-surface-hover text-gray-400 hover:bg-[#3f3f46]'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="text-base text-gray-300 mb-2 block">View Mode</label>
              <div className="flex bg-surface-hover rounded-lg p-1">
                <button
                  className={`flex-1 py-1.5 text-base rounded-md transition-all ${viewMode === 'heatmap' ? 'bg-surface shadow text-white' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setViewMode('heatmap')}
                >
                  Heatmap
                </button>
                <button
                  className={`flex-1 py-1.5 text-base rounded-md transition-all ${viewMode === 'graph' ? 'bg-surface shadow text-white' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setViewMode('graph')}
                >
                  Graph
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-primary">
            <p className="font-semibold mb-1">Interactive mode</p>
            <p className="opacity-80">Hover over tokens to see connections. Click a token to lock selection.</p>
          </div>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="flex-1 relative bg-background overflow-hidden flex flex-col">
        {/* Token Strip */}
        <div className="p-4 bg-surface/50 border-b border-surface-hover flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {data.tokens.map((token, i) => (
            <div
              key={i}
              className={`px-3 py-1.5 rounded text-base cursor-pointer transition-all border ${
                selectedToken === i 
                  ? 'bg-primary text-zinc-900 border-primary font-medium shadow-[0_0_10px_rgba(234,179,8,0.5)]' 
                  : hoveredToken === i 
                    ? 'bg-surface-hover text-white border-gray-600'
                    : 'bg-transparent text-gray-400 border-transparent hover:border-gray-700'
              }`}
              onMouseEnter={() => setHoveredToken(i)}
              onMouseLeave={() => setHoveredToken(null)}
              onClick={() => setSelectedToken(selectedToken === i ? null : i)}
            >
              {token.replace('##', '')}
            </div>
          ))}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          {viewMode === "heatmap" ? (
            <HeatmapView 
              tokens={data.tokens} 
              matrix={attentionMatrix} 
              activeToken={activeToken}
              onTokenHover={setHoveredToken}
              onTokenClick={(i) => setSelectedToken(selectedToken === i ? null : i)}
            />
          ) : (
            <GraphView 
              tokens={data.tokens} 
              matrix={attentionMatrix} 
              activeToken={activeToken}
              onTokenHover={setHoveredToken}
              onTokenClick={(i) => setSelectedToken(selectedToken === i ? null : i)}
            />
          )}
        </div>
      </div>

      {/* Right Sidebar - Token Details */}
      {activeToken !== null && (
        <div className="w-80 flex-none bg-surface border-l border-surface-hover p-4 overflow-y-auto shadow-xl z-20 transition-all">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold uppercase text-gray-400 tracking-wider">Token Details</h2>
            {selectedToken !== null && (
              <button 
                onClick={() => setSelectedToken(null)}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="bg-background rounded-lg p-3 border border-surface-hover mb-4">
            <p className="text-sm text-gray-500 mb-1">Selected Token</p>
            <p className="text-2xl font-mono text-white">{data.tokens[activeToken]}</p>
            <p className="text-sm text-gray-500 mt-2">Index: {activeToken}</p>
          </div>

          <h3 className="text-sm font-semibold text-gray-400 mb-2">Top Attended To (Outgoing)</h3>
          <div className="space-y-1 mb-4 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
            {attentionMatrix[activeToken]
              .map((val, idx) => ({ val, idx }))
              .sort((a, b) => b.val - a.val)
              .slice(0, 10)
              .map(({ val, idx }) => (
                <div key={idx} className="flex items-center justify-between text-base group">
                  <span className="font-mono text-gray-300 group-hover:text-white transition-colors truncate pr-2">
                    {data.tokens[idx]}
                  </span>
                  <div className="flex items-center gap-2 w-28">
                    <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${Math.min(100, val * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-10 text-right">{(val * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
          </div>

          <h3 className="text-sm font-semibold text-gray-400 mb-2">Top Attended From (Incoming)</h3>
          <div className="space-y-1 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
            {attentionMatrix
              .map((row, idx) => ({ val: row[activeToken], idx }))
              .sort((a, b) => b.val - a.val)
              .slice(0, 10)
              .map(({ val, idx }) => (
                <div key={idx} className="flex items-center justify-between text-base group">
                  <span className="font-mono text-gray-300 group-hover:text-white transition-colors truncate pr-2">
                    {data.tokens[idx]}
                  </span>
                  <div className="flex items-center gap-2 w-28">
                    <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#D97706] rounded-full" 
                        style={{ width: `${Math.min(100, val * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-10 text-right">{(val * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
