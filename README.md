# Pathfinding Visualizer

This project is a React-based application that allows users to visualize various pathfinding algorithms on a grid. Users can interact with the grid by adding walls, weights, and special nodes (start, finish, bomb) to see how different algorithms find paths under various conditions. It also features maze generation and animation controls for a better understanding of the algorithms' behavior.

## Features

*   **Algorithm Selection:** Choose from a variety of pathfinding algorithms:
    *   Breadth-First Search (BFS)
    *   Dijkstra's Algorithm
    *   A* Search
    *   Depth-First Search (DFS)
    *   Bidirectional BFS
*   **Interactive Grid:**
    *   Draw walls to create obstacles.
    *   Add weights to nodes to simulate varying costs for traversal (for supported algorithms).
    *   Place and move the start, finish, and bomb nodes.
*   **Maze Generation:** Automatically generate complex mazes using the Recursive Division algorithm.
*   **Visualization Controls:**
    *   Control the speed of the animation (Fast, Medium, Slow).
    *   Choose between dynamic and basic animation styles.
    *   Visualize the algorithm's search process and the shortest path found.
*   **Map Management:**
    *   Save your custom-designed maps (walls, weights, node positions) to a local file.
    *   Load previously saved maps to continue experimenting.
*   **Statistics Display:** View statistics about the last run algorithm, including:
    *   Algorithm name
    *   Number of nodes visited
    *   Path length
    *   Execution time
    *   Total cost (for weighted algorithms)

## Getting Started

To get a local copy up and running, follow these simple steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kcikel/pathfinding-visualizer-react.git
    cd pathfinding-visualizer-react
    ```
2.  **Install NPM packages:**
    ```bash
    npm install
    ```
3.  **Run the application:**
    ```bash
    npm start
    ```
    This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## How to Use

The visualizer is designed to be intuitive. Here’s a quick guide:

*   **Select an Algorithm:** Choose your desired pathfinding algorithm from the dropdown menu.
*   **Manipulate Nodes:**
    *   **Start/Finish Nodes:** Click and drag the green (start) or red (finish) nodes to move them to new positions.
    *   **Bomb Node:** Click the "Add Bomb" button, then click on an empty square to place a bomb. The algorithm will first find a path to the bomb and then to the finish node. Click and drag to move an existing bomb.
*   **Draw Obstacles:**
    *   **Walls:** Click and drag on empty grid cells to draw walls. Click again to remove a wall.
    *   **Weights:** Switch to "Weighted" map mode. Select a weight value using the slider/input next to the "Add Weight" button. Click "Add Weight," then click and drag on empty grid cells to assign weights. Nodes with higher weights are more "expensive" to traverse.
*   **Controls:**
    *   **Visualize:** Click the "Visualize [Algorithm Name]!" button to start the animation.
    *   **Generate Maze:** Click "Generate Maze" to create a random maze. You can choose between unweighted and weighted mazes (which will use noise to distribute weights).
    *   **Clear Board:** Resets the entire grid, including walls, weights, and node positions.
    *   **Clear Walls & Weights:** Removes all walls and weights but keeps node positions.
    *   **Clear Path:** Clears the visualized path and visited nodes from the previous run.
    *   **Animation Speed & Style:** Adjust the animation speed and style using the respective controls.
*   **Map Management:**
    *   Use "Save Map" to download a JSON file of your current grid configuration.
    *   Use "Load Map" to upload a previously saved map file.

## Technologies Used

*   **React:** A JavaScript library for building user interfaces.
*   **JavaScript (ES6+):** Core programming language.
*   **HTML5 & CSS3:** For structure and styling.
*   **Simplex Noise:** Used for generating weighted mazes.

## Deployment

This project is deployed using GitHub Pages.

You can access the live version here: [https://kcikel.github.io/pathfinding-visualizer-react](https://kcikel.github.io/pathfinding-visualizer-react)

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to fork the repository, make your changes, and submit a pull request. You can also open an issue to report bugs or discuss potential enhancements.
