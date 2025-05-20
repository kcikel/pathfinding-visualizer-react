import React, { Component } from 'react';
import { createNoise2D } from 'simplex-noise'; // Use named export
import { GRID_ROWS, GRID_COLS } from '../constants'; // Speed constants defined inside
// Import utilities and algorithms
import { getInitialGrid, getNewGridWithWallToggled, getNewGridWithWeightToggled } from '../gridUtils';
import { builtInAlgorithms, getNodesInShortestPathOrder } from '../algorithms'; // Imports map and path func
import { recursiveDivisionMaze } from '../algorithms/mazeGeneration';
// Import Components
import Controls from '../components/Controls/Controls';
import GridDisplay from '../components/GridDisplay/GridDisplay';
import StatsDisplay from '../components/StatsDisplay/StatsDisplay';
import './Node/Node.css'; // Node styles

// --- Constants defined within the component file ---
const ANIMATION_STYLES = { DYNAMIC: 'dynamic', BASIC: 'basic' };
const SPEED_SETTINGS = { fast: 'Fast', medium: 'Medium', slow: 'Slow' };
// Speed values in milliseconds
const SPEEDS_MS = {
    fast: { search: 5, path: 15, maze: 2 },
    medium: { search: 10, path: 40, maze: 5 },
    slow: { search: 50, path: 100, maze: 25 },
};
// Map Mode Constant
const MAP_MODES = { UNWEIGHTED: 'unweighted', WEIGHTED: 'weighted' };
// Initial start/finish positions
const INITIAL_START_ROW = 7;
const INITIAL_START_COL = 8;
const INITIAL_FINISH_ROW = 7;
const INITIAL_FINISH_COL = 31;
// Default weight value to add/toggle
const DEFAULT_WEIGHT_VALUE = 5;
// Noise parameters for weighted maze generation
const NOISE_SCALE = 10; // Controls the 'frequency' or size of the noise pattern
// const WEIGHT_THRESHOLD = 0.5; // Threshold not used in current weighted maze logic
// --- End Constants ---


export default class PathfindingVisualizer extends Component {
  constructor(props) {
    super(props);
    const algorithmKeys = Object.keys(builtInAlgorithms);
    this.state = {
      grid: [],
      mouseIsPressed: false,
      isVisualizing: false,
      isGeneratingMaze: false,
      selectedAlgorithm: algorithmKeys[0] || null, // Default to first algorithm key
      lastRunStats: null,
      animationStyle: ANIMATION_STYLES.DYNAMIC,
      animationSpeedSetting: 'medium',
      mapMode: MAP_MODES.UNWEIGHTED,
      startNodeCoords: { row: INITIAL_START_ROW, col: INITIAL_START_COL },
      finishNodeCoords: { row: INITIAL_FINISH_ROW, col: INITIAL_FINISH_COL },
      bombNodeCoords: null, // { row: r, col: c } or null
      isAddingBomb: false,
      isDraggingStartNode: false,
      isDraggingFinishNode: false,
      isDraggingBomb: false,
      isAddingWeight: false,
      currentWeightValue: DEFAULT_WEIGHT_VALUE,
      // No customAlgorithmCode or availableAlgorithms (using builtInAlgorithms directly for Controls)
    };
    this.timeouts = [];
    // Initialize refs array structure
    this.nodeRefs = [];
    for (let row = 0; row < GRID_ROWS; row++) {
        const currentRowRefs = [];
        for (let col = 0; col < GRID_COLS; col++) {
            currentRowRefs.push(React.createRef());
        }
        this.nodeRefs.push(currentRowRefs);
    }
    // Bind methods defined ONCE below
    const methodsToBind = [
        'handleMouseDown', 'handleMouseEnter', 'handleMouseUp', 'handleVisualize',
        'handleAlgorithmChange', 'handleClearBoard', 'handleClearWalls', 'handleClearPath',
        'handleAnimationStyleChange', 'handleSpeedChange', 'handleSaveMap', 'handleLoadMap',
        'handleGenerateMaze', 'handleToggleAddBomb', 'handleMapModeChange', 'handleToggleAddWeight',
        'handleWeightValueChange', 'updateWeightVisuals', 'resetGrid', 'clearTimeouts',
        'addTimeout', 'handleNodeDrag', 'resetNodeVisuals', 'visualizeAlgorithm',
        'animateAlgorithm', 'animateShortestPath', 'animateMazeGeneration'
        // No handleCustomCodeChange
    ];
    methodsToBind.forEach(method => {
        if (typeof this[method] === 'function') {
            this[method] = this[method].bind(this);
        } else {
            console.error(`Attempting to bind non-existent method: ${method}`);
        }
    });
  }

  // --- Lifecycle & Utils ---
  componentDidMount() {
    this.resetGrid();
  }

  componentWillUnmount() {
    this.clearTimeouts();
  }

  clearTimeouts() {
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
  }

  addTimeout(t) {
    this.timeouts.push(t);
  }

  // --- Grid Reset ---
  resetGrid(startCoords = null, finishCoords = null) {
      const sCoords = startCoords || { row: INITIAL_START_ROW, col: INITIAL_START_COL };
      const fCoords = finishCoords || { row: INITIAL_FINISH_ROW, col: INITIAL_FINISH_COL };
      const newGrid = getInitialGrid(GRID_ROWS, GRID_COLS, sCoords, fCoords);
      this.setState({
          grid: newGrid, startNodeCoords: sCoords, finishNodeCoords: fCoords,
          bombNodeCoords: null, isVisualizing: false, isGeneratingMaze: false,
          mouseIsPressed: false, lastRunStats: null, isDraggingStartNode: false,
          isDraggingFinishNode: false, isAddingBomb: false, isDraggingBomb: false,
          isAddingWeight: false
          // mapMode, animationStyle, speedSetting, selectedAlgorithm persist across board clears
      }, () => {
          // Use rAF to clear visuals after state update potentially finishes DOM changes
          requestAnimationFrame(() => this.resetNodeVisuals(true, true, true)); // Clear walls, bomb, and weight visuals
      });
  }

  // --- Mouse Event Handlers ---
  handleMouseDown(row, col) {
      if (this.state.isVisualizing || this.state.isGeneratingMaze) return;
      const { startNodeCoords, finishNodeCoords, bombNodeCoords, isAddingBomb, isAddingWeight, grid, mapMode, currentWeightValue } = this.state;
      const clickedNode = grid[row]?.[col];
      if (!clickedNode) return;

      if (isAddingBomb) {
          if (!clickedNode.isStart && !clickedNode.isFinish && !clickedNode.isWall && !clickedNode.isBomb && clickedNode.weight <= 1) {
              const newCoords = { row, col }; const oldBombCoords = bombNodeCoords;
              let newGrid = grid.map(r => r.map(n => ({...n})));
              if (oldBombCoords) { newGrid[oldBombCoords.row][oldBombCoords.col].isBomb = false; const oldRef = this.nodeRefs[oldBombCoords.row]?.[oldBombCoords.col]?.current; if (oldRef) oldRef.classList.remove('node-bomb'); }
              newGrid[row][col].isBomb = true; newGrid[row][col].isWall = false; newGrid[row][col].weight = 1;
              const newRef = this.nodeRefs[row]?.[col]?.current; if (newRef) { newRef.classList.remove('node-wall'); newRef.classList.forEach(cn => {if(cn.startsWith('node-weight-')) newRef.classList.remove(cn);}); newRef.classList.add('node-bomb'); }
              this.setState({ grid: newGrid, bombNodeCoords: newCoords, isAddingBomb: false, mouseIsPressed: false });
          } else { this.setState({ isAddingBomb: false }); } // Clicked invalid spot, cancel add mode
          return;
      }
      else if (isAddingWeight && mapMode === MAP_MODES.WEIGHTED) {
           const newGrid = getNewGridWithWeightToggled(grid, row, col, currentWeightValue);
           if (newGrid !== grid) {
                this.setState({ grid: newGrid, mouseIsPressed: true }); // Keep mouse pressed for potential drag-paint
                 const nodeRef = this.nodeRefs[row]?.[col]?.current;
                 if(nodeRef) { // Update visual immediately
                    nodeRef.classList.forEach(cn => { if (cn.startsWith('node-weight-')) nodeRef.classList.remove(cn); }); // Remove *all* old weight classes first
                    if (newGrid[row][col].weight > 1) nodeRef.classList.add(`node-weight-${newGrid[row][col].weight}`); // Add new one if applicable
                 }
           } else { this.setState({ mouseIsPressed: true }); } // Still register press
      }
      else if (clickedNode.isStart) { this.setState({ mouseIsPressed: true, isDraggingStartNode: true }); }
      else if (clickedNode.isFinish) { this.setState({ mouseIsPressed: true, isDraggingFinishNode: true }); }
      else if (clickedNode.isBomb) { this.setState({ mouseIsPressed: true, isDraggingBomb: true }); }
      else { // Handle Wall Toggle
          const g = getNewGridWithWallToggled(grid, row, col);
          if (g !== grid) this.setState({ grid: g, mouseIsPressed: true });
          else this.setState({ mouseIsPressed: true }); // Register press
      }
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed || this.state.isVisualizing || this.state.isGeneratingMaze) return;
    const { isDraggingStartNode, isDraggingFinishNode, isDraggingBomb, isAddingWeight, grid, mapMode, currentWeightValue } = this.state;
    if (isDraggingStartNode) { this.handleNodeDrag(row, col, 'start'); }
    else if (isDraggingFinishNode) { this.handleNodeDrag(row, col, 'finish'); }
    else if (isDraggingBomb) { this.handleNodeDrag(row, col, 'bomb'); }
    else if (isAddingWeight && mapMode === MAP_MODES.WEIGHTED) { // Handle Painting Weight
         const newGrid = getNewGridWithWeightToggled(grid, row, col, currentWeightValue);
         if (newGrid !== grid) {
             this.setState({ grid: newGrid });
              const nodeRef = this.nodeRefs[row]?.[col]?.current;
              if (nodeRef) { // Update visual immediately
                  nodeRef.classList.forEach(cn => { if (cn.startsWith('node-weight-')) nodeRef.classList.remove(cn); });
                  if (newGrid[row][col].weight > 1) nodeRef.classList.add(`node-weight-${newGrid[row][col].weight}`);
              }
         }
     }
    else { // Paint walls
        const g = getNewGridWithWallToggled(grid, row, col);
        if (g !== grid) this.setState({ grid: g });
    }
  }

  handleMouseUp() {
     if (this.state.isAddingBomb) { this.setState({ isAddingBomb: false }); }
     if (this.state.isAddingWeight) { this.setState({ isAddingWeight: false }); } // Turn off add weight mode too
     if (this.state.mouseIsPressed) { this.setState({ mouseIsPressed: false, isDraggingStartNode: false, isDraggingFinishNode: false, isDraggingBomb: false }); }
  }

  handleNodeDrag(newRow, newCol, nodeType) {
      const { grid, startNodeCoords, finishNodeCoords, bombNodeCoords } = this.state;
      let oldCoords; if (nodeType === 'start') oldCoords = startNodeCoords; else if (nodeType === 'finish') oldCoords = finishNodeCoords; else if (nodeType === 'bomb') oldCoords = bombNodeCoords; else return; if (nodeType === 'bomb' && !oldCoords) return; // Cannot drag non-existent bomb
      if (newRow < 0 || newRow >= GRID_ROWS || newCol < 0 || newCol >= GRID_COLS) return; const targetNode = grid[newRow]?.[newCol]; if (!targetNode) return;
       const isTargetWall = targetNode.isWall; const isTargetStart = nodeType !== 'start' && newRow === startNodeCoords.row && newCol === startNodeCoords.col; const isTargetFinish = nodeType !== 'finish' && newRow === finishNodeCoords.row && newCol === finishNodeCoords.col; const isTargetBomb = nodeType !== 'bomb' && bombNodeCoords && newRow === bombNodeCoords.row && newCol === bombNodeCoords.col; const isTargetWeighted = targetNode.weight > 1;
       if (isTargetWall || isTargetStart || isTargetFinish || isTargetBomb || isTargetWeighted) return; // Invalid drop
      const newGrid = grid.map((rA, rI) => rA.map((n, cI) => { let nn = { ...n }; if (rI === oldCoords.row && cI === oldCoords.col) { if (nodeType === 'start') nn.isStart = false; else if (nodeType === 'finish') nn.isFinish = false; else if (nodeType === 'bomb') nn.isBomb = false; } if (rI === newRow && cI === newCol) { if (nodeType === 'start') nn.isStart = true; else if (nodeType === 'finish') nn.isFinish = true; else if (nodeType === 'bomb') nn.isBomb = true; nn.isWall = false; nn.weight = 1; /* Special nodes always have weight 1 */ } return nn; }));
      const newStateUpdate = { grid: newGrid }; if (nodeType === 'start') newStateUpdate.startNodeCoords = { row: newRow, col: newCol }; else if (nodeType === 'finish') newStateUpdate.finishNodeCoords = { row: newRow, col: newCol }; else if (nodeType === 'bomb') newStateUpdate.bombNodeCoords = { row: newRow, col: newCol }; this.setState(newStateUpdate);
  }

  // --- Control Button / Select Handlers ---
  handleClearBoard() { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; this.clearTimeouts(); this.resetGrid(); }
  handleClearWalls() { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; this.clearTimeouts(); const { grid }=this.state; let nU=false; const nG=grid.map(r => r.map(nd => { let c=false; let nn = {...nd}; if (nd.isWall) { nn.isWall = false; c = true; } if (nd.weight > 1) { nn.weight = 1; c = true; } if (c) nU = true; return nn; })); if (nU) { this.resetNodeVisuals(true, false, true); this.setState({ grid: nG, lastRunStats: null }); } this.setState({ isVisualizing: false, isGeneratingMaze: false, mouseIsPressed: false }); }
  handleClearPath() { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; this.clearTimeouts(); this.resetNodeVisuals(false, false, false); this.setState({ lastRunStats: null, isVisualizing: false }); }
  handleAlgorithmChange(event) { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; this.setState({ selectedAlgorithm: event.target.value }); }
  handleVisualize() { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; const { selectedAlgorithm } = this.state; const algoData = builtInAlgorithms[selectedAlgorithm]; if (algoData) { this.visualizeAlgorithm(algoData.name, algoData.func); } else { console.error("Selected algorithm not found:", selectedAlgorithm); } }
  handleAnimationStyleChange(event) { const s = event.target.checked ? ANIMATION_STYLES.DYNAMIC : ANIMATION_STYLES.BASIC; this.setState({ animationStyle: s });}
  handleSpeedChange(event) { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; this.setState({ animationSpeedSetting: event.target.value }); }
  handleSaveMap() { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; let fn = window.prompt("Filename:", "pathfinding-map"); if (!fn) return; if (!fn.toLowerCase().endsWith('.json')) fn += '.json'; const { grid, startNodeCoords, finishNodeCoords, bombNodeCoords, mapMode } = this.state; const w = []; const weights = []; for(let r=0; r<GRID_ROWS; r++) for(let c=0; c<GRID_COLS; c++) { const node = grid[r]?.[c]; if (node?.isWall) w.push([r, c]); if (node?.weight > 1) weights.push([r, c, node.weight]); } const d = { rows: GRID_ROWS, cols: GRID_COLS, start: [startNodeCoords.row, startNodeCoords.col], finish: [finishNodeCoords.row, finishNodeCoords.col], walls: w, bomb: bombNodeCoords ? [bombNodeCoords.row, bombNodeCoords.col] : null, mapMode: mapMode, weights: weights }; try { const j = JSON.stringify(d, null, 2); const b = new Blob([j], { type: 'application/json' }); const u = URL.createObjectURL(b); const l = document.createElement('a'); l.href = u; l.download = fn; document.body.appendChild(l); l.click(); document.body.removeChild(l); URL.revokeObjectURL(u); } catch (err) { console.error("Save failed:", err); alert("Save failed."); }}
  handleLoadMap(event) { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (e) => { try { const d = JSON.parse(e.target.result); if (!d || typeof d!=='object' || !Array.isArray(d.walls) || !Array.isArray(d.start) || d.start.length!==2 || !Array.isArray(d.finish) || d.finish.length!==2 || typeof d.rows!=='number' || typeof d.cols!=='number') throw new Error("Invalid format."); if (d.rows!==GRID_ROWS || d.cols!==GRID_COLS) throw new Error(`Dim mismatch`); const sC = { row: d.start[0], col: d.start[1] }; const fC = { row: d.finish[0], col: d.finish[1] }; let bC = d.bomb ? {row: d.bomb[0], col: d.bomb[1] } : null; const loadedMapMode = d.mapMode === MAP_MODES.WEIGHTED ? MAP_MODES.WEIGHTED : MAP_MODES.UNWEIGHTED; if (sC.row<0 || sC.row>=GRID_ROWS || sC.col<0 || sC.col>=GRID_COLS || fC.row<0 || fC.row>=GRID_ROWS || fC.col<0 || fC.col>=GRID_COLS) throw new Error("Coords out of bounds."); if (bC && (bC.row<0 || bC.row>=GRID_ROWS || bC.col<0 || bC.col>=GRID_COLS)) throw new Error("Bomb coords out of bounds."); if (sC.row === fC.row && sC.col === fC.col) throw new Error("Start/Finish same."); if (bC && ((bC.row === sC.row && bC.col === sC.col) || (bC.row === fC.row && bC.col === fC.col))) { console.warn("Bomb conflicts, removing."); bC = null; } this.clearTimeouts(); this.resetGrid(sC, fC); setTimeout(() => { const gridAfterReset = this.state.grid; let gridWithLoadedData = gridAfterReset.map(row => row.map(node => ({...node, weight: 1}))); if (bC) { if (gridWithLoadedData[bC.row]?.[bC.col]) { gridWithLoadedData[bC.row][bC.col].isBomb = true; gridWithLoadedData[bC.row][bC.col].isWall = false; } } d.walls.forEach(([r, c]) => { if (gridWithLoadedData[r]?.[c] && !gridWithLoadedData[r][c].isStart && !gridWithLoadedData[r][c].isFinish && !gridWithLoadedData[r][c].isBomb) { gridWithLoadedData[r][c].isWall = true; gridWithLoadedData[r][c].weight = 1; } }); if (loadedMapMode === MAP_MODES.WEIGHTED && Array.isArray(d.weights)) { d.weights.forEach(([r,c,w]) => { if(gridWithLoadedData[r]?.[c] && !gridWithLoadedData[r][c].isStart && !gridWithLoadedData[r][c].isFinish && !gridWithLoadedData[r][c].isBomb && !gridWithLoadedData[r][c].isWall) { gridWithLoadedData[r][c].weight = w > 1 ? w : 1; }}); } this.setState({ grid: gridWithLoadedData, bombNodeCoords: bC, mapMode: loadedMapMode }, () => { requestAnimationFrame(() => { gridWithLoadedData.forEach((row,r) => row.forEach((node,c) => { const nR=this.nodeRefs[r]?.[c]?.current; if(!nR) return; nR.className='node'; if(node.isStart) nR.classList.add('node-start'); else if(node.isFinish) nR.classList.add('node-finish'); if(node.isWall) nR.classList.add('node-wall'); if(node.isBomb) nR.classList.add('node-bomb'); if(node.weight > 1) nR.classList.add(`node-weight-${node.weight}`); })); }); }); alert("Map loaded!"); }, 50); } catch (err) { console.error("Load failed:", err); alert(`Load failed: ${err.message}`); } finally { event.target.value = null; } }; reader.onerror = (e) => { console.error("Read fail:", e); alert("Read fail."); event.target.value = null; }; reader.readAsText(file); }
  handleGenerateMaze() { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; this.clearTimeouts(); const { startNodeCoords, finishNodeCoords, mapMode, currentWeightValue } = this.state; this.resetGrid(startNodeCoords, finishNodeCoords); this.setState({ isGeneratingMaze: true, lastRunStats: null }); setTimeout(() => { const cleanGrid = this.state.grid; const wallsToAnimate = recursiveDivisionMaze(cleanGrid, startNodeCoords, finishNodeCoords); const noise2D = createNoise2D(); let gridWithMaze = cleanGrid.map((row, rIdx) => row.map((node, cIdx) => { let newNode = { ...node, isWall: false, weight: 1 }; const isWallNode = wallsToAnimate.some(([wr, wc]) => wr === rIdx && wc === cIdx); if (isWallNode) { newNode.isWall = true; } else if (mapMode === MAP_MODES.WEIGHTED && !newNode.isStart && !newNode.isFinish && !newNode.isBomb) { const noiseValue = (noise2D(cIdx / NOISE_SCALE, rIdx / NOISE_SCALE) + 1) / 2; const calculatedWeight = Math.round(noiseValue * 8) + 2; newNode.weight = Math.max(2, Math.min(10, calculatedWeight)); } return newNode; })); const finalMapMode = gridWithMaze.some(r=>r.some(n=>n.weight>1)) ? MAP_MODES.WEIGHTED : MAP_MODES.UNWEIGHTED; this.setState({ grid: gridWithMaze, mapMode: finalMapMode }, () => { this.animateMazeGeneration(wallsToAnimate, mapMode === MAP_MODES.WEIGHTED && finalMapMode === MAP_MODES.WEIGHTED); }); }, 50); }
  handleToggleAddBomb() { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; this.setState(prevState => ({ isAddingBomb: !prevState.isAddingBomb, isAddingWeight: false, mouseIsPressed: false })); }
  handleToggleAddWeight() { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; if (this.state.mapMode !== MAP_MODES.WEIGHTED) { alert("Switch to 'Weighted' map mode first."); return; } this.setState(prevState => ({ isAddingWeight: !prevState.isAddingWeight, isAddingBomb: false, mouseIsPressed: false })); }
  handleWeightValueChange(event) { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; this.setState({ currentWeightValue: parseInt(event.target.value, 10) || DEFAULT_WEIGHT_VALUE }); }
  handleMapModeChange(event) { if (this.state.isVisualizing || this.state.isGeneratingMaze) return; const newMode = event.target.value; let grid = this.state.grid; let needsVisualReset = false; if (newMode === MAP_MODES.UNWEIGHTED && this.state.mapMode === MAP_MODES.WEIGHTED) { grid = grid.map(r => r.map(n => { if (n.weight > 1) { needsVisualReset = true; return {...n, weight: 1 }; } return n; })); this.setState({ mapMode: newMode, grid: grid, lastRunStats: null }, () => { if (needsVisualReset) { requestAnimationFrame(() => this.resetNodeVisuals(false, false, true)); } }); } else { this.setState({ mapMode: newMode, lastRunStats: null }); } }
  // handleCustomCodeChange removed

  // --- Maze Animation ---
  animateMazeGeneration(wallsToAnimate, updateWeightsAfter) { const speedKey = this.state.animationSpeedSetting; const mazeSpeed = SPEEDS_MS[speedKey]?.maze ?? SPEEDS_MS.medium.maze; let fTD = 0; for (let i = 0; i < wallsToAnimate.length; i++) { const [r, c] = wallsToAnimate[i]; const cD = i * mazeSpeed; fTD = cD; const tId = setTimeout(() => { const nR = this.nodeRefs[r]?.[c]?.current; if (nR && !nR.classList.contains('node-start') && !nR.classList.contains('node-finish')) { nR.classList.add('node-wall'); } }, cD); this.addTimeout(tId); } setTimeout(() => { this.setState({ isGeneratingMaze: false }); if (updateWeightsAfter) { requestAnimationFrame(() => this.updateWeightVisuals()); } }, fTD + mazeSpeed + 10); }

  // --- Update Weight Visuals Helper ---
  updateWeightVisuals() { const { grid } = this.state; for (let row = 0; row < GRID_ROWS; row++) { for (let col = 0; col < GRID_COLS; col++) { const node = grid[row]?.[col]; const nodeRef = this.nodeRefs[row]?.[col]?.current; if (node && nodeRef) { nodeRef.classList.forEach(cn => { if(cn.startsWith('node-weight-')) nodeRef.classList.remove(cn); }); if (!node.isStart && !node.isFinish && !node.isWall && !node.isBomb && node.weight > 1) { nodeRef.classList.add(`node-weight-${node.weight}`); } } } } }

  // --- Visualization Logic ---
  resetNodeVisuals(forceClearWalls = false, forceClearBomb = false, forceClearWeights = false) { for (let r = 0; r < GRID_ROWS; r++) { for (let c = 0; c < GRID_COLS; c++) { const nodeRef = this.nodeRefs[r]?.[c]?.current; if (nodeRef) { nodeRef.classList.remove('node-visited', 'node-shortest-path'); if (forceClearWalls && nodeRef.classList.contains('node-wall')) nodeRef.classList.remove('node-wall'); if (forceClearBomb && nodeRef.classList.contains('node-bomb')) nodeRef.classList.remove('node-bomb'); if (forceClearWeights) nodeRef.classList.forEach(cn => { if(cn.startsWith('node-weight-')) nodeRef.classList.remove(cn); }); } } } }

  // visualizeAlgorithm includes logic for weights, bombs, and different algo return types
  visualizeAlgorithm(algoName, algorithmFunction) {
      if (this.state.isVisualizing || this.state.isGeneratingMaze) return;
      const { grid, animationStyle, startNodeCoords, finishNodeCoords, bombNodeCoords, mapMode, selectedAlgorithm, animationSpeedSetting } = this.state;

      // Use the passed function and name directly (no custom logic here)
      const effectiveAlgorithmFunction = algorithmFunction;
      const effectiveAlgoName = algoName;

      // Check suitability for map mode / bomb
      const isWeighted = mapMode === MAP_MODES.WEIGHTED;
      if (isWeighted && ['BFS', 'DFS', 'BIDIRECTIONAL_BFS'].includes(selectedAlgorithm)) { if (!window.confirm(`${effectiveAlgoName} might ignore weights or guarantees may not apply. Continue?`)) { this.setState({isVisualizing: false}); return; }}
      // Removed BiBFS+Bomb check - handled by logic below

      this.clearTimeouts(); this.resetNodeVisuals();
      this.setState({ isVisualizing: true, lastRunStats: null });

      setTimeout(() => {
          try {
              const currentGrid = this.state.grid;
              const startNode = currentGrid[startNodeCoords.row]?.[startNodeCoords.col];
              const finishNode = currentGrid[finishNodeCoords.row]?.[finishNodeCoords.col];
              const bombNode = bombNodeCoords ? currentGrid[bombNodeCoords.row]?.[bombNodeCoords.col] : null;

              if (!startNode || !finishNode) throw new Error("Start/Finish node state invalid!");
              if (bombNodeCoords && !bombNode) throw new Error("Bomb node state invalid!");

              let finalVisitedNodes = []; let finalPathNodes = []; let totalVisitedCount = 0;
              let totalPathLength = 0; let totalExecutionTime = 0; let pathPossible = true; let totalCost = 0;
              const overallStartTime = performance.now();

              if (bombNode) { // --- Pathfinding with Bomb ---
                  const result1 = effectiveAlgorithmFunction(currentGrid, startNode, bombNode);
                  const time1 = performance.now(); totalExecutionTime += (time1 - overallStartTime);
                  const visitedNodes1 = Array.isArray(result1) ? result1 : result1?.visitedNodes || [];
                  const bombNodeRef1 = visitedNodes1.find(n => n.row === bombNode.row && n.col === bombNode.col);
                  const path1 = Array.isArray(result1) ? getNodesInShortestPathOrder(bombNodeRef1) : result1?.path || [];
                  const path1Found = path1 && path1.length > 0 && (selectedAlgorithm === 'BIDIRECTIONAL_BFS' || (bombNodeRef1 && (bombNodeRef1.previousNode !== null || bombNodeRef1.isStart)));
                  totalVisitedCount += visitedNodes1.length; finalVisitedNodes = visitedNodes1;
                  if (!path1Found) { pathPossible = false; }
                  else {
                      const startTime2 = performance.now();
                      const result2 = effectiveAlgorithmFunction(currentGrid, bombNode, finishNode);
                      const time2 = performance.now(); totalExecutionTime += (time2 - startTime2);
                      const visitedNodes2 = Array.isArray(result2) ? result2 : result2?.visitedNodes || [];
                      const finishNodeRef2 = visitedNodes2.find(n => n.row === finishNode.row && n.col === finishNode.col);
                      const path2 = Array.isArray(result2) ? getNodesInShortestPathOrder(finishNodeRef2) : result2?.path || [];
                      const path2Found = path2 && path2.length > 0 && (selectedAlgorithm === 'BIDIRECTIONAL_BFS' || (finishNodeRef2 && (finishNodeRef2.previousNode !== null || (finishNodeRef2.row === bombNode.row && finishNodeRef2.col === bombNode.col))));
                      totalVisitedCount += visitedNodes2.length; finalVisitedNodes = finalVisitedNodes.concat(visitedNodes2);
                      if (!path2Found) { pathPossible = false; finalPathNodes = []; }
                      else { if (selectedAlgorithm === 'BIDIRECTIONAL_BFS') { finalPathNodes = path1.concat(path2.slice(1)); } else { finalPathNodes = path1.slice(0, -1).concat(path2); } totalPathLength = finalPathNodes.length; pathPossible = true; if (isWeighted) totalCost = finalPathNodes.reduce((sum, node) => sum + (node.weight || 1), 0) - (startNode.weight || 1); }
                  }
              } else { // --- Pathfinding without Bomb ---
                  const result = effectiveAlgorithmFunction(currentGrid, startNode, finishNode);
                  const visitedNodesInOrder = Array.isArray(result) ? result : result?.visitedNodes || [];
                  const finishNodeRef = visitedNodesInOrder.find(n => n.row === finishNode.row && n.col === finishNode.col);
                  const nodesInShortestPathOrder = Array.isArray(result) ? getNodesInShortestPathOrder(finishNodeRef) : result?.path || [];
                  finalVisitedNodes = visitedNodesInOrder; finalPathNodes = nodesInShortestPathOrder;
                  totalVisitedCount = visitedNodesInOrder.length; pathPossible = finalPathNodes.length > 0;
                  totalPathLength = pathPossible ? finalPathNodes.length : 0;
                   const overallEndTime = performance.now(); totalExecutionTime = overallEndTime - overallStartTime;
                   if (pathPossible && isWeighted) { totalCost = finalPathNodes.reduce((sum, node) => sum + (node.weight || 1), 0) - (startNode.weight || 1); }
              }

              // Update Stats
              const stats = { algorithm: effectiveAlgoName + (bombNode ? " (via Bomb)" : ""), visitedCount: totalVisitedCount, pathLength: totalPathLength, executionTime: totalExecutionTime.toFixed(2), ...(isWeighted && pathPossible && totalCost > 0 && { totalCost: totalCost }) };
              this.setState({ lastRunStats: stats });
              if (finalVisitedNodes.length === 0) { this.setState({ isVisualizing: false }); return; }
              this.animateAlgorithm(finalVisitedNodes, finalPathNodes, animationStyle, animationSpeedSetting);

          } catch (error) { console.error(`Error during ${effectiveAlgoName} execution:`, error); alert(`An error occurred during ${effectiveAlgoName} execution. Check console.`); this.setState({ isVisualizing: false, lastRunStats: null }); }
      }, 50);
  }

  // --- Animation Functions ---
  animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder, animationStyle, speedSetting) { if (visitedNodesInOrder.length === 0) { if(nodesInShortestPathOrder.length === 0) this.setState({ isVisualizing: false }); return; } const searchSpeed = SPEEDS_MS[speedSetting]?.search ?? SPEEDS_MS.medium.search; const stepDelay = animationStyle === ANIMATION_STYLES.DYNAMIC ? searchSpeed : 0; for (let i = 0; i < visitedNodesInOrder.length; i++) { const node = visitedNodesInOrder[i]; const currentDelay = i * stepDelay; const isStart = node.row === this.state.startNodeCoords.row && node.col === this.state.startNodeCoords.col; const isFinish = node.row === this.state.finishNodeCoords.row && node.col === this.state.finishNodeCoords.col; const isBomb = this.state.bombNodeCoords && node.row === this.state.bombNodeCoords.row && node.col === this.state.bombNodeCoords.col; if (!isStart && !isFinish && !isBomb) { const tId = setTimeout(() => { const nE = this.nodeRefs[node.row]?.[node.col]?.current; if (nE) nE.classList.add('node-visited'); }, currentDelay); this.addTimeout(tId); } if (i === visitedNodesInOrder.length - 1) { const pTId = setTimeout(() => { this.animateShortestPath(nodesInShortestPathOrder, animationStyle, speedSetting); }, currentDelay); this.addTimeout(pTId); } } }
  animateShortestPath(nodesInShortestPathOrder, animationStyle, speedSetting) { const pathSpeed = SPEEDS_MS[speedSetting]?.path ?? SPEEDS_MS.medium.path; const stepDelay = animationStyle === ANIMATION_STYLES.DYNAMIC ? pathSpeed : 0; let fTD = 0; if (nodesInShortestPathOrder.length === 0) { const searchSpeed = SPEEDS_MS[speedSetting]?.search ?? SPEEDS_MS.medium.search; const approxVSpd = animationStyle === ANIMATION_STYLES.DYNAMIC ? searchSpeed : 0; fTD = this.timeouts.length * approxVSpd; setTimeout(() => { this.setState({ isVisualizing: false }); }, fTD > 0 ? fTD : 50); return; } for (let i = 0; i < nodesInShortestPathOrder.length; i++) { const cD = i * stepDelay; fTD = cD; const tId = setTimeout(() => { const node = nodesInShortestPathOrder[i]; const nE = this.nodeRefs[node.row]?.[node.col]?.current; if (nE) { nE.classList.remove('node-visited'); nE.classList.add('node-shortest-path'); } }, cD); this.addTimeout(tId); } setTimeout(() => { this.setState({ isVisualizing: false }); }, fTD + stepDelay + 10); }


  // --- Render Method ---
  render() {
    // Removed customAlgorithmCode, availableAlgorithms from destructuring
    const { grid, mouseIsPressed, isVisualizing, selectedAlgorithm, lastRunStats, animationStyle, isGeneratingMaze, animationSpeedSetting, isAddingBomb, mapMode, isAddingWeight, currentWeightValue } = this.state;
    if (!grid || grid.length === 0) { return <div>Loading Grid...</div>; }
    const controlsDisabled = isVisualizing || isGeneratingMaze;
    return (
      <>
        <h2>Pathfinding Algorithm Visualizer</h2>
        <Controls
          mapModes={MAP_MODES} selectedMapMode={mapMode} onMapModeChange={this.handleMapModeChange}
          algorithmsMap={builtInAlgorithms} // Use imported built-in map directly
          selectedAlgorithm={selectedAlgorithm} onAlgorithmChange={this.handleAlgorithmChange}
          onVisualize={this.handleVisualize} clearBoard={this.handleClearBoard} clearWalls={this.handleClearWalls}
          onClearPath={this.handleClearPath}
          isVisualizing={controlsDisabled} animationStyle={animationStyle} onAnimationStyleChange={this.handleAnimationStyleChange}
          speedSettings={SPEED_SETTINGS} selectedSpeed={animationSpeedSetting} onSpeedChange={this.handleSpeedChange}
          onSaveMap={this.handleSaveMap} onLoadMap={this.handleLoadMap} onGenerateMaze={this.handleGenerateMaze}
          onToggleAddBomb={this.handleToggleAddBomb} isAddingBomb={isAddingBomb}
          isAddingWeight={isAddingWeight} onToggleAddWeight={this.handleToggleAddWeight} currentWeightValue={currentWeightValue} onWeightValueChange={this.handleWeightValueChange}
        />
        {/* Code Editor rendering removed */}
        <StatsDisplay stats={lastRunStats} />
        <div className={`visualizer map-mode-${mapMode} ${animationStyle === ANIMATION_STYLES.DYNAMIC ? 'animation-dynamic' : 'animation-basic'}`}>
          <GridDisplay
            grid={grid} nodeRefs={this.nodeRefs} mouseIsPressed={mouseIsPressed}
            onMouseDown={this.handleMouseDown} onMouseEnter={this.handleMouseEnter}
            onMouseUpGrid={this.handleMouseUp} onMouseLeaveGrid={this.handleMouseUp}
          />
        </div>
      </>
    );
  }
} // End Component

// --- Helper Functions / Imports --- Needed for build