// src/gridUtils.js

// Function to create a single node object
export const createNode = (col, row, startNodeCoords, finishNodeCoords) => {
    return {
        col,
        row,
        isStart: row === startNodeCoords.row && col === startNodeCoords.col,
        isFinish: row === finishNodeCoords.row && col === finishNodeCoords.col,
        isBomb: false,
        weight: 1, // Default weight
        // Algorithm-specific properties (reset per run or managed by algorithms)
        distance: Infinity,
        g: Infinity,
        h: Infinity,
        f: Infinity,
        isVisited: false, // General visited flag (can be used by algos or animation)
        isVisitedDFS: false, // Example for DFS specific state if needed
        previousNode: null,
        // Visual state (usually handled by external class manipulation or additional props)
        isWall: false,
    };
};

// Function to create the initial grid structure
export const getInitialGrid = (rows, cols, startNodeCoords, finishNodeCoords) => {
    const grid = [];
    for (let row = 0; row < rows; row++) {
        const currentRow = [];
        for (let col = 0; col < cols; col++) {
            currentRow.push(createNode(col, row, startNodeCoords, finishNodeCoords));
        }
        grid.push(currentRow);
    }
    return grid;
};

// Function to return a new grid with a wall toggled (immutable)
export const getNewGridWithWallToggled = (grid, row, col) => {
  if (!grid || !grid[row] || !grid[row][col]) return grid; // Check bounds

  const node = grid[row][col];
  // Prevent toggling wall on special nodes or weighted nodes
  if (node.isStart || node.isFinish || node.isBomb || node.weight > 1) {
      return grid; // Return original grid if action is invalid
  }

  // Create a new grid by copying, then update the specific node
  const newGrid = grid.map(gridRow => [...gridRow]); // Shallow copy rows
  const newNode = {
    ...newGrid[row][col], // Copy the node
    isWall: !newGrid[row][col].isWall, // Toggle wall status
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

// Function to toggle specific weight on a node
// If node has target weight, sets to 1. If node has weight 1, sets to target weight.
export const getNewGridWithWeightToggled = (grid, row, col, weightValueToToggle) => {
    if (!grid || !grid[row] || !grid[row][col] || weightValueToToggle <= 1) return grid;
    const node = grid[row][col];
    // Prevent adding weight on special nodes or walls
    if (node.isStart || node.isFinish || node.isBomb || node.isWall) {
        return grid;
    }

    const newGrid = grid.map(gridRow => [...gridRow]);
    const currentWeight = node.weight;
    const newNode = {
        ...newGrid[row][col],
        weight: currentWeight === weightValueToToggle ? 1 : weightValueToToggle,
    };
    newGrid[row][col] = newNode;
    return newGrid;
};
