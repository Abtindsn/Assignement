# assignment1_shortest_path_explained.py -- Dijkstra algorithm

import math
import heapq

def find_shortest_path():
    """Dijkstra on a semicircular annulus grid; returns shortest path length (m)."""

    # Track parameters
    inner_radius = 7.0
    outer_radius = 10.0
    num_points_across = 24   # H
    num_points_along = 128   # K

    # Grid steps
    radial_step = (outer_radius - inner_radius) / (num_points_across - 1)
    angular_step = math.pi / (num_points_along - 1)

    # Precompute Cartesian coords for each (i, j)
    coordinates = {}
    for i in range(num_points_across):
        radius = inner_radius + i * radial_step
        for j in range(num_points_along):
            angle = j * angular_step
            coordinates[(i, j)] = (radius * math.cos(angle), radius * math.sin(angle))

    # Start/goal
    start_point = (num_points_across - 1, 0)
    end_point = (num_points_across - 1, num_points_along - 1)

    # Dijkstra init
    distances = {p: float('inf') for p in coordinates}
    distances[start_point] = 0.0
    priority_queue = [(0.0, start_point)]
    neighbor_moves = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]

    # Main loop
    while priority_queue:
        current_distance, current_point = heapq.heappop(priority_queue)
        if current_distance > distances[current_point]:
            continue
        if current_point == end_point:
            return current_distance

        i, j = current_point
        x1, y1 = coordinates[current_point]
        for di, dj in neighbor_moves:
            neighbor_point = (i + di, j + dj)
            if neighbor_point in coordinates:
                x2, y2 = coordinates[neighbor_point]
                step_distance = math.hypot(x2 - x1, y2 - y1)
                nd = current_distance + step_distance
                if nd < distances[neighbor_point]:
                    distances[neighbor_point] = nd
                    heapq.heappush(priority_queue, (nd, neighbor_point))

    return -1

if __name__ == "__main__":
    shortest_length = find_shortest_path()
    if shortest_length != -1:
        print(f"The length of the shortest path is: {shortest_length:.6f} meters.")
    else:
        print("A path to the goal could not be found.")
