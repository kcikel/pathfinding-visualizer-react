// src/algorithms/dfs.js

// Depth-First Search (DFS) implementation (Iterative using Stack)
export function dfs(grid, startNode, finishNode) {
    const visitedNodesInOrder = []; // Order nodes are visited/explored
    const stack = []; // Use a stack for DFS
  
    // Create a grid copy to track visited status and predecessors for this run.
    const gridCopy = grid.map(row =>
      row.map(node => ({
        ...node,
        isVisitedForAlgo: false, // Algorithm-specific visited flag
        previousNode: null,
      }))
    );
  
    const startNodeCopy = gridCopy[startNode.row][startNode.col];
    // No need for finishNodeCopy directly in the algorithm logic, but good for consistency if used
  
    stack.push(startNodeCopy); // Push start node onto the stack
  
    while (stack.length > 0) {
      const currentNode = stack.pop(); // Pop node from stack
  
      // If already visited by this DFS run or if it's a wall, skip
      if (currentNode.isVisitedForAlgo || currentNode.isWall) {
        continue;
      }
  
      currentNode.isVisitedForAlgo = true; // Mark as visited for this run
      visitedNodesInOrder.push(currentNode); // Add to animation order
  
      // If we found the finish node, we're done searching
      if (currentNode.row === finishNode.row && currentNode.col === finishNode.col) {
        return visitedNodesInOrder; // Path found
      }
  
      // Get neighbors. DFS explores them in a specific order (often reverse of how they are added)
      // To get a more "DFS-like" visual path (e.g. try down, then right, then up, then left)
      // we can add them to the stack in reverse order of desired exploration.
      const neighbors = getUnvisitedNeighbors(currentNode, gridCopy);
      for (let i = neighbors.length - 1; i >= 0; i--) { // Add in reverse for typical LIFO exploration
          const neighbor = neighbors[i];
          neighbor.previousNode = currentNode; // Set predecessor for path reconstruction
          stack.push(neighbor); // Push neighbors onto the stack
      }
    }
  
    // Stack is empty, but finish not reached (no path found)
    return visitedNodesInOrder; // Return all visited nodes processed
  }
  
  // Get neighbors that haven't been visited *by this DFS run* and aren't walls
  function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
  
    // Define a specific order for adding to stack (will be explored in reverse)
    // Example: Explore Up, Left, Down, Right -> Add to stack as Right, Down, Left, Up
    // Right
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    // Down
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    // Left
    if (col > 0) neighbors.push(grid[row][col - 1]);
    // Up
    if (row > 0) neighbors.push(grid[row - 1][col]);
  
  
    return neighbors.filter(neighbor => !neighbor.isVisitedForAlgo && !neighbor.isWall);
  }
  
  // Note: getNodesInShortestPathOrder function (from bfs.js) will be used
  // to reconstruct *a* path found by DFS, but it won't necessarily be the shortest.