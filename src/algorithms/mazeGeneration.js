// src/algorithms/mazeGeneration.js

// Helper function to add wall segments to the animation list
// It does NOT modify the grid directly, only collects coordinates for animation
function addWallSegment(row, col, wallsToAnimate, grid, startNodeCoords, finishNodeCoords) {
    // Basic boundary checks (should be handled by calling logic too)
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return;

    // Don't place walls on start or finish nodes
    if (grid[row][col].isStart || grid[row][col].isFinish) return;
    // Also, don't place walls on a bomb node if it exists
    if (grid[row][col].isBomb) return;

    wallsToAnimate.push([row, col]);
}


export function recursiveDivisionMaze(grid, startNodeCoords, finishNodeCoords) {
    const wallsToAnimate = []; // Array to store [row, col] of walls to be animated
    const gridHeight = grid.length;
    const gridWidth = grid[0].length;

    function divide(row, col, height, width, orientation) {
        // Base case: If chamber is too small to divide further
        if (height < 3 || width < 3) { // Need space for walls and passages
            return;
        }

        // Determine wall position: must be even for passages to be on odd
        // Determine passage position: must be odd
        let wallX, wallY, passageX, passageY;

        if (orientation === 'horizontal') { // Draw a horizontal wall
            // wallY must be an even number
            let possibleWallYs = [];
            for (let tempY = row + 1; tempY < row + height - 1; tempY += 2) {
                possibleWallYs.push(tempY);
            }
            if (possibleWallYs.length === 0) return;
            wallY = possibleWallYs[Math.floor(Math.random() * possibleWallYs.length)];

            // passageX must be an odd number
            let possiblePassageXs = [];
            for (let tempX = col; tempX < col + width; tempX += 2) {
                possiblePassageXs.push(tempX);
            }
            if (possiblePassageXs.length === 0) return; // Should not happen if width >=3
            passageX = possiblePassageXs[Math.floor(Math.random() * possiblePassageXs.length)];


            for (let x = col; x < col + width; x++) {
                if (x !== passageX) { // Don't add wall at passage
                    addWallSegment(wallY, x, wallsToAnimate, grid, startNodeCoords, finishNodeCoords);
                }
            }

            // Recursively divide chambers
            divide(row, col, wallY - row, width, chooseOrientation(width, wallY - row));
            divide(wallY + 1, col, (row + height) - (wallY + 1), width, chooseOrientation(width, (row + height) - (wallY + 1)));

        } else { // Vertical wall (orientation === 'vertical')
            // wallX must be an even number
            let possibleWallXs = [];
            for (let tempX = col + 1; tempX < col + width - 1; tempX += 2) {
                possibleWallXs.push(tempX);
            }
            if (possibleWallXs.length === 0) return;
            wallX = possibleWallXs[Math.floor(Math.random() * possibleWallXs.length)];

            // passageY must be an odd number
            let possiblePassageYs = [];
            for (let tempY = row; tempY < row + height; tempY += 2) {
                possiblePassageYs.push(tempY);
            }
            if (possiblePassageYs.length === 0) return; // Should not happen if height >=3
            passageY = possiblePassageYs[Math.floor(Math.random() * possiblePassageYs.length)];

            for (let y = row; y < row + height; y++) {
                if (y !== passageY) { // Don't add wall at passage
                    addWallSegment(y, wallX, wallsToAnimate, grid, startNodeCoords, finishNodeCoords);
                }
            }

            // Recursively divide chambers
            divide(row, col, height, wallX - col, chooseOrientation(wallX - col, height));
            divide(row, wallX + 1, height, (col + width) - (wallX + 1), chooseOrientation((col + width) - (wallX + 1), height));
        }
    }

    // Helper to choose orientation based on chamber dimensions
    function chooseOrientation(width, height) {
        if (width < height) {
            return 'horizontal';
        } else if (height < width) {
            return 'vertical';
        } else {
            // If square, choose randomly
            return Math.random() < 0.5 ? 'horizontal' : 'vertical';
        }
    }

    // Initial call to divide the whole grid
    divide(0, 0, gridHeight, gridWidth, chooseOrientation(gridWidth, gridHeight));

    return wallsToAnimate;
}