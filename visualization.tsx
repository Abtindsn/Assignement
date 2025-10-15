import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

type PathNode = [number, number];

type GridPoint = {
  screenX: number;
  screenY: number;
  i: number;
  j: number;
  cartX: number;
  cartY: number;
  radius: number;
  angle: number;
};

const PathGridVisualizer = () => {
  const [K, setK] = useState(128);
  const [H, setH] = useState(24);
  const [I, setI] = useState(7);
  const [O, setO] = useState(10);
  const [showPath, setShowPath] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [pathProgress, setPathProgress] = useState(0);
  const [shortestPath, setShortestPath] = useState<PathNode[]>([]);
  const [pathLength, setPathLength] = useState<number | null>(null);
  const [computing, setComputing] = useState(false);

  const canvasSize = 600;
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  const scale = canvasSize / (O * 2.5);

  // Generate grid points with (i, j) indices
  const generateGrid = (): GridPoint[] => {
    const points: GridPoint[] = [];
    for (let j = 0; j < K; j++) {
      const angle = Math.PI - (j / (K - 1)) * Math.PI;
      for (let i = 0; i < H; i++) {
        const radius = I + (i / (H - 1)) * (O - I);
        const cartX = radius * Math.cos(angle);
        const cartY = radius * Math.sin(angle);
        const screenX = centerX + cartX * scale;
        const screenY = centerY - cartY * scale;
        points.push({ 
          screenX, 
          screenY, 
          i, 
          j, 
          cartX, 
          cartY,
          radius, 
          angle 
        });
      }
    }
    return points;
  };

  const grid = generateGrid();

  // Get grid point by indices
  const getNode = (i: number, j: number): GridPoint | undefined => {
    return grid.find((p) => p.i === i && p.j === j);
  };

  // Get 8 neighbors
  const getNeighbors = (i: number, j: number): PathNode[] => {
    const neighbors: PathNode[] = [];
    for (let di = -1; di <= 1; di++) {
      for (let dj = -1; dj <= 1; dj++) {
        if (di === 0 && dj === 0) continue;
        const ni = i + di;
        const nj = j + dj;
        if (ni >= 0 && ni < H && nj >= 0 && nj < K) {
          neighbors.push([ni, nj]);
        }
      }
    }
    return neighbors;
  };

  // Euclidean distance
  const euclideanDistance = (node1: GridPoint, node2: GridPoint): number => {
    const dx = node1.cartX - node2.cartX;
    const dy = node1.cartY - node2.cartY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Dijkstra's algorithm
  const findShortestPath = () => {
    setComputing(true);
    setShowPath(false);
    setPathProgress(0);
    
    setTimeout(() => {
      const startNode: PathNode = [H - 1, 0]; // outermost, right
      const endNode: PathNode = [H - 1, K - 1]; // outermost, left
      
      // Initialize distances
      const distances: number[][] = Array.from({ length: H }, () => Array(K).fill(Infinity));
      const previous: (PathNode | null)[][] = Array.from({ length: H }, () => Array<PathNode | null>(K).fill(null));
      
      distances[startNode[0]][startNode[1]] = 0;
      
      // Priority queue: [distance, i, j]
      const pq: [number, number, number][] = [[0, startNode[0], startNode[1]]];
      
      const visited = new Set<string>();
      
      while (pq.length > 0) {
        // Sort to get minimum distance (simple priority queue)
        pq.sort((a, b) => a[0] - b[0]);
        const nextNode = pq.shift();
        if (!nextNode) {
          continue;
        }
        const [currentDist, i, j] = nextNode;
        
        const nodeKey = `${i},${j}`;
        if (visited.has(nodeKey)) continue;
        visited.add(nodeKey);
        
        // Check if we reached the end
        if (i === endNode[0] && j === endNode[1]) {
          break;
        }
        
        // Skip if we found a shorter path already
        if (currentDist > distances[i][j]) continue;
        
        // Check all neighbors
        const neighbors = getNeighbors(i, j);
        for (const [ni, nj] of neighbors) {
          const currentNode = getNode(i, j);
          const neighborNode = getNode(ni, nj);
          if (!currentNode || !neighborNode) continue;
          const weight = euclideanDistance(currentNode, neighborNode);
          
          const newDist = distances[i][j] + weight;
          if (newDist < distances[ni][nj]) {
            distances[ni][nj] = newDist;
            previous[ni][nj] = [i, j];
            pq.push([newDist, ni, nj]);
          }
        }
      }
      
      // Reconstruct path
      const path: PathNode[] = [];
      let current: PathNode | null = endNode;
      while (current) {
        path.unshift(current);
        current = previous[current[0]][current[1]];
      }
      
      setShortestPath(path);
      setPathLength(distances[endNode[0]][endNode[1]]);
      setShowPath(true);
      setComputing(false);
    }, 100);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (animating && pathProgress < shortestPath.length) {
      interval = setInterval(() => {
        setPathProgress((prev) => Math.min(prev + 1, shortestPath.length));
      }, 30);
    } else if (pathProgress >= shortestPath.length) {
      setAnimating(false);
    }
    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [animating, pathProgress, shortestPath.length]);

  const handleAnimate = () => {
    if (pathProgress >= shortestPath.length) {
      setPathProgress(0);
    }
    setAnimating(!animating);
  };

  const handleReset = () => {
    setAnimating(false);
    setPathProgress(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-4">Dijkstra's Shortest Path Finder</h2>
      
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-white text-sm mb-1 block">K (angular points): {K}</label>
            <input
              type="range"
              min="8"
              max="128"
              value={K}
              onChange={(e) => {
                setK(Number(e.target.value));
                setShortestPath([]);
                setPathLength(null);
              }}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-white text-sm mb-1 block">H (radial points): {H}</label>
            <input
              type="range"
              min="3"
              max="24"
              value={H}
              onChange={(e) => {
                setH(Number(e.target.value));
                setShortestPath([]);
                setPathLength(null);
              }}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={findShortestPath}
            disabled={computing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded transition flex items-center gap-2"
          >
            <Zap size={16} />
            {computing ? 'Computing...' : 'Find Shortest Path'}
          </button>
          
          {shortestPath.length > 0 && (
            <>
              <button
                onClick={handleAnimate}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition flex items-center gap-2"
              >
                {animating ? <Pause size={16} /> : <Play size={16} />}
                {animating ? 'Pause' : 'Animate'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </>
          )}
        </div>

        {pathLength !== null && (
          <div className="mt-4 p-3 bg-slate-700 rounded">
            <p className="text-white font-bold">Shortest Path Length: {pathLength.toFixed(4)} meters</p>
            <p className="text-slate-300 text-sm">Path contains {shortestPath.length} nodes</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-4">
        <svg width={canvasSize} height={canvasSize} className="mx-auto">
          {/* Track boundaries */}
          <path
            d={`M ${centerX + I * scale} ${centerY} A ${I * scale} ${I * scale} 0 0 0 ${centerX - I * scale} ${centerY}`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <path
            d={`M ${centerX + O * scale} ${centerY} A ${O * scale} ${O * scale} 0 0 0 ${centerX - O * scale} ${centerY}`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Grid points */}
          {grid.map((point, idx) => (
            <circle
              key={idx}
              cx={point.screenX}
              cy={point.screenY}
              r={K > 32 ? 1 : 2}
              fill="#cbd5e1"
              opacity={0.4}
            />
          ))}

          {/* Shortest path lines */}
          {showPath && shortestPath.slice(0, pathProgress || shortestPath.length).map((pathPoint, idx) => {
            if (idx === 0) return null;
            const prevPoint = getNode(shortestPath[idx - 1][0], shortestPath[idx - 1][1]);
            const currPoint = getNode(pathPoint[0], pathPoint[1]);
            if (!prevPoint || !currPoint) return null;
            
            return (
              <line
                key={`line-${idx}`}
                x1={prevPoint.screenX}
                y1={prevPoint.screenY}
                x2={currPoint.screenX}
                y2={currPoint.screenY}
                stroke="#8b5cf6"
                strokeWidth="2.5"
                opacity="0.8"
              />
            );
          })}

          {/* Path nodes */}
          {showPath && shortestPath.slice(0, pathProgress || shortestPath.length).map((pathPoint, idx) => {
            const point = getNode(pathPoint[0], pathPoint[1]);
            if (!point) return null;
            
            const isStart = idx === 0;
            const isEnd = idx === shortestPath.length - 1;
            const isCurrent = idx === pathProgress - 1;
            
            return (
              <circle
                key={`path-${idx}`}
                cx={point.screenX}
                cy={point.screenY}
                r={isStart || isEnd ? 8 : isCurrent ? 6 : 3}
                fill={isStart ? '#ef4444' : isEnd ? '#22c55e' : isCurrent ? '#f59e0b' : '#8b5cf6'}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}

          {/* Labels */}
          <text x={centerX + O * scale + 20} y={centerY} className="text-sm font-bold" fill="#1e293b">START</text>
          <text x={centerX - O * scale - 60} y={centerY} className="text-sm font-bold" fill="#1e293b">END</text>
        </svg>
      </div>

      <div className="mt-4 text-sm text-slate-300">
        <p><span className="text-red-400">●</span> Start (outermost right, i=23, j=0)</p>
        <p><span className="text-green-400">●</span> End (outermost left, i=23, j=127)</p>
        <p><span className="text-purple-400">●</span> Dijkstra's shortest path</p>
        <p className="mt-2 text-xs">Inner radius (I): {I}m | Outer radius (O): {O}m | Span: 180° | Total nodes: {K * H}</p>
      </div>
    </div>
  );
};

export default PathGridVisualizer;
