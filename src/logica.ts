/**
 * Lógica del juego "¿Estafa o no?"
 * Separada completamente de la interfaz (DOM, window, alert, console.log)
 */

// ============================================
// TIPOS
// ============================================

export type EstadoJuego = 'inicio' | 'partida' | 'respuesta' | 'final';

export type RespuestaJugador = 'estafa' | 'legitimo';

export interface CasoEstafa {
  id: number;
  remitente: string;
  contenido: string;
  esEstafa: boolean;
  explicacion: string;
  señales: string[];
}

export interface Estado {
  estadoActual: EstadoJuego;
  puntuacion: number;
  rondaActual: number;
  totalRondas: number;
  casoActual: CasoEstafa | null;
  respuestaJugador: RespuestaJugador | null;
  acierto: boolean | null;
  casosUsados: number[];
}

// ============================================
// CONFIGURACIÓN
// ============================================

export const CONFIG = {
  /** Número total de rondas por partida */
  TOTAL_RONDAS: 5,
  /** Puntos por acierto */
  PUNTOS_ACIERTO: 10,
  /** Puntos mínimos para victoria */
  PUNTOS_VICTORIA: 30,
  /** Tamaño mínimo de botón táctil (píxeles) */
  MIN_TOUCH_TARGET: 44,
  /** Tamaño mínimo de fuente (píxeles) */
  MIN_FONT_SIZE: 16,
} as const;

// ============================================
// CASOS DE ESTAFA (BASE DE DATOS)
// ============================================

export const CASOS_ESTAFA: CasoEstafa[] = [
  {
    id: 1,
    remitente: '+34 600 123 456',
    contenido: '¡Enhorabuena! Has ganado un iPhone 15 Pro. Solo necesitas pagar 2,99 € de envío. Introduce tu tarjeta aquí: bit.ly/premio-falso',
    esEstafa: true,
    explicacion: 'Es una estafa clásica de "premio falso". Las empresas legítimas nunca piden datos de tarjeta para enviar un premio.',
    señales: [
      'Solicita pago por un "premio gratis"',
      'Enlace acortado (bit.ly) que oculta la URL real',
      'Remitente número genérico, no empresa verificada',
      'Urgencia implícita para actuar rápido',
    ],
  },
  {
    id: 2,
    remitente: 'Banco Santander',
    contenido: 'Estimado cliente: Hemos detectado actividad sospechosa en su cuenta. Verifique su identidad ahora: https://banco-santander-verificacion.xyz/login',
    esEstafa: true,
    explicacion: 'Suplantación de identidad bancaria (phishing). El dominio no es oficial (.xyz en lugar de .es/.com) y los bancos no piden credenciales por SMS.',
    señales: [
      'Dominio sospechoso (.xyz, no oficial)',
      'Solicita credenciales bancarias por enlace',
      'Crea urgencia con "actividad sospechosa"',
      'No usa el nombre real del cliente',
    ],
  },
  {
    id: 3,
    remitente: 'Amazon',
    contenido: 'Tu pedido #ES-12345678 ha sido enviado. Rastrea tu paquete: https://www.amazon.es/tu-cuenta/pedidos',
    esEstafa: false,
    explicacion: 'Mensaje legítimo de Amazon. El enlace apunta al dominio oficial amazon.es y dirige a tu cuenta, no pide datos.',
    señales: [
      'Dominio oficial (amazon.es)',
      'Enlace directo a la zona de cuenta del usuario',
      'No solicita información personal ni pagos',
      'Número de pedido con formato realista',
    ],
  },
  {
    id: 4,
    remitente: 'Soporte Microsoft',
    contenido: 'Su cuenta ha sido comprometida. Restablezca su contraseña inmediatamente: http://micros0ft-security-alert.com/reset',
    esEstafa: true,
    explicacion: 'Phishing suplantando a Microsoft. El dominio usa "0" en lugar de "o" (micros0ft) y no es microsoft.com.',
    señales: [
      'Dominio con suplantación visual (0 en vez de o)',
      'No es el dominio oficial microsoft.com',
      'Crea pánico con "cuenta comprometida"',
      'Enlace HTTP (no HTTPS seguro)',
    ],
  },
  {
    id: 5,
    remitente: 'Correos España',
    contenido: 'Su paquete no pudo ser entregado. Reprograme la entrega pagando 1,50 €: https://correos-es-pago.top/entrega',
    esEstafa: true,
    explicacion: 'Estafa de paquete falso (smishing). Correos no cobra reprogramaciones por SMS ni usa dominios .top.',
    señales: [
      'Solicita pago inesperado por entrega',
      'Dominio .top no oficial (correos.es es el real)',
      'Táctica de paquete no entregado muy común',
      'Enlace directo a página de pago',
    ],
  },
  {
    id: 6,
    remitente: 'Google',
    contenido: 'Nuevo inicio de sesión en tu cuenta desde Madrid. Si no fuiste tú, revisa: https://myaccount.google.com/security',
    esEstafa: false,
    explicacion: 'Aviso de seguridad legítimo de Google. El enlace va a myaccount.google.com (dominio oficial) y no pide contraseña.',
    señales: [
      'Dominio oficial google.com',
      'Enlace a panel de seguridad del usuario',
      'No solicita credenciales',
      'Informa de ubicación y permite verificar',
    ],
  },
  {
    id: 7,
    remitente: '+34 655 987 654',
    contenido: 'Hola, soy tu nieto. Tengo un problema urgente y necesito 500 € ahora. Te devuelvo mañana. Bizum al 655 987 654',
    esEstafa: true,
    explicacion: 'Estafa del "nieto en apuros" (vishing/smishing). Urgencia emocional, pide dinero por Bizum a número desconocido.',
    señales: [
      'Urgencia emocional y presión temporal',
      'Pide dinero por Bizum/transferencia inmediata',
      'No verifica identidad (llama "abuelo/a")',
      'Número personal, no entidad oficial',
    ],
  },
  {
    id: 8,
    remitente: 'Netflix',
    contenido: 'No pudimos procesar tu pago. Actualiza tu método de pago: https://www.netflix.com/account/payment',
    esEstafa: false,
    explicacion: 'Comunicación legítima de Netflix. El enlace va al dominio oficial netflix.com y a la sección de cuenta.',
    señales: [
      'Dominio oficial netflix.com',
      'Enlace a gestión de cuenta/pago oficial',
      'No pide datos por SMS, redirige a web',
      'Problema de pago real y común',
    ],
  },
  {
    id: 9,
    remitente: 'Hacienda',
    contenido: 'Le notificamos una devolución de 342,10 €. Confirme sus datos bancarios: https://aeat-gob-es.devolucion.fake/confirmar',
    esEstafa: true,
    explicacion: 'Suplantación de Agencia Tributaria. Hacienda nunca pide datos bancarios por SMS/email. Dominio falso con subdominios engañosos.',
    señales: [
      'Dominio falso (aeat-gob-es.devolucion.fake)',
      'Hacienda no pide datos bancarios por SMS',
      'Oferta de dinero inesperada para atraer',
      'Subdominios que imitan a la web oficial',
    ],
  },
  {
    id: 10,
    remitente: 'WhatsApp',
    contenido: 'Tu código de verificación es: 847291. No lo compartas con nadie.',
    esEstafa: false,
    explicacion: 'Código de verificación legítimo de WhatsApp. Nunca se debe compartir, y WhatsApp lo envía sin enlaces ni peticiones.',
    señales: [
      'Solo informa un código, no pide acción',
      'Advertencia explícita de no compartir',
      'Sin enlaces ni solicitudes de datos',
      'Formato estándar de verificación 2FA',
    ],
  },
];

// ============================================
// FUNCIONES DE LÓGICA
// ============================================

/**
 * Crea el estado inicial del juego
 */
export function crearEstadoInicial(): Estado {
  return {
    estadoActual: 'inicio',
    puntuacion: 0,
    rondaActual: 0,
    totalRondas: CONFIG.TOTAL_RONDAS,
    casoActual: null,
    respuestaJugador: null,
    acierto: null,
    casosUsados: [],
  };
}

/**
 * Selecciona un caso aleatorio no usado aún
 */
export function obtenerCasoAleatorio(casosUsados: number[]): CasoEstafa {
  const disponibles = CASOS_ESTAFA.filter(c => !casosUsados.includes(c.id));
  if (disponibles.length === 0) {
    // Si se agotaron, reiniciar lista (no debería pasar en partida normal)
    return CASOS_ESTAFA[Math.floor(Math.random() * CASOS_ESTAFA.length)];
  }
  const indice = Math.floor(Math.random() * disponibles.length);
  return disponibles[indice];
}

/**
 * Inicia una nueva partida
 */
export function iniciarPartida(estado: Estado): boolean {
  if (estado.estadoActual !== 'inicio' && estado.estadoActual !== 'final') {
    return false; // Solo se puede iniciar desde inicio o final
  }
  estado.estadoActual = 'partida';
  estado.puntuacion = 0;
  estado.rondaActual = 1;
  estado.casosUsados = [];
  estado.casoActual = obtenerCasoAleatorio(estado.casosUsados);
  estado.casosUsados.push(estado.casoActual.id);
  estado.respuestaJugador = null;
  estado.acierto = null;
  return true;
}

/**
 * Procesa la respuesta del jugador
 */
export function responder(estado: Estado, respuesta: RespuestaJugador): boolean {
  if (estado.estadoActual !== 'partida') {
    return false; // Solo se puede responder en estado partida
  }
  if (!estado.casoActual) {
    return false;
  }
  if (respuesta !== 'estafa' && respuesta !== 'legitimo') {
    return false; // Respuesta inválida
  }

  estado.respuestaJugador = respuesta;
  const esCorrecto = (respuesta === 'estafa' && estado.casoActual.esEstafa) ||
                     (respuesta === 'legitimo' && !estado.casoActual.esEstafa);
  estado.acierto = esCorrecto;

  if (esCorrecto) {
    estado.puntuacion += CONFIG.PUNTOS_ACIERTO;
  }

  estado.estadoActual = 'respuesta';
  return true;
}

/**
 * Avanza a la siguiente ronda o finaliza la partida
 */
export function continuar(estado: Estado): boolean {
  if (estado.estadoActual !== 'respuesta') {
    return false; // Solo desde estado respuesta
  }

  if (estado.rondaActual >= CONFIG.TOTAL_RONDAS) {
    estado.estadoActual = 'final';
    return true;
  }

  estado.rondaActual += 1;
  estado.casoActual = obtenerCasoAleatorio(estado.casosUsados);
  estado.casosUsados.push(estado.casoActual.id);
  estado.respuestaJugador = null;
  estado.acierto = null;
  estado.estadoActual = 'partida';
  return true;
}

/**
 * Reinicia el juego al estado inicial
 */
export function reiniciar(estado: Estado): boolean {
  if (estado.estadoActual !== 'final') {
    return false; // Solo se reinicia desde final
  }
  const nuevoEstado = crearEstadoInicial();
  Object.assign(estado, nuevoEstado);
  return true;
}

/**
 * Verifica si el jugador ganó (puntuación >= victoria)
 */
export function haGanado(estado: Estado): boolean {
  return estado.puntuacion >= CONFIG.PUNTOS_VICTORIA;
}

/**
 * Obtiene el progreso actual (0-1)
 */
export function obtenerProgreso(estado: Estado): number {
  if (estado.totalRondas === 0) return 0;
  return Math.min(estado.rondaActual / estado.totalRondas, 1);
}

/**
 * Obtiene mensaje de resultado final
 */
export function obtenerMensajeFinal(estado: Estado): string {
  const gano = haGanado(estado);
  if (gano) {
    return `¡Felicidades! Has superado la prueba con ${estado.puntuacion} puntos. Sabes identificar estafas.`;
  }
  return `Partida terminada. Puntuación: ${estado.puntuacion}. Sigue practicando para detectar mejor las estafas.`;
}