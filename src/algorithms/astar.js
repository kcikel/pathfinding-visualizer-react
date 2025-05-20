// src/algorithms/astar.js

// Basic Priority Queue implementation (Min-Heap based on 'f' score)
// For better performance with many nodes, a more efficient heap implementation is recommended.
class PriorityQueue {
    constructor() {
      this.nodes = [];
    }
  
    enqueue(node) {
      this.nodes.push(node);
      this.sort();
    }
  
    dequeue() {
      return this.nodes.shift();
    }
  
    sort() {
      this.nodes.sort((a, b) => a.f - b.f); // Sort by f = g + h
    }
  
    isEmpty() {
      return !this.nodes.length;
    }
  }
  
  // Heuristic function (Manhattan distance for grid)
  function manhattanDistance(nodeA, nodeB) {
      const dRow = Math.abs(nodeA.row - nodeB.row);
      const dCol = Math.abs(nodeA.col - nodeB.col);
      return dRow + dCol;
  }
  
  export function astar(grid, startNode, finishNode) {
    const visitedNodesInOrder = []; // Order nodes are evaluated from the open set
    const openSet = new PriorityQueue(); // Nodes to be evaluated
  
    // Create a grid copy to store scores and predecessors per run
    const gridCopy = grid.map(row =>
      row.map(node => ({
        ...node,
        g: Infinity,        // Cost from start to this node
        h: Infinity,        // Heuristic cost from this node to finish
        f: Infinity,        // Total estimated cost (g + h)
        previousNode: null,
        isVisitedForAlgo: false, // Track visited for A* logic (nodes in closed set)
      }))
    );
  
    const startNodeCopy = gridCopy[startNode.row][startNode.col];
    const finishNodeCopy = gridCopy[finishNode.row][finishNode.col];
  
    startNodeCopy.g = 0;
    startNodeCopy.h = manhattanDistance(startNodeCopy, finishNodeCopy);
    startNodeCopy.f = startNodeCopy.g + startNodeCopy.h;
  
    openSet.enqueue(startNodeCopy);
  
    while (!openSet.isEmpty()) {
      const currentNode = openSet.dequeue(); // Node in open set with the lowest fScore
  
      // If current node is a wall or already processed, skip
      if (currentNode.isWall || currentNode.isVisitedForAlgo) {
        continue;
      }
  
      // Mark current node as visited (moved to closed set)
      currentNode.isVisitedForAlgo = true;
      visitedNodesInOrder.push(currentNode);
  
      // If we reached the finish node
      if (currentNode.row === finishNodeCopy.row && currentNode.col === finishNodeCopy.col) {
        return visitedNodesInOrder; // Path found
      }
  
      // Process neighbors
      const neighbors = getNeighbors(currentNode, gridCopy);
      for (const neighbor of neighbors) {
        // If neighbor is already processed (in closed set) or is a wall, skip
        if (neighbor.isVisitedForAlgo || neighbor.isWall) {
          continue;
        }
  
        // The distance from start to a neighbor
        // The G score is the actual cost from the start node to the neighbor node
        const tentativeGScore = currentNode.g + neighbor.weight; // Use neighbor.weight
  
        let newPathIsShorter = false;
        if (tentativeGScore < neighbor.g) { // If this path to neighbor is better than any previous one
          neighbor.g = tentativeGScore;
          newPathIsShorter = true;
        }
  
        // If it's a new path or a shorter path to this neighbor
        if (newPathIsShorter) {
          neighbor.h = manhattanDistance(neighbor, finishNodeCopy);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previousNode = currentNode;
          // If neighbor is not already in openSet, add it.
          // Our simple PQ just re-adds and re-sorts.
          // A more complex PQ might have an 'update' or 'contains' method.
          openSet.enqueue(neighbor);
        }
      }
    }
  
    // Open set is empty but finish not reached (no path)
    return visitedNodesInOrder; // Return nodes visited until failure
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
    // Filter out walls (visited check handled in the main loop for A*)
    return neighbors.filter(neighbor => !neighbor.isWall);
  }
  
  // Note: getNodesInShortestPathOrder function is in bfs.js and will be imported
  // via algorithms/index.js. It relies on the 'previousNode' property.