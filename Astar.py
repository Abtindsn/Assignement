# assignment1_shortest_path_explained.py -- A* pathfinder on a semicircular annulus grid

import math
import heapq


def find_shortest_path():
    """A* on a semicircular annulus grid; returns shortest path length (meters)."""

    # --- Track/grid parameters (fixed by the assignment) ---
    inner_radius = 7.0
    outer_radius = 10.0
    num_points_across = 24  # H: radial samples (rows)
    num_points_along = 128  # K: angular samples (cols)

    # --- Uniform sampling in polar coordinates over [r=I..O], [θ=0..π] ---
    radial_step = (outer_radius - inner_radius) / (num_points_across - 1)
    angular_step = math.pi / (num_points_along - 1)

    # --- Precompute Cartesian (x,y) for each grid node (i,j) ---
    # Using actual Euclidean geometry ensures edge weights are true straight-line distances.
    coordinates = {}
    for i in range(num_points_across):
        r = inner_radius + i * radial_step
        for j in range(num_points_along):
            theta = j * angular_step
            coordinates[(i, j)] = (r * math.cos(theta), r * math.sin(theta))

    # --- Start (outer-right) and goal (outer-left) ---
    start_point = (num_points_across - 1, 0)
    end_point = (num_points_across - 1, num_points_along - 1)
    xg, yg = coordinates[end_point]

    # --- A* state: g-costs (start→node cost); priority queue ordered by f = g + h ---
    g_cost = {p: float("inf") for p in coordinates}
    g_cost[start_point] = 0.0

    # Admissible & consistent heuristic: straight-line distance to the goal in ℝ²
    def h(point):
        x, y = coordinates[point]
        return math.hypot(xg - x, yg - y)

    # PQ items: (f, g, point). Start with f = h(start), g = 0
    priority_queue = [(h(start_point), 0.0, start_point)]

    # 8-connected neighborhood (dx, dy in index space)
    neighbor_moves = [
        (-1, -1),
        (-1, 0),
        (-1, 1),
        (0, -1),
        (0, 1),
        (1, -1),
        (1, 0),
        (1, 1),
    ]

    # --- Main A* loop ---
    while priority_queue:
        f_cur, g_cur, u = heapq.heappop(priority_queue)

        # Skip stale entries if we already have a better g for this node
        if g_cur > g_cost[u]:
            continue

        # Goal popped → optimal by A* with consistent heuristic
        if u == end_point:
            return g_cur

        ui, uj = u
        x1, y1 = coordinates[u]

        # Relax all valid neighbors
        for di, dj in neighbor_moves:
            v = (ui + di, uj + dj)
            if v not in coordinates:
                continue

            x2, y2 = coordinates[v]
            step = math.hypot(x2 - x1, y2 - y1)  # edge weight in ℝ²
            ng = g_cur + step  # tentative g via u

            if ng < g_cost[v]:
                g_cost[v] = ng
                fv = ng + h(v)  # f = g + h
                heapq.heappush(priority_queue, (fv, ng, v))

    # No path found (shouldn't occur on this connected grid)
    return -1


# --- Driver: run and print the length with 6 decimals ---
if __name__ == "__main__":
    shortest_length = find_shortest_path()
    if shortest_length != -1:
        print(f"The length of the shortest path is: {shortest_length:.6f} meters.")
    else:
        print("A path to the goal could not be found.")
