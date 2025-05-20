import React from 'react';
import './App.css';
// --- DESCOMENTA ESTA LÍNEA ---
import PathfindingVisualizer from './PathfindingVisualizer/PathfindingVisualizer';

function App() {
  return (
    <div className="App">
      {/* --- DESCOMENTA ESTA LÍNEA Y ELIMINA EL TEXTO PLACEHOLDER --- */}
      <PathfindingVisualizer />
      {/* <h1>Pathfinding Visualizer (En Construcción)</h1>
      <p>Configurando la estructura base...</p> 
      */}
    </div>
  );
}

export default App;