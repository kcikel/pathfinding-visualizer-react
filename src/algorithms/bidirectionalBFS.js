// src/algorithms/bidirectionalBFS.js

// Bidirectional BFS Algorithm - With corrected predecessor handling and path reconstruction
export function bidirectionalBFS(grid, startNode, finishNode) {
    if (!grid || !startNode || !finishNode) {
        return { visitedNodes: [], path: [] };
    }
    if (startNode.isWall || finishNode.isWall) {
        return { visitedNodes: [], path: [] };
    }
    if (startNode.row === finishNode.row && startNode.col === finishNode.col) {
        return { visitedNodes: [startNode], path: [startNode] };
    }

    const queueStart = [startNode];
    const queueFinish = [finishNode];

    // Visited maps now store the predecessor found by THAT search direction
    // Key: "row-col", Value: { node: nodeObject, predecessor: predecessorNodeObject }
    const visitedStart = new Map();
    const visitedFinish = new Map();

    const visitedNodesInOrder = []; // Simple combined order for animation

    // Initialize start node
    visitedStart.set(`<span class="math-inline">\{startNode\.row\}\-</span>{startNode.col}`, { node: startNode, predecessor: null });
    visitedNodesInOrder.push(startNode);

    // Initialize finish node
    visitedFinish.set(`<span class="math-inline">\{finishNode\.row\}\-</span>{finishNode.col}`, { node: finishNode, predecessor: null });
    visitedNodesInOrder.push(finishNode); // Add finish node early

    while (queueStart.length > 0 || queueFinish.length > 0) { // Continue if either queue has nodes

        // --- Step from Start Search ---
        if (queueStart.length > 0) {
            const currentStartNode = queueStart.shift();
            const currentStartKey = `<span class="math-inline">\{currentStartNode\.row\}\-</span>{currentStartNode.col}`;

            // Check intersection
            if (visitedFinish.has(currentStartKey)) {
                const meetingStartEntry = visitedStart.get(currentStartKey); // Should be currentStartNode itself
                const meetingFinishEntry = visitedFinish.get(currentStartKey);
                const path = reconstructPath(visitedStart, visitedFinish, meetingStartEntry.node, meetingFinishEntry.node);
                return { visitedNodes: visitedNodesInOrder, path: path };
            }

            // Explore neighbors
            const neighborsStart = getUnvisitedNeighbors(currentStartNode, grid, visitedStart);
            for (const neighbor of neighborsStart) {
                visitedStart.set(`<span class="math-inline">\{neighbor\.row\}\-</span>{neighbor.col}`, { node: neighbor, predecessor: currentStartNode });
                visitedNodesInOrder.push(neighbor);
                queueStart.push(neighbor);
            }
        }

        // --- Step from Finish Search ---
        if (queueFinish.length > 0) {
            const currentFinishNode = queueFinish.shift();
            const currentFinishKey = `<span class="math-inline">\{currentFinishNode\.row\}\-</span>{currentFinishNode.col}`;

             // Check intersection
             if (visitedStart.has(currentFinishKey)) {
                 const meetingStartEntry = visitedStart.get(currentFinishKey);
                 const meetingFinishEntry = visitedFinish.get(currentFinishKey); // Should be currentFinishNode itself
                 const path = reconstructPath(visitedStart, visitedFinish, meetingStartEntry.node, currentFinishNode);
                 return { visitedNodes: visitedNodesInOrder, path: path };
             }

            // Explore neighbors
            const neighborsFinish = getUnvisitedNeighbors(currentFinishNode, grid, visitedFinish);
            for (const neighbor of neighborsFinish) {
                visitedFinish.set(`<span class="math-inline">\{neighbor\.row\}\-</span>{neighbor.col}`, { node: neighbor, predecessor: currentFinishNode });
                visitedNodesInOrder.push(neighbor);
                queueFinish.push(neighbor);
            }
        }

         // If both queues become empty, then no path exists.
         if(queueStart.length === 0 && queueFinish.length === 0) {
             break;
         }
    }

    // No path found
    return { visitedNodes: visitedNodesInOrder, path: [] };
}


// Helper to get valid, unvisited neighbors for a given node and search direction.
function getUnvisitedNeighbors(node, grid, visitedMap) {
    const neighbors = [];
    const { col, row } = node;
    const potentialCoords = [
        { r: row - 1, c: col }, // Up
        { r: row + 1, c: col }, // Down
        { r: row, c: col - 1 }, // Left
        { r: row, c: col + 1 }  // Right
    ];

    for (const coords of potentialCoords) {
        const { r, c } = coords;
        // Check bounds
        if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
            const neighborNode = grid[r][c];
            // Check if wall or already visited in *this* search direction's map
            if (neighborNode && !neighborNode.isWall && !visitedMap.has(`<span class="math-inline">\{r\}\-</span>{c}`)) {
                neighbors.push(neighborNode);
            }
        }
    }
    return neighbors;
}


// Helper function to reconstruct path using the visited Maps.
function reconstructPath(visitedStart, visitedFinish, meetingNodeFromStartSearch, meetingNodeFromFinishSearch) {
    const path = [];
    let currentKey = `<span class="math-inline">\{meetingNodeFromStartSearch\.row\}\-</span>{meetingNodeFromStartSearch.col}`;
    let currentEntry = visitedStart.get(currentKey);

    // Trace back start path (from meeting point towards actual start)
    while (currentEntry !== null && currentEntry !== undefined) {
        path.unshift(currentEntry.node); // Add node to the start of the array
        if (currentEntry.predecessor === null) break; // Reached the actual start node
        currentKey = `<span class="math-inline">\{currentEntry\.predecessor\.row\}\-</span>{currentEntry.predecessor.col}`;
        currentEntry = visitedStart.get(currentKey);
        if (!currentEntry && path.length > 0) { // Safety break if start is not in map (should not happen)
            console.error("Error reconstructing start path: start node's predecessor entry not found.");
            return []; // Invalid path
        }
    }

    // Trace back finish path (from node BEFORE meeting point on finish side, towards actual finish)
    // The meetingNodeFromFinishSearch is the same physical node as meetingNodeFromStartSearch
    // but its 'predecessor' entry in visitedFinish points back towards the true finish node.
    currentKey = `<span class="math-inline">\{meetingNodeFromFinishSearch\.row\}\-</span>{meetingNodeFromFinishSearch.col}`;
    let predecessorEntry = visitedFinish.get(currentKey)?.predecessor;

    while (predecessorEntry !== null && predecessorEntry !== undefined) {
        const predecessorNode = predecessorEntry; // The node itself is the predecessor
        path.push(predecessorNode); // Add to the end of the array
        currentKey = `<span class="math-inline">\{predecessorNode\.row\}\-</span>{predecessorNode.col}`;
        predecessorEntry = visitedFinish.get(currentKey)?.predecessor;
    }
    return path;
}