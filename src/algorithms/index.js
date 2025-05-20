// src/algorithms/index.js

// Import algorithm functions
import { bfs, getNodesInShortestPathOrder } from './bfs'; // getNodesInShortestPathOrder is also here
import { dijkstra } from './dijkstra';
import { astar } from './astar';
import { dfs } from './dfs';
import { bidirectionalBFS } from './bidirectionalBFS';
// Note: recursiveDivisionMaze is usually called directly, not part of pathfinding algos map.

// Export a map of available built-in pathfinding algorithms
// Key: Used for state management and dropdown option values
// name: Display name for the UI
// func: The actual algorithm function
export const builtInAlgorithms = {
    BFS: {
        name: 'BFS',
        func: bfs
    },
    DIJKSTRA: {
        name: 'Dijkstra',
        func: dijkstra
    },
    A_STAR: {
        name: 'A*', // A-Star
        func: astar
    },
    DFS: {
        name: 'DFS',
        func: dfs
    },
    BIDIRECTIONAL_BFS: {
        name: 'Bidirectional BFS',
        func: bidirectionalBFS
    },
    // Add more algorithms here later as they are implemented
    // e.g., GREEDY_BFS: { name: 'Greedy Best-First', func: greedyBFS },
};

// Export utility functions that might be shared or used by the visualizer
export { getNodesInShortestPathOrder };