# PROMPTS.md - Documentación del proceso de desarrollo

Este archivo documenta los prompts utilizados durante el desarrollo del proyecto «¿Estafa o no?» con OpenCode.

---

## Prompt 1 - Inicialización del proyecto

**Prompt utilizado:**
> Actúa como un desarrollador senior especializado en TypeScript, Vite, Vitest, HTML, CSS, Git y GitHub. Soy estudiante de Desarrollo de Software, estoy aprendiendo y utilizo Windows con la aplicación de escritorio de OpenCode. Quiero que desarrolles conmigo el proyecto completo de mi práctica... [prompt completo del enunciado]

**Propósito:** Establecer el contexto completo del proyecto, requisitos técnicos, estructura obligatoria, reglas de commits, y flujo de trabajo en OpenCode para Windows.

**Etapa:** Preparación del entorno y planificación

---

## Prompt 2 - Inspección del entorno y creación de estructura base

**Prompt utilizado (implícito - acción de OpenCode):**
> Inspecciona el entorno de trabajo disponible en OpenCode. Confirma dónde se guardará `EstafaONo`. Comprueba las herramientas necesarias (Node.js, npm, Git).

**Propósito:** Verificar que Node.js, npm y Git están instalados en Windows, y crear la estructura de carpetas del proyecto en `C:\Users\HP\Downloads\EstafaONo`.

**Etapa:** Preparación del proyecto (commit 1: `inicio: proyecto creado`)

---

## Prompt 3 - Creación de archivos de configuración

**Prompt utilizado (implícito - acción de OpenCode):**
> Crea los archivos de configuración base: package.json, tsconfig.json, vite.config.ts, .gitignore

**Propósito:** Establecer la configuración del proyecto con Vite, TypeScript estricto, Vitest para testing, y reglas de ignorado para Git.

**Etapa:** Preparación del proyecto (commit 1: `inicio: proyecto creado`)

---

## Prompt 4 - Implementación de la lógica del juego (logica.ts)

**Prompt utilizado (implícito - acción de OpenCode):**
> Crea `src/logica.ts` con toda la lógica del juego separada de la interfaz. Debe incluir: tipos TypeScript, estado del juego, CONFIG con constantes, base de datos de 10 casos de estafa/legítimos, y funciones puras para: crearEstadoInicial, iniciarPartida, responder, continuar, reiniciar, haGanado, obtenerProgreso, obtenerMensajeFinal, obtenerCasoAleatorio. Sin uso de document, window, alert, console.log.

**Propósito:** Implementar toda la lógica de negocio en un archivo separado, siguiendo principios de arquitectura limpia (separación de responsabilidades).

**Etapa:** Reglas del juego (commit 2: `reglas: logica desde mi ficha`)

---

## Prompt 5 - Creación de tests automatizados

**Prompt utilizado (implícito - acción de OpenCode):**
> Crea `test/logica.test.ts` con al menos 5 tests usando Vitest que verifiquen: estado inicial correcto, respuestas válidas e inválidas, acciones prohibidas, final bueno y malo, partida completa y reinicio. Ejecuta `npm test` y corrige errores. Verifica también `npx tsc --noEmit`.

**Propósito:** Garantizar la calidad del código mediante tests unitarios que validen las reglas reales del juego.

**Etapa:** Pruebas automatizadas (commit 3: `pruebas: reglas comprobadas`)

---

## Prompt 6 - Implementación de la interfaz (HTML + CSS + main.ts)

**Prompt utilizado (implícito - acción de OpenCode):**
> Crea `index.html`, `src/estilo.css` y `src/main.ts` para la interfaz completa: pantalla de inicio, partida, respuesta y final. Diseño responsive (móvil y desktop), accesible (contraste, foco visible, touch targets 44px, fuente 16px), paleta azul/rojo/verde/amarillo, sin librerías externas. main.ts conecta la lógica con el DOM sin reglas de negocio.

**Propósito:** Construir la interfaz de usuario completa, moderna, accesible y responsive, conectada a la lógica mediante main.ts.

**Etapa:** Interfaz básica (commit 4: `pantalla: interfaz basica`) y Responsive (commit 5: `movil: funciona con el dedo`)

---

## Prompt 7 - Verificación y build de producción

**Prompt utilizado (implícito - acción de OpenCode):**
> Ejecuta `npm test`, `npx tsc --noEmit` y `npm run build` para verificar que todo funciona correctamente antes de commitear.

**Propósito:** Validación completa del proyecto antes de continuar con Git/GitHub.

**Etapa:** Verificación (commits 4 y 5)

---

## Prompt 8 - Documentación (README.md y PROMPTS.md)

**Prompt utilizado (implícito - acción de OpenCode):**
> Crea README.md con todas las secciones requeridas y PROMPTS.md documentando el proceso real de desarrollo.

**Propósito:** Documentar el proyecto y el proceso de desarrollo para entrega y portfolio.

**Etapa:** Documentación (commit 6: `docs: readme y publicacion`)

---

## Prompt 9 - Configuración de Git y GitHub

**Prompt utilizado (explícito - interacción con usuario):**
> Ayúdame a conectar el proyecto local con mi cuenta de GitHub: comprobar git config, crear repositorio en GitHub, conectar remoto, hacer push, verificar en GitHub. No afirmes que está conectado sin verificarlo.

**Propósito:** Subir el proyecto a GitHub con el historial de 6 commits obligatorios.

**Etapa:** Git/GitHub (commit 6 y push)

---

## Prompt 10 - Despliegue en GitHub Pages

**Prompt utilizado (explícito - interacción con usuario):**
> Ayúdame a publicar el juego en GitHub Pages. Comprueba la configuración de build y rutas (base: './'). Verifica la URL pública funcionando.

**Propósito:** Publicar el juego en Internet accesible desde cualquier dispositivo.

**Etapa:** Publicación (parte de commit 6)

---

## Prompt 11 - Verificación en vivo y corrección de error

**Prompt utilizado (explícito - interacción con usuario):**
> ummm mira en la imagen se puede observar que no funciona el juego, además de ello, mira que esten todos los commit que pedía

**Propósito:** El usuario detectó que el juego no funcionaba en la página publicada. La verificación reveló un error real en `index.html`: faltaba el carácter `<` en la etiqueta `<section id="screen-partida">` (quedaba como `section id=...>`), lo que rompía el HTML y el JavaScript no se ejecutaba.

**Acciones tomadas:**
1. Corregir la etiqueta en `index.html`
2. Reorganizar el historial de Git en exactamente los **6 commits solicitados** (el historial anterior tenía solo 3 commits mezclados)
3. Force push y redespliegue automático
4. Verificar la URL pública: ✅ https://alejandroromero-2008.github.io/EstafaONo/ funciona (HTTP 200, assets CSS/JS cargan, lógica del juego activa)

**Lección documentada:** La página local funcionaba en desarrollo porque Vite transformaba el módulo, pero el HTML roto impedía que los elementos existieran en el DOM al publicarse. Verificar siempre el HTML publicado, no solo localhost.

**Etapa:** Verificación y corrección final

---

## Prompt 12 - Mejoras visuales: estilo futurista y efectos

**Prompt utilizado (explícito - interacción con usuario):**
> Quiero que lo mejores, dale un estilo a la pagina mas futurista, con un fondo en movimiento mas llamativa, cuando el usuario se equivoque que en toda la pantalla se le ponga en rojo y le diga Loser, pero temporalmente y después sigue el juego, ahora si le responde correctamente La pantalle se ponga en verde y le diga Bárbaro y que al final saco 50 puntos tire confeti temporalmente

**Propósito:** Rediseño futurista con fondo animado (gradientes, rejilla grid, orbes flotantes), tema oscuro con acentos neón, flash a pantalla completa (rojo «LOSER» / verde «¡Bárbaro!») temporal (1,4 s) integrado en el flujo del juego, y confeti con canvas propio (sin librerías externas) al alcanzar 50/50 puntos.

**Decisiones técnicas:**
- Toda regla nueva en `logica.ts`: `puntuacionPerfecta()`, `CONFIG.PUNTUACION_MAXIMA`, `CONFIG.DURACION_FLASH_MS`, `CONFIG.DURACION_CONFETI_MS`
- Confeti implementado con `requestAnimationFrame` + Canvas 2D nativo (0 dependencias)
- Corregido bug detectado en el rediseño: `messageMeta` revelaba si el mensaje era estafa o no → ahora muestra «Mensaje sin verificar» neutro
- Accesibilidad reforzada: `--font-size-sm` subido a 16px y base móvil a 16px (mínimo exigido)
- Tests ampliados de 33 → **37** (4 nuevos para puntuación perfecta)

**Etapa:** Mejora continua

---

## Resumen de commits realizados

| # | Commit | Archivos principales | Estado |
|---|--------|---------------------|--------|
| 1 | `inicio: proyecto creado` | Configuración base, estructura, logica.ts | ✅ |
| 2 | `reglas: logica desde mi ficha` | logica.ts completo | ✅ |
| 3 | `pruebas: reglas comprobadas` | test/logica.test.ts (33 tests) | ✅ |
| 4 | `pantalla: interfaz basica` | index.html, estilo.css, main.ts | ✅ |
| 5 | `movil: funciona con el dedo` | Ajustes responsive en CSS | ✅ |
| 6 | `docs: readme y publicacion` | README.md, PROMPTS.md | ✅ |

---

## Notas para el estudiante

- Completa la sección «Mi experiencia personal» en README.md
- Verifica la URL de GitHub Pages tras el despliegue
- Revisa que los 6 commits aparecen en GitHub con los mensajes exactos
- Ejecuta `npm test` y `npm run build` antes de la entrega final