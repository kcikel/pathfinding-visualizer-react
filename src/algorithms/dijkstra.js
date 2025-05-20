// src/algorithms/dijkstra.js

// Basic Priority Queue implementation (Min-Heap based on distance)
// For better performance with many nodes, a more efficient heap implementation is recommended.
class PriorityQueue {
    constructor() {
      this.nodes = [];
    }
  
    enqueue(node) {
      this.nodes.push(node);
      this.sort(); // Simple sort for basic functionality
    }
  
    dequeue() {
      return this.nodes.shift(); // Simple shift
    }
  
    sort() {
      this.nodes.sort((a, b) => a.distance - b.distance); // Sort by distance
    }
  
    isEmpty() {
      return !this.nodes.length;
    }
  }
  
  export function dijkstra(grid, startNode, finishNode) {
    const visitedNodesInOrder = []; // Order nodes are finalized/settled
    const unvisitedNodes = new PriorityQueue();
  
    // Create a fresh copy of the grid for this algorithm run
    // Initialize distances and predecessors on this copy
    const gridCopy = grid.map(row =>
      row.map(node => ({
        ...node,
        distance: Infinity,     // Cost from start to this node
        previousNode: null,   // To reconstruct path
        isVisitedForAlgo: false, // Algorithm-specific visited flag
      }))
    );
  
    const startNodeCopy = gridCopy[startNode.row][startNode.col];
    const finishNodeCopy = gridCopy[finishNode.row][finishNode.col]; // Not strictly needed here, but good for consistency
  
    startNodeCopy.distance = 0;
    unvisitedNodes.enqueue(startNodeCopy);
  
    while (!unvisitedNodes.isEmpty()) {
      const currentNode = unvisitedNodes.dequeue();
  
      // If this node is a wall, skip it
      if (currentNode.isWall) continue;
  
      // If the closest node is at Infinity distance, all remaining unvisited nodes are unreachable.
      if (currentNode.distance === Infinity) return visitedNodesInOrder;
  
      // If already visited (settled), skip. Important for basic PQs that might re-add nodes.
      if (currentNode.isVisitedForAlgo) continue;
  
      currentNode.isVisitedForAlgo = true; // Mark as visited (settled)
      visitedNodesInOrder.push(currentNode);
  
      // If we reached the finish node
      if (currentNode.row === finishNodeCopy.row && currentNode.col === finishNodeCopy.col) {
        return visitedNodesInOrder; // Path found
      }
  
      updateUnvisitedNeighbors(currentNode, gridCopy, unvisitedNodes);
    }
  
    // If the loop finishes and finish node not reached
    return visitedNodesInOrder; // Return all visited nodes processed
  }
  
  function updateUnvisitedNeighbors(node, grid, queue) {
    const neighbors = getNeighbors(node, grid);
    for (const neighbor of neighbors) {
      // If neighbor is already settled/visited by Dijkstra, skip
      if (neighbor.isVisitedForAlgo) continue;
  
      // Calculate new distance to neighbor: current node's distance + weight of edge to neighbor
      // For a grid, the "edge" weight is effectively the weight of the neighbor node itself.
      const distanceToNeighbor = node.distance + neighbor.weight;
  
      if (distanceToNeighbor < neighbor.distance) {
        neighbor.distance = distanceToNeighbor;
        neighbor.previousNode = node;
        // For a more efficient PQ, you might update the node's priority.
        // With a simple array-based PQ, re-enqueuing and re-sorting works.
        queue.enqueue(neighbor);
      }
    }
  }
  
  function getNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
  
    // Up
    if (row > 0) neighbors.push(grid[row - 1][col]);
    // Down
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    // Left
    if (col > 0) neighbors.push(grid[row][col - 1]);
    // Right
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  
    // Filter out neighbors that are walls (visited check done in updateUnvisitedNeighbors)
    return neighbors.filter(neighbor => !neighbor.isWall);
  }
  
  // Note: getNodesInShortestPathOrder function is in bfs.js and will be imported
  // via algorithms/index.js. It relies on the 'previousNode' property.
  