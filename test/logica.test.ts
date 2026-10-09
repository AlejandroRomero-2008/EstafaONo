/**
 * Pruebas automatizadas para la lógica del juego
 * Vitest - Ejecutar con: npm test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  crearEstadoInicial,
  iniciarPartida,
  responder,
  continuar,
  reiniciar,
  haGanado,
  obtenerProgreso,
  obtenerMensajeFinal,
  obtenerCasoAleatorio,
  CONFIG,
  CASOS_ESTAFA,
  type Estado,
  type RespuestaJugador,
} from '../src/logica.js';

// ============================================
// TESTS
// ============================================

describe('Estado inicial', () => {
  it('debe crear el estado inicial correcto', () => {
    const estado = crearEstadoInicial();

    expect(estado.estadoActual).toBe('inicio');
    expect(estado.puntuacion).toBe(0);
    expect(estado.rondaActual).toBe(0);
    expect(estado.totalRondas).toBe(CONFIG.TOTAL_RONDAS);
    expect(estado.casoActual).toBeNull();
    expect(estado.respuestaJugador).toBeNull();
    expect(estado.acierto).toBeNull();
    expect(estado.casosUsados).toEqual([]);
  });
});

describe('Iniciar partida', () => {
  let estado: Estado;

  beforeEach(() => {
    estado = crearEstadoInicial();
  });

  it('debe iniciar partida desde estado inicio', () => {
    const resultado = iniciarPartida(estado);

    expect(resultado).toBe(true);
    expect(estado.estadoActual).toBe('partida');
    expect(estado.puntuacion).toBe(0);
    expect(estado.rondaActual).toBe(1);
    expect(estado.casoActual).not.toBeNull();
    expect(estado.casosUsados).toHaveLength(1);
    expect(estado.respuestaJugador).toBeNull();
    expect(estado.acierto).toBeNull();
  });

  it('debe iniciar partida desde estado final', () => {
    // Simular estado final
    estado.estadoActual = 'final';
    estado.puntuacion = 50;

    const resultado = iniciarPartida(estado);

    expect(resultado).toBe(true);
    expect(estado.estadoActual).toBe('partida');
    expect(estado.puntuacion).toBe(0);
    expect(estado.rondaActual).toBe(1);
  });

  it('NO debe iniciar partida desde estado partida', () => {
    estado.estadoActual = 'partida';

    const resultado = iniciarPartida(estado);

    expect(resultado).toBe(false);
    expect(estado.estadoActual).toBe('partida'); // Sin cambios
  });

  it('NO debe iniciar partida desde estado respuesta', () => {
    estado.estadoActual = 'respuesta';

    const resultado = iniciarPartida(estado);

    expect(resultado).toBe(false);
  });
});

describe('Responder', () => {
  let estado: Estado;

  beforeEach(() => {
    estado = crearEstadoInicial();
    iniciarPartida(estado);
  });

  it('debe procesar respuesta correcta (estafa real)', () => {
    // Forzar un caso que sea estafa
    const casoEstafa = CASOS_ESTAFA.find(c => c.esEstafa)!;
    estado.casoActual = casoEstafa;
    estado.casosUsados = [casoEstafa.id];

    const resultado = responder(estado, 'estafa');

    expect(resultado).toBe(true);
    expect(estado.respuestaJugador).toBe('estafa');
    expect(estado.acierto).toBe(true);
    expect(estado.puntuacion).toBe(CONFIG.PUNTOS_ACIERTO);
    expect(estado.estadoActual).toBe('respuesta');
  });

  it('debe procesar respuesta correcta (legítimo real)', () => {
    const casoLegitimo = CASOS_ESTAFA.find(c => !c.esEstafa)!;
    estado.casoActual = casoLegitimo;
    estado.casosUsados = [casoLegitimo.id];

    const resultado = responder(estado, 'legitimo');

    expect(resultado).toBe(true);
    expect(estado.acierto).toBe(true);
    expect(estado.puntuacion).toBe(CONFIG.PUNTOS_ACIERTO);
  });

  it('debe procesar respuesta incorrecta (dijo estafa pero era legítimo)', () => {
    const casoLegitimo = CASOS_ESTAFA.find(c => !c.esEstafa)!;
    estado.casoActual = casoLegitimo;
    estado.casosUsados = [casoLegitimo.id];

    const resultado = responder(estado, 'estafa');

    expect(resultado).toBe(true);
    expect(estado.acierto).toBe(false);
    expect(estado.puntuacion).toBe(0);
  });

  it('debe procesar respuesta incorrecta (dijo legítimo pero era estafa)', () => {
    const casoEstafa = CASOS_ESTAFA.find(c => c.esEstafa)!;
    estado.casoActual = casoEstafa;
    estado.casosUsados = [casoEstafa.id];

    const resultado = responder(estado, 'legitimo');

    expect(resultado).toBe(true);
    expect(estado.acierto).toBe(false);
    expect(estado.puntuacion).toBe(0);
  });

  it('NO debe permitir responder si no está en estado partida', () => {
    estado.estadoActual = 'inicio';

    const resultado = responder(estado, 'estafa');

    expect(resultado).toBe(false);
  });

  it('NO debe permitir respuesta inválida', () => {
    const resultado = responder(estado, 'invalido' as RespuestaJugador);

    expect(resultado).toBe(false);
  });

  it('NO debe permitir responder sin caso actual', () => {
    estado.casoActual = null;

    const resultado = responder(estado, 'estafa');

    expect(resultado).toBe(false);
  });
});

describe('Continuar', () => {
  let estado: Estado;

  beforeEach(() => {
    estado = crearEstadoInicial();
    iniciarPartida(estado);
    // Forzar estado respuesta
    estado.estadoActual = 'respuesta';
    estado.acierto = true;
  });

  it('debe avanzar a la siguiente ronda si no es la última', () => {
    estado.rondaActual = 1;

    const resultado = continuar(estado);

    expect(resultado).toBe(true);
    expect(estado.rondaActual).toBe(2);
    expect(estado.estadoActual).toBe('partida');
    expect(estado.casoActual).not.toBeNull();
    expect(estado.casosUsados).toHaveLength(2);
    expect(estado.respuestaJugador).toBeNull();
    expect(estado.acierto).toBeNull();
  });

  it('debe ir a estado final si es la última ronda', () => {
    estado.rondaActual = CONFIG.TOTAL_RONDAS;

    const resultado = continuar(estado);

    expect(resultado).toBe(true);
    expect(estado.estadoActual).toBe('final');
  });

  it('NO debe continuar si no está en estado respuesta', () => {
    estado.estadoActual = 'partida';

    const resultado = continuar(estado);

    expect(resultado).toBe(false);
  });

  it('NO debe continuar desde estado inicio', () => {
    estado.estadoActual = 'inicio';

    const resultado = continuar(estado);

    expect(resultado).toBe(false);
  });
});

describe('Reiniciar', () => {
  it('debe reiniciar desde estado final', () => {
    const estado = crearEstadoInicial();
    estado.estadoActual = 'final';
    estado.puntuacion = 40;
    estado.rondaActual = 5;
    estado.casosUsados = [1, 2, 3, 4, 5];

    const resultado = reiniciar(estado);

    expect(resultado).toBe(true);
    expect(estado.estadoActual).toBe('inicio');
    expect(estado.puntuacion).toBe(0);
    expect(estado.rondaActual).toBe(0);
    expect(estado.casosUsados).toEqual([]);
    expect(estado.casoActual).toBeNull();
  });

  it('NO debe reiniciar si no está en estado final', () => {
    const estado = crearEstadoInicial();
    estado.estadoActual = 'partida';

    const resultado = reiniciar(estado);

    expect(resultado).toBe(false);
  });
});

describe('Condiciones de victoria/derrota', () => {
  it('debe detectar victoria con puntuación >= 30', () => {
    const estado = crearEstadoInicial();
    estado.puntuacion = 30;

    expect(haGanado(estado)).toBe(true);
  });

  it('debe detectar victoria con puntuación > 30', () => {
    const estado = crearEstadoInicial();
    estado.puntuacion = 50;

    expect(haGanado(estado)).toBe(true);
  });

  it('debe detectar derrota con puntuación < 30', () => {
    const estado = crearEstadoInicial();
    estado.puntuacion = 20;

    expect(haGanado(estado)).toBe(false);
  });

  it('debe detectar derrota con puntuación 0', () => {
    const estado = crearEstadoInicial();
    estado.puntuacion = 0;

    expect(haGanado(estado)).toBe(false);
  });
});

describe('Progreso', () => {
  it('debe ser 0 al inicio', () => {
    const estado = crearEstadoInicial();
    expect(obtenerProgreso(estado)).toBe(0);
  });

  it('debe calcular progreso correctamente', () => {
    const estado = crearEstadoInicial();
    estado.rondaActual = 3;
    estado.totalRondas = 5;

    expect(obtenerProgreso(estado)).toBe(0.6);
  });

  it('no debe exceder 1', () => {
    const estado = crearEstadoInicial();
    estado.rondaActual = 10;
    estado.totalRondas = 5;

    expect(obtenerProgreso(estado)).toBe(1);
  });
});

describe('Mensaje final', () => {
  it('debe mostrar mensaje de victoria', () => {
    const estado = crearEstadoInicial();
    estado.puntuacion = 40;

    const mensaje = obtenerMensajeFinal(estado);

    expect(mensaje).toContain('Felicidades');
    expect(mensaje).toContain('40');
  });

  it('debe mostrar mensaje de derrota', () => {
    const estado = crearEstadoInicial();
    estado.puntuacion = 10;

    const mensaje = obtenerMensajeFinal(estado);

    expect(mensaje).toContain('terminada');
    expect(mensaje).toContain('10');
  });
});

describe('Obtener caso aleatorio', () => {
  it('debe devolver un caso válido', () => {
    const caso = obtenerCasoAleatorio([]);

    expect(caso).toBeDefined();
    expect(CASOS_ESTAFA).toContain(caso);
  });

  it('no debe devolver casos ya usados', () => {
    const caso1 = obtenerCasoAleatorio([]);
    const caso2 = obtenerCasoAleatorio([caso1.id]);

    expect(caso2.id).not.toBe(caso1.id);
  });
});

describe('Flujo completo de partida', () => {
  it('debe completar una partida de 5 rondas y reiniciar', () => {
    const estado = crearEstadoInicial();

    // Iniciar
    expect(iniciarPartida(estado)).toBe(true);
    expect(estado.estadoActual).toBe('partida');

    // 5 rondas
    for (let i = 1; i <= CONFIG.TOTAL_RONDAS; i++) {
      expect(estado.rondaActual).toBe(i);
      expect(estado.estadoActual).toBe('partida');

      // Responder (usar respuesta correcta para simplicidad)
      const esEstafa = estado.casoActual!.esEstafa;
      expect(responder(estado, esEstafa ? 'estafa' : 'legitimo')).toBe(true);
      expect(estado.estadoActual).toBe('respuesta');

      // Continuar
      if (i < CONFIG.TOTAL_RONDAS) {
        expect(continuar(estado)).toBe(true);
        expect(estado.estadoActual).toBe('partida');
      } else {
        expect(continuar(estado)).toBe(true);
        expect(estado.estadoActual).toBe('final');
      }
    }

    // Verificar estado final
    expect(estado.rondaActual).toBe(CONFIG.TOTAL_RONDAS);
    expect(estado.casosUsados).toHaveLength(CONFIG.TOTAL_RONDAS);

    // Reiniciar
    expect(reiniciar(estado)).toBe(true);
    expect(estado.estadoActual).toBe('inicio');
    expect(estado.puntuacion).toBe(0);
    expect(estado.rondaActual).toBe(0);
  });
});

describe('Constantes y configuración', () => {
  it('debe tener CONFIG con valores correctos', () => {
    expect(CONFIG.TOTAL_RONDAS).toBe(5);
    expect(CONFIG.PUNTOS_ACIERTO).toBe(10);
    expect(CONFIG.PUNTOS_VICTORIA).toBe(30);
    expect(CONFIG.MIN_TOUCH_TARGET).toBe(44);
    expect(CONFIG.MIN_FONT_SIZE).toBe(16);
  });

  it('debe tener al menos 10 casos de estafa', () => {
    expect(CASOS_ESTAFA.length).toBeGreaterThanOrEqual(10);
  });

  it('cada caso debe tener propiedades requeridas', () => {
    CASOS_ESTAFA.forEach(caso => {
      expect(caso.id).toBeTypeOf('number');
      expect(caso.remitente).toBeTypeOf('string');
      expect(caso.contenido).toBeTypeOf('string');
      expect(caso.esEstafa).toBeTypeOf('boolean');
      expect(caso.explicacion).toBeTypeOf('string');
      expect(Array.isArray(caso.señales)).toBe(true);
      expect(caso.señales.length).toBeGreaterThan(0);
    });
  });
});