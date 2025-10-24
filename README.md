# Semicircular Path Tools

This repository contains two complementary shortest-path solvers plus a visualization for the semicircular annulus track used in the assignment:

- `dijkstra.py` — Dijkstra's algorithm implemented in Python for baseline comparisons.
- `Astar.py` — A* search with an admissible Euclidean heuristic to reach the goal faster.
- `visualization.tsx` — a React component that renders and animates the grid, allowing you to explore the path interactively in the browser.

## Requirements

- Python 3.8+ for running the script.
- A React + TypeScript project (React 18 tested) with `lucide-react` installed for the visualization.

## Running the Python Solvers

Run the Dijkstra baseline:

```bash
python3 dijkstra.py
```

Run the A* variant:

```bash
python3 Astar.py
```

Each script prints the length of the shortest path (in meters) between the designated start and end nodes on the track. No additional dependencies are required beyond the Python standard library (`math` and `heapq`).

## Using the React Visualization

1. Install the icon dependency if it is not already present:
   ```bash
   npm install lucide-react
   ```
2. Place `visualization.tsx` in your project's component directory (for example, `src/components/PathGridVisualizer.tsx`).
3. Import and render it inside your application:
   ```tsx
   import PathGridVisualizer from './components/PathGridVisualizer';

   export default function App() {
     return (
       <main className="min-h-screen bg-slate-900 text-white">
         <PathGridVisualizer />
       </main>
     );
   }
   ```

The component provides sliders to adjust the grid density, buttons to compute the path, animate the traversal, and reset the playback. The visualization renders the inner/outer track boundaries, grid nodes, and the computed shortest path using SVG.

## Notes

- Both search implementations assume a half-ring (180°) track with adjustable inner and outer radii.
- A* and Dijkstra use identical edge weights; only the priority-queue ordering changes via the heuristic.
- The React component recalculates the path on demand, so no backend communication is required.
- The Python output is a quick way to verify numerical results when integrating or testing the frontend.
