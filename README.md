# Dijkstra Semicircular Path Tools

This repository contains two complementary implementations of Dijkstra's algorithm on a semi-circular annulus grid:

- `dijkstar.py` — a standalone Python script that computes the shortest path length numerically.
- `visualization.tsx` — a React component that renders and animates the grid, allowing you to explore the path interactively in the browser.

## Requirements

- Python 3.8+ for running the script.
- A React + TypeScript project (React 18 tested) with `lucide-react` installed for the visualization.

## Running the Python Solver

```bash
python3 dijkstar.py
```

The script prints the length of the shortest path (in meters) between the designated start and end nodes on the track. No additional dependencies are required beyond the Python standard library (`math` and `heapq`).

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

- Both implementations assume a half-ring (180°) track with adjustable inner and outer radii.
- The React component recalculates the path on demand, so no backend communication is required.
- The Python output is a quick way to verify numerical results when integrating or testing the frontend.
