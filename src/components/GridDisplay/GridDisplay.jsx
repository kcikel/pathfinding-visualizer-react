import React from 'react';
// Ajusta la ruta si Node.jsx está en una ubicación diferente
// Asumimos que PathfindingVisualizer/Node/Node.jsx es la ubicación correcta
import Node from '../../PathfindingVisualizer/Node/Node';
import './GridDisplay.css'; // Importa los estilos para el contenedor del grid

function GridDisplay({
  grid,
  nodeRefs, // Array 2D de refs
  // mouseIsPressed, // mouseIsPressed no se usa directamente en GridDisplay, sino en Node
  onMouseDown,   // Pasa a Node
  onMouseEnter,  // Pasa a Node
  onMouseUpGrid, // Para el div del grid
  onMouseLeaveGrid // Para el div del grid
}) {
  if (!grid || grid.length === 0) {
    return <div>Grid data is not available.</div>;
  }

  return (
    <div
      className="grid" // Clase para el contenedor principal del grid
      onMouseUp={onMouseUpGrid} // Manejador para cuando se suelta el botón del ratón sobre el grid
      onMouseLeave={onMouseLeaveGrid} // Manejador para cuando el ratón sale del área del grid
    >
      {grid.map((row, rowIdx) => {
        return (
          <div key={rowIdx} className="gridRow">
            {row.map((nodeData, nodeIdx) => {
              const { row: nodeRow, col: nodeCol, isStart, isFinish, isWall, isBomb, weight } = nodeData;
              return (
                <Node
                  // Asigna la ref correcta del array 2D de refs
                  ref={nodeRefs[nodeRow]?.[nodeCol]} // Acceso seguro a la ref
                  key={`<span class="math-inline">\{nodeRow\}\-</span>{nodeCol}`} // Clave única y estable
                  col={nodeCol}
                  row={nodeRow}
                  isStart={isStart}
                  isFinish={isFinish}
                  isWall={isWall}
                  isBomb={isBomb}
                  weight={weight}
                  // Pasa los manejadores de eventos individuales del ratón
                  onMouseDown={onMouseDown}
                  onMouseEnter={onMouseEnter}
                  // onMouseUp se maneja en el div 'grid' padre
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default GridDisplay;