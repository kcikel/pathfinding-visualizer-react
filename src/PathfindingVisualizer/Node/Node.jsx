import React from 'react';
import './Node.css'; // Importa los estilos específicos del nodo

// Usamos React.forwardRef para poder pasar la ref desde el componente padre (GridDisplay)
// directamente al elemento DOM (el div) de este nodo.
const Node = React.forwardRef((props, ref) => {
  const {
    col,
    row,
    isStart,
    isFinish,
    isWall,
    isBomb,    // Prop para indicar si es el nodo bomba
    weight,    // Prop para el peso del nodo (default 1)
    onMouseDown, // Función para manejar el clic del ratón
    onMouseEnter, // Función para manejar cuando el ratón entra en el nodo
    // onMouseUp se maneja en el div 'grid' padre en GridDisplay
  } = props;

  // Determina las clases CSS adicionales basadas en el estado del nodo
  // El orden aquí es importante para la precedencia de estilos si un nodo es múltiple cosas
  // (aunque nuestra lógica previene la mayoría de los solapamientos, ej: bomba no es muro)
  let extraClassName = '';
  if (isFinish) {
    extraClassName = 'node-finish';
  } else if (isStart) {
    extraClassName = 'node-start';
  } else if (isBomb) {
    extraClassName = 'node-bomb';
  } else if (isWall) {
    extraClassName = 'node-wall';
  } else if (weight > 1) {
    // Aplica una clase específica para el peso, ej: node-weight-5
    // Asegúrate de que Node.css tenga estilos para node-weight-2 hasta node-weight-10
    extraClassName = `node-weight-${weight}`;
  }

  // Las clases 'node-visited' y 'node-shortest-path' se añadirán/quitarán
  // directamente al DOM mediante la ref en PathfindingVisualizer.jsx

  return (
    <div
      ref={ref} // Asigna la ref reenviada al div
      id={`node-<span class="math-inline">\{row\}\-</span>{col}`} // ID único para cada nodo
      className={`node ${extraClassName}`} // Clase base y clase de tipo
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
    >
      {/* Opcional: Mostrar el valor del peso si es > 1 y no es un nodo especial */}
      {/* {weight > 1 && !isStart && !isFinish && !isBomb && !isWall ? weight : ''} */}
    </div>
  );
});

export default Node;