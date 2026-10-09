/**
 * Punto de entrada principal - Conecta la lógica con la interfaz
 * No contiene reglas del juego, solo actualiza el DOM
 */

import {
  crearEstadoInicial,
  iniciarPartida,
  responder,
  continuar,
  reiniciar,
  haGanado,
  obtenerProgreso,
  obtenerMensajeFinal,
  Estado,
  EstadoJuego,
  RespuestaJugador,
  CasoEstafa,
} from './logica.js';

// ============================================
// ELEMENTOS DEL DOM
// ============================================

const pantallas = {
  inicio: document.getElementById('screen-inicio') as HTMLElement,
  partida: document.getElementById('screen-partida') as HTMLElement,
  respuesta: document.getElementById('screen-respuesta') as HTMLElement,
  final: document.getElementById('screen-final') as HTMLElement,
};

const elementos = {
  // Inicio
  btnIniciar: document.getElementById('btn-iniciar') as HTMLButtonElement,

  // Partida
  statRonda: document.getElementById('stat-ronda') as HTMLElement,
  statPuntuacion: document.getElementById('stat-puntuacion') as HTMLElement,
  progressFill: document.getElementById('progress-fill') as HTMLElement,
  messageSender: document.getElementById('message-sender') as HTMLElement,
  messageAvatar: document.getElementById('message-avatar') as HTMLElement,
  messageMeta: document.getElementById('message-meta') as HTMLElement,
  messageContent: document.getElementById('message-content') as HTMLElement,
  btnEstafa: document.getElementById('btn-estafa') as HTMLButtonElement,
  btnLegitimo: document.getElementById('btn-legitimo') as HTMLButtonElement,

  // Respuesta
  explanation: document.getElementById('explanation') as HTMLElement,
  explanationTitle: document.getElementById('explanation-title') as HTMLElement,
  explanationText: document.getElementById('explanation-text') as HTMLElement,
  explanationSignals: document.getElementById('explanation-signals') as HTMLElement,
  btnContinuar: document.getElementById('btn-continuar') as HTMLButtonElement,

  // Final
  finalIcon: document.getElementById('final-icon') as HTMLElement,
  finalTitle: document.getElementById('final-title') as HTMLElement,
  finalScore: document.getElementById('final-score') as HTMLElement,
  finalMessage: document.getElementById('final-message') as HTMLElement,
  btnReiniciar: document.getElementById('btn-reiniciar') as HTMLButtonElement,
};

// ============================================
// ESTADO DEL JUEGO
// ============================================

let estado: Estado = crearEstadoInicial();

// ============================================
// FUNCIONES DE UI
// ============================================

/** Muestra una pantalla y oculta las demás */
function mostrarPantalla(pantalla: EstadoJuego): void {
  Object.values(pantallas).forEach(p => p.classList.remove('active'));
  pantallas[pantalla]?.classList.add('active');
}

/** Actualiza la barra de estadísticas */
function actualizarStats(): void {
  elementos.statRonda.textContent = `${estado.rondaActual} / ${estado.totalRondas}`;
  elementos.statPuntuacion.textContent = String(estado.puntuacion);

  const progreso = obtenerProgreso(estado);
  elementos.progressFill.style.width = `${progreso * 100}%`;
}

/** Obtiene iniciales para el avatar */
function obtenerIniciales(remitente: string): string {
  const partes = remitente.trim().split(/\s+/);
  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/** Renderiza el caso actual en la pantalla de partida */
function renderizarCaso(caso: CasoEstafa): void {
  elementos.messageSender.textContent = caso.remitente;
  elementos.messageAvatar.textContent = obtenerIniciales(caso.remitente);
  elementos.messageMeta.textContent = caso.esEstafa ? '⚠ Posible estafa' : '✓ Verificado';
  elementos.messageMeta.style.color = caso.esEstafa ? 'var(--color-danger)' : 'var(--color-success)';
  elementos.messageContent.textContent = caso.contenido;
}

/** Renderiza la explicación después de responder */
function renderizarExplicacion(): void {
  if (!estado.casoActual || estado.acierto === null) return;

  const esCorrecto = estado.acierto;
  const caso = estado.casoActual;

  // Configurar clases
  elementos.explanation.className = 'explanation';
  elementos.explanation.classList.add(esCorrecto ? 'correct' : 'incorrect');

  // Título
  elementos.explanationTitle.innerHTML = `
    <svg class="explanation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${esCorrecto
        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
      }
    </svg>
    ${esCorrecto ? '¡Correcto!' : 'Incorrecto'}
  `;

  // Texto principal
  elementos.explanationText.textContent = caso.explicacion;

  // Señales
  elementos.explanationSignals.innerHTML = '';
  caso.señales.forEach(señal => {
    const li = document.createElement('li');
    li.textContent = señal;
    elementos.explanationSignals.appendChild(li);
  });
}

/** Renderiza la pantalla final */
function renderizarFinal(): void {
  const gano = haGanado(estado);

  elementos.finalIcon.className = 'final-icon';
  elementos.finalIcon.classList.add(gano ? 'success' : 'failure');
  elementos.finalIcon.innerHTML = gano
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="36" height="36"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="36" height="36"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

  elementos.finalTitle.className = 'final-title';
  elementos.finalTitle.classList.add(gano ? 'success' : 'failure');
  elementos.finalTitle.textContent = gano ? '¡Has ganado!' : 'Sigue practicando';

  elementos.finalScore.textContent = `${estado.puntuacion} puntos`;
  elementos.finalMessage.textContent = obtenerMensajeFinal(estado);
}

/** Resetea la UI al estado inicial */
function resetearUI(): void {
  elementos.btnEstafa.disabled = false;
  elementos.btnLegitimo.disabled = false;
  elementos.btnContinuar.disabled = false;
}

/** Deshabilita botones de respuesta */
function deshabilitarBotonesRespuesta(): void {
  elementos.btnEstafa.disabled = true;
  elementos.btnLegitimo.disabled = true;
}

// ============================================
// MANEJADORES DE EVENTOS
// ============================================

function handleIniciar(): void {
  if (iniciarPartida(estado)) {
    resetearUI();
    actualizarStats();
    renderizarCaso(estado.casoActual!);
    mostrarPantalla('partida');
  }
}

function handleRespuesta(respuesta: RespuestaJugador): void {
  if (responder(estado, respuesta)) {
    deshabilitarBotonesRespuesta();
    renderizarExplicacion();
    mostrarPantalla('respuesta');
  }
}

function handleContinuar(): void {
  if (continuar(estado)) {
    resetearUI();
    if (estado.estadoActual === 'final') {
      renderizarFinal();
      mostrarPantalla('final');
    } else {
      actualizarStats();
      renderizarCaso(estado.casoActual!);
      mostrarPantalla('partida');
    }
  }
}

function handleReiniciar(): void {
  if (reiniciar(estado)) {
    resetearUI();
    mostrarPantalla('inicio');
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

function init(): void {
  // Event listeners
  elementos.btnIniciar.addEventListener('click', handleIniciar);
  elementos.btnEstafa.addEventListener('click', () => handleRespuesta('estafa'));
  elementos.btnLegitimo.addEventListener('click', () => handleRespuesta('legitimo'));
  elementos.btnContinuar.addEventListener('click', handleContinuar);
  elementos.btnReiniciar.addEventListener('click', handleReiniciar);

  // Teclado: Enter/Espacio en botones
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLElement;
      if (target.matches('button:not(:disabled)')) {
        target.click();
      }
    }
  });

  // Pantalla inicial
  mostrarPantalla('inicio');
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}