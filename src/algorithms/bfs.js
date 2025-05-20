// src/algorithms/bfs.js

// Breadth-First Search implementation
export function bfs(grid, startNode, finishNode) {
    const visitedNodesInOrder = []; // Order of visited nodes for animation
    const queue = []; // Queue for BFS
  
    // Create a copy of the grid to avoid mutating the original state directly
    // and to reset temporary algorithm-specific properties for this run.
    const gridCopy = grid.map(row =>
      row.map(node => ({
        ...node,
        distance: Infinity,   // Distance from startNode for BFS
        previousNode: null, // To reconstruct path
        isVisitedForAlgo: false, // Algorithm-specific visited flag
      }))
    );
  
    // Get the actual start and finish node objects from our copied grid
    const startNodeCopy = gridCopy[startNode.row][startNode.col];
    const finishNodeCopy = gridCopy[finishNode.row][finishNode.col];
  
    startNodeCopy.distance = 0;
    startNodeCopy.isVisitedForAlgo = true;
    queue.push(startNodeCopy);
  
    while (queue.length > 0) {
      const currentNode = queue.shift(); // Dequeue
  
      // If wall, skip
      if (currentNode.isWall) continue;
  
      // Add to visited order for animation (if not already, though BFS structure helps)
      // This ensures we only add nodes that are actually processed (not walls)
      if (!visitedNodesInOrder.includes(currentNode)) {
         visitedNodesInOrder.push(currentNode);
      }
  
  
      // If we reached the finish node
      if (currentNode.row === finishNodeCopy.row && currentNode.col === finishNodeCopy.col) {
        return visitedNodesInOrder; // Path found
      }
  
      // Get neighbors
      const neighbors = getUnvisitedNeighbors(currentNode, gridCopy);
      for (const neighbor of neighbors) {
        neighbor.isVisitedForAlgo = true; // Mark neighbor as visited
        neighbor.distance = currentNode.distance + 1;
        neighbor.previousNode = currentNode; // Set predecessor
        queue.push(neighbor); // Enqueue
      }
    }
  
    // If the queue becomes empty and we haven't found the finish node
    return visitedNodesInOrder; // Return all visited nodes even if path not found
  }
  
  function getUnvisitedNeighbors(node, grid) {
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
  
    // Filter out already visited (by this algo run) neighbors
    return neighbors.filter(neighbor => !neighbor.isVisitedForAlgo);
  }
  
  
  // Backtracks from the finishNode to find the shortest path.
  // Only works if the previousNode attribute has been set correctly by the algorithm.
  export function getNodesInShortestPathOrder(finishNode) {
    const nodesInShortestPathOrder = [];
    let currentNode = finishNode; // This is the node object from the algorithm's gridCopy
  
     // Check if finishNode exists and has been reached (has a predecessor or is the start)
     if (!currentNode || (currentNode.previousNode === null && !currentNode.isStart)) {
         // If finishNode has no predecessor AND it's not the start node, no path was found.
         return []; // Return empty array for no path
     }
  
    while (currentNode !== null) {
      nodesInShortestPathOrder.unshift(currentNode); // Add to the beginning of the array
      currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
  }