import React from 'react';
import './StatsDisplay.css'; // Importa los estilos para el display de stats

function StatsDisplay({ stats }) {
  // No renderizar nada si no hay estadísticas (antes de la primera ejecución o después de limpiar)
  if (!stats) {
    return null;
  }

  // Determinar cómo mostrar la longitud del camino (N/A si no se encontró)
  const pathDisplay = stats.pathLength > 0 ? stats.pathLength : 'N/A';
  // Determinar cómo mostrar el costo total
  const costDisplay = stats.totalCost !== undefined && stats.totalCost > 0 ? stats.totalCost : (stats.pathLength > 0 ? 'N/A (Unweighted)' : 'N/A');


  return (
    <div className="stats-display">
      <h3>Last Run Results ({stats.algorithm}):</h3>
      <div className="stats-grid">
          <span>Nodes Visited:</span><span>{stats.visitedCount}</span>
          <span>Path Length:</span><span>{pathDisplay}</span>
           {/* Mostrar Costo Total solo si está definido y es relevante (mapa ponderado y camino encontrado) */}
           {stats.totalCost !== undefined && stats.pathLength > 0 && (
                <>
                   <span>Total Cost:</span><span>{stats.totalCost}</span>
                </>
           )}
          <span>Execution Time:</span><span>{stats.executionTime} ms</span>
      </div>
    </div>
  );
}

export default StatsDisplay;