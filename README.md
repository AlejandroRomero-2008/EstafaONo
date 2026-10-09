# ¿Estafa o no? 🎮

Juego educativo interactivo para aprender a identificar estafas digitales, phishing, smishing y fraudes online.

## 🎯 Objetivo educativo

Enseñar a los usuarios a reconocer las señales de alerta en mensajes sospechosos (SMS, emails, notificaciones) mediante una experiencia de juego interactiva, sencilla y entretenida. El jugador analiza casos reales y debe decidir si «Es una estafa» o «Parece legítimo», recibiendo explicaciones detalladas tras cada respuesta.

## 🕹️ Instrucciones para jugar

1. Pulsa **«Comenzar partida»**
2. Lee el mensaje que aparece en pantalla (remitente + contenido)
3. Decide si es una estafa o parece legítimo pulsando el botón correspondiente
4. Lee la explicación con las señales clave para identificar ese tipo de fraude
5. Pulsa **«Continuar»** para la siguiente ronda
6. Completa las 5 rondas y mira tu puntuación final
7. ¡Vuelve a jugar para mejorar tu puntuación!

**Puntuación:** +10 puntos por acierto. Se necesitan **30 puntos** (3 de 5) para ganar.

## ✨ Efectos visuales

- **Fondo futurista animado:** gradientes en movimiento, rejilla tipo grid y orbes de luz flotantes
- **Al responder correctamente:** flash verde a pantalla completa con «¡Bárbaro!» y +10 puntos
- **Al fallar:** flash rojo a pantalla completa con «LOSER» y vibración de la interfaz
- **Con 50/50 puntos (nota perfecta):** 🎉 ¡confeti multiplataforma!

## 🛠️ Tecnologías utilizadas

- **Vite** - Bundler y servidor de desarrollo
- **TypeScript** - Tipado estático
- **HTML5 / CSS3** - Estructura y estilos (sin frameworks)
- **Vitest** - Tests unitarios
- **Git / GitHub** - Control de versiones
- **GitHub Pages** - Despliegue

## 📁 Estructura de carpetas

```
EstafaONo/
├── index.html           # HTML principal
├── package.json         # Dependencias y scripts
├── tsconfig.json        # Configuración TypeScript
├── vite.config.ts       # Configuración Vite
├── .gitignore           # Archivos ignorados por Git
├── README.md            # Este archivo
├── PROMPTS.md           # Documentación de prompts usados
├── src/
│   ├── main.ts          # Punto de entrada - UI y eventos
│   ├── logica.ts        # Lógica del juego (separada del DOM)
│   └── estilo.css       # Estilos responsive y accesibles
└── test/
    └── logica.test.ts   # Tests automatizados (37 tests)
```

## ⚙️ Requisitos de instalación

- **Node.js** ≥ 18 (incluye npm)
- **Git** ≥ 2.30

### Verificar instalación

```bash
node --version
npm --version
git --version
```

## 📦 Comandos

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala dependencias |
| `npm run dev` | Inicia servidor de desarrollo (puerto 3000) |
| `npm run build` | Compila para producción (carpeta `dist/`) |
| `npm run preview` | Previsualiza build de producción |
| `npm test` | Ejecuta tests unitarios |
| `npm run test:watch` | Tests en modo watch |
| `npx tsc --noEmit` | Verifica tipos TypeScript sin compilar |

## 🌐 Enlace público

🎮 **Juego publicado:** https://alejandroromero-2008.github.io/EstafaONo/

Para abrirlo desde tu teléfono con datos móviles, escribe esa URL en el navegador del móvil.

## 📝 Mi experiencia personal

> **Apartado pendiente para completar por el estudiante:**
>
> - Qué dirigí personalmente durante el desarrollo:
> - Qué error encontré durante las pruebas y cómo lo solucioné:

## 🤖 Declaración de transparencia

Este proyecto ha sido desarrollado bajo mi dirección utilizando un agente de IA (OpenCode) como asistente de programación. Todas las decisiones de diseño, arquitectura, funcionalidad y validación final han sido tomadas por mí como estudiante y responsable del proyecto.

---

**Licencia:** Uso educativo - Proyecto de práctica formativa