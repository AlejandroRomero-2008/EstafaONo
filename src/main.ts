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
  puntuacionPerfecta,
  CONFIG,
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

  // Feedback visual
  flashOverlay: document.getElementById('flash-overlay') as HTMLElement,
  flashIcono: document.getElementById('flash-icono') as HTMLElement,
  flashTexto: document.getElementById('flash-texto') as HTMLElement,
  flashSubtexto: document.getElementById('flash-subtexto') as HTMLElement,
  confetiCanvas: document.getElementById('confeti-canvas') as HTMLCanvasElement,
  app: document.querySelector('.app') as HTMLElement,
};

// Iconos SVG para el flash
const ICONO_CORRECTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="100%" height="100%"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
const ICONO_INCORRECTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="100%" height="100%"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

// ============================================
// ESTADO DEL JUEGO
// ============================================

let estado: Estado = crearEstadoInicial();
let timeoutFlash: number | undefined;
let animacionConfeti: number | undefined;

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
  // Mensaje neutro: NO debe revelar si es estafa o no
  elementos.messageMeta.textContent = 'Mensaje sin verificar';
  elementos.messageMeta.style.color = 'var(--color-warning)';
  elementos.messageContent.textContent = caso.contenido;
}

/** Muestra el flash de pantalla completa: verde+Bárbaro o rojo+Loser */
function mostrarFlash(acierto: boolean): void {
  if (timeoutFlash !== undefined) {
    window.clearTimeout(timeoutFlash);
  }

  elementos.flashOverlay.className = 'flash-overlay activo';
  elementos.flashOverlay.classList.add(acierto ? 'correcto' : 'incorrecto');
  elementos.flashOverlay.setAttribute('aria-hidden', 'false');

  elementos.flashIcono.innerHTML = acierto ? ICONO_CORRECTO : ICONO_INCORRECTO;
  elementos.flashIcono.style.color = acierto ? '#4ade80' : '#f87171';
  elementos.flashTexto.textContent = acierto ? '¡Bárbaro!' : 'LOSER';
  elementos.flashSubtexto.textContent = acierto ? '+10 puntos' : 'Has caído... ¡analiza mejor!';

  // Vibración del contenido al fallar
  if (!acierto) {
    elementos.app.classList.remove('shake');
    void elementos.app.offsetWidth; // reinicia la animación
    elementos.app.classList.add('shake');
  }

  timeoutFlash = window.setTimeout(() => {
    elementos.flashOverlay.classList.remove('activo');
    elementos.flashOverlay.setAttribute('aria-hidden', 'true');
    elementos.app.classList.remove('shake');
  }, CONFIG.DURACION_FLASH_MS);
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
  const perfecta = puntuacionPerfecta(estado);

  elementos.finalIcon.className = 'final-icon';
  elementos.finalIcon.classList.add(gano ? 'success' : 'failure');
  elementos.finalIcon.innerHTML = perfecta
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="36" height="36"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>'
    : gano
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="36" height="36"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="36" height="36"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

  elementos.finalTitle.className = 'final-title';
  elementos.finalTitle.classList.add(gano ? 'success' : 'failure');
  elementos.finalTitle.textContent = perfecta ? '¡Puntuación perfecta!' : gano ? '¡Has ganado!' : 'Sigue practicando';

  elementos.finalScore.textContent = `${estado.puntuacion} puntos`;
  elementos.finalMessage.textContent = perfecta
    ? '¡50 de 50! Eres un cazador de estafas experto. ¡Imparable!'
    : obtenerMensajeFinal(estado);

  // ¡Confeti con puntuación perfecta!
  if (perfecta) {
    lanzarConfeti();
  }
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
// CONFETI (implementación propia, sin librerías)
// ============================================

interface Particula {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  color: string;
  velocidadY: number;
  velocidadX: number;
  rotacion: number;
  velocidadRotacion: number;
  oscilacion: number;
}

const COLORES_CONFETI = ['#38bdf8', '#22c55e', '#eab308', '#ef4444', '#a78bfa', '#f472b6', '#ffffff'];

function lanzarConfeti(): void {
  const canvas = elementos.confetiCanvas;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('activo');

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particulas: Particula[] = [];
  const cantidad = 220;

  for (let i = 0; i < cantidad; i++) {
    particulas.push({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height * 0.8 - 20,
      ancho: 8 + Math.random() * 6,
      alto: 12 + Math.random() * 8,
      color: COLORES_CONFETI[Math.floor(Math.random() * COLORES_CONFETI.length)],
      velocidadY: 2 + Math.random() * 3.5,
      velocidadX: (Math.random() - 0.5) * 2,
      rotacion: Math.random() * Math.PI * 2,
      velocidadRotacion: (Math.random() - 0.5) * 0.2,
      oscilacion: Math.random() * Math.PI * 2,
    });
  }

  const inicio = performance.now();

  function animar(ahora: number): void {
    const transcurrido = ahora - inicio;
    if (transcurrido > CONFIG.DURACION_CONFETI_MS) {
      if (animacionConfeti !== undefined) {
        cancelAnimationFrame(animacionConfeti);
        animacionConfeti = undefined;
      }
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      canvas.classList.remove('activo');
      return;
    }

    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    particulas.forEach(p => {
      p.velocidadY += 0.02; // gravedad suave
      p.y += p.velocidadY;
      p.oscilacion += 0.05;
      p.x += p.velocidadX + Math.sin(p.oscilacion) * 1.2;
      p.rotacion += p.velocidadRotacion;

      ctx?.save();
      ctx?.translate(p.x, p.y);
      ctx?.rotate(p.rotacion);
      ctx!.fillStyle = p.color;
      ctx!.globalAlpha = Math.max(0, 1 - transcurrido / CONFIG.DURACION_CONFETI_MS);
      ctx?.fillRect(-p.ancho / 2, -p.alto / 2, p.ancho, p.alto);
      ctx?.restore();
    });

    animacionConfeti = requestAnimationFrame(animar);
  }

  animacionConfeti = requestAnimationFrame(animar);
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
    actualizarStats();
    mostrarFlash(estado.acierto === true);
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
    // Limpiar efectos activos
    if (timeoutFlash !== undefined) window.clearTimeout(timeoutFlash);
    if (animacionConfeti !== undefined) {
      cancelAnimationFrame(animacionConfeti);
      animacionConfeti = undefined;
    }
    elementos.confetiCanvas.classList.remove('activo');
    elementos.flashOverlay.classList.remove('activo');
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

  // Ajustar canvas al cambiar tamaño de ventana
  window.addEventListener('resize', () => {
    elementos.confetiCanvas.width = window.innerWidth;
    elementos.confetiCanvas.height = window.innerHeight;
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