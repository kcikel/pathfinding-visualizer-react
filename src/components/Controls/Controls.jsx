import React, { useRef } from 'react';
import './Controls.css';

function Controls({
    // Map Mode Props
    mapModes,
    selectedMapMode,
    onMapModeChange,
    // Weight Props
    isAddingWeight,
    onToggleAddWeight,
    currentWeightValue,
    onWeightValueChange,
    // Algo Props
    algorithmsMap, // This should be builtInAlgorithms from PathfindingVisualizer state
    selectedAlgorithm,
    onAlgorithmChange,
    // Action Props
    onVisualize,
    clearBoard,
    clearWalls,
    onClearPath,
    onSaveMap,
    onLoadMap,
    onGenerateMaze,
    onToggleAddBomb,
    // State Props
    isVisualizing, // Combined busy flag (visualizing path or generating maze)
    animationStyle,
    onAnimationStyleChange,
    speedSettings,
    selectedSpeed,
    onSpeedChange,
    isAddingBomb
 }) {

  const isDynamic = animationStyle === 'dynamic';
  const fileInputRef = useRef(null);

  const handleLoadClick = () => {
      if (!isVisualizing) fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
      if (event.target.files && event.target.files.length > 0) {
          onLoadMap(event);
      }
  };

  // Get display name safely for the selected algorithm
  const selectedAlgoDisplayName = algorithmsMap[selectedAlgorithm]?.name || selectedAlgorithm;
  const isWeightedMode = selectedMapMode === 'weighted';

  // Generate weight options (2-10)
  const weightOptions = [];
  for (let i = 2; i <= 10; i++) {
      weightOptions.push(i);
  }

  // Determine Generate button text based on map mode
  const generateButtonText = isWeightedMode ? "Generate Weights" : "Generate Maze";

  return (
    <div className="controls">
      {/* Row 1: Settings */}
      <div className="control-row">
          <label htmlFor="map-mode-select" className="control-label">Map Mode:</label>
          <select
            id="map-mode-select"
            value={selectedMapMode}
            onChange={onMapModeChange}
            disabled={isVisualizing}
            className="control-select"
          >
             {Object.entries(mapModes).map(([key, value]) => (
                <option key={key} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
             ))}
          </select>

          <label htmlFor="algo-select" className="control-label">Algorithm:</label>
          <select
            id="algo-select"
            value={selectedAlgorithm} // This will be a key like 'BFS', 'DIJKSTRA'
            onChange={onAlgorithmChange}
            disabled={isVisualizing}
            className="control-select"
          >
            {/* algorithmsMap is the prop from PathfindingVisualizer state (previously builtInAlgorithms) */}
            {Object.entries(algorithmsMap).map(([key, algoDetails]) => (
              <option key={key} value={key}>
                {algoDetails.name}
              </option>
            ))}
          </select>

          <label htmlFor="speed-select" className="control-label">Speed:</label>
          <select
            id="speed-select"
            value={selectedSpeed}
            onChange={onSpeedChange}
            disabled={isVisualizing}
            className="control-select"
          >
             {Object.entries(speedSettings).map(([key, displayName]) => (
                <option key={key} value={key}>
                    {displayName}
                </option>
             ))}
          </select>

          <div className="control-toggle">
             <label htmlFor="animation-toggle" className="control-label">Dynamic Animation:</label>
             <input
                type="checkbox"
                id="animation-toggle"
                checked={isDynamic}
                onChange={onAnimationStyleChange}
                disabled={isVisualizing}
              />
          </div>
      </div>

      {/* Row 2: Actions */}
       <div className="control-row">
          <button onClick={onVisualize} disabled={isVisualizing} className="control-button primary" >
            Visualize {selectedAlgoDisplayName}!
          </button>
          <button onClick={onGenerateMaze} disabled={isVisualizing} className="control-button">
              {generateButtonText}
          </button>
          <button onClick={onToggleAddBomb} disabled={isVisualizing} className={`control-button ${isAddingBomb ? 'active' : ''}`} >
            {isAddingBomb ? 'Placing Bomb...' : 'Add Bomb'}
          </button>

           {/* Weight Controls - Only visible and enabled in Weighted mode */}
           {isWeightedMode && (
               <>
                   <label htmlFor="weight-select" className="control-label">Weight:</label>
                   <select
                       id="weight-select"
                       value={currentWeightValue}
                       onChange={onWeightValueChange}
                       disabled={isVisualizing || isAddingWeight} // Disable select while placing
                       className="control-select weight-select"
                   >
                       {weightOptions.map(w => <option key={w} value={w}>{w}</option>)}
                   </select>
                   <button
                       onClick={onToggleAddWeight}
                       disabled={isVisualizing} // Button itself isn't disabled by isAddingWeight
                       title={`Click grid to add/remove weight ${currentWeightValue}`}
                       className={`control-button ${isAddingWeight ? 'active' : ''}`}
                   >
                       {isAddingWeight ? 'Placing Weight...' : `Add/Remove Wt`}
                   </button>
               </>
            )}

          <button onClick={clearBoard} disabled={isVisualizing} className="control-button"> Clear Board </button>
          <button onClick={clearWalls} disabled={isVisualizing} className="control-button"> Clear Walls & Weights </button>
          <button onClick={onClearPath} disabled={isVisualizing} className="control-button"> Clear Path </button>
          <button onClick={onSaveMap} disabled={isVisualizing} className="control-button"> Save Map </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".json" />
          <button onClick={handleLoadClick} disabled={isVisualizing} className="control-button"> Load Map </button>
       </div>
    </div>
  );
}

export default Controls;