/**
 * ================================================================
 * LOGIC NEXUS — Motor del Juego
 * Lógica Matemática Interactiva
 * ================================================================
 *
 * ESTRUCTURA:
 *  1. Configuración y constantes
 *  2. Banco de preguntas (por dificultad)
 *  3. Motor de audio (Web Audio API)
 *  4. Canvas de fondo animado
 *  5. Navegación entre pantallas
 *  6. Lógica del juego (inicio, preguntas, respuestas, fin)
 *  7. Tipos de reto: múltiple opción, tabla de verdad, drag & drop
 *  8. Sistema de puntuación y vidas
 *  9. Efectos visuales y mensajes motivacionales
 * 10. Inicialización
 */

'use strict';

/* ================================================================
   1. CONFIGURACIÓN Y CONSTANTES
================================================================ */

/** Parámetros ajustables por nivel */
const DIFFICULTY_CONFIG = {
  easy: {
    label: 'FÁCIL',
    timePerQuestion: 30,   // segundos
    pointsPerQuestion: 10,
    questionCount: 10,
    speedBonus: 10,        // puntos extra máximos por velocidad
  },
  medium: {
    label: 'MEDIO',
    timePerQuestion: 20,
    pointsPerQuestion: 20,
    questionCount: 10,
    speedBonus: 15,
  },
  hard: {
    label: 'DIFÍCIL',
    timePerQuestion: 15,
    pointsPerQuestion: 40,
    questionCount: 10,
    speedBonus: 20,
  },
};

const TOTAL_LIVES = 3;
const LIFE_ICON   = '♥';
const STORAGE_KEY = 'mathnexus_hiscore';

/** Estado global de la partida */
let state = {
  difficulty: 'easy',
  score: 0,
  lives: TOTAL_LIVES,
  currentQuestion: 0,
  questions: [],
  timerInterval: null,
  timeLeft: 30,
  totalTime: 30,
  answeredCorrect: 0,
  blocked: false,   // bloquea interacción durante feedback
};

/* ================================================================
   2. BANCO DE PREGUNTAS
   Cada objeto puede ser de tipo:
     - 'multiple'   : opción múltiple clásica
     - 'truefalse'  : verdadero / falso
     - 'truth-table': completar una tabla de verdad
     - 'drag'       : arrastrar y soltar conectores/valores
================================================================ */

const QUESTIONS = {

  // ══════════════════════════════════════════════════════════
  // NIVEL FÁCIL — Fracciones y Porcentajes básicos
  // ══════════════════════════════════════════════════════════
  easy: [
    // ── FRACCIONES ───────────────────────────────────────────
    {
      type: 'multiple',
      topic: 'Fracciones',
      badge: 'FRACCIONES',
      text: '¿Cuál es la forma <strong>simplificada</strong> de la fracción 6/8?',
      options: [
        { text: '3/4', correct: true },
        { text: '2/3', correct: false },
        { text: '1/2', correct: false },
        { text: '4/6', correct: false },
      ],
      explanation: 'Para simplificar 6/8 se divide numerador y denominador entre su MCD (2): 6÷2 = 3 y 8÷2 = 4. Resultado: 3/4.',
    },
    {
      type: 'multiple',
      topic: 'Fracciones',
      badge: 'FRACCIONES',
      text: '¿Cuánto es <strong>1/2 + 1/3</strong>?',
      options: [
        { text: '2/5', correct: false },
        { text: '5/6', correct: true },
        { text: '3/5', correct: false },
        { text: '2/6', correct: false },
      ],
      explanation: 'Se busca el mínimo común denominador (6): 1/2 = 3/6 y 1/3 = 2/6. Suma: 3/6 + 2/6 = 5/6.',
    },
    {
      type: 'multiple',
      topic: 'Fracciones',
      badge: 'FRACCIONES',
      text: '¿Cuánto es <strong>3/4 − 1/4</strong>?',
      options: [
        { text: '1/4', correct: false },
        { text: '2/8', correct: false },
        { text: '1/2', correct: true },
        { text: '3/8', correct: false },
      ],
      explanation: '3/4 − 1/4 = 2/4 = 1/2. Cuando los denominadores son iguales se restan los numeradores y se simplifica.',
    },
    {
      type: 'multiple',
      topic: 'Fracciones',
      badge: 'FRACCIONES',
      text: '¿Cuánto es <strong>2/3 + 1/6</strong>?',
      options: [
        { text: '3/9', correct: false },
        { text: '5/6', correct: true },
        { text: '3/6', correct: false },
        { text: '1/2', correct: false },
      ],
      explanation: 'MCD = 6: 2/3 = 4/6. Suma: 4/6 + 1/6 = 5/6.',
    },
    {
      type: 'truefalse',
      topic: 'Fracciones',
      badge: 'FRACCIONES',
      text: '¿Es correcto que <strong>4/6 = 2/3</strong>?',
      options: [
        { text: '✓ Sí, son equivalentes', correct: true },
        { text: '✗ No, son diferentes', correct: false },
      ],
      explanation: 'Dividiendo numerador y denominador de 4/6 entre 2 obtenemos 2/3. Son fracciones equivalentes.',
    },
    {
      type: 'multiple',
      topic: 'Fracciones',
      badge: 'SIMPLIFICACIÓN',
      text: '¿Cuál es la fracción <strong>equivalente</strong> a 3/5?',
      options: [
        { text: '6/10', correct: true },
        { text: '4/6', correct: false },
        { text: '9/20', correct: false },
        { text: '6/15', correct: false },
      ],
      explanation: 'Multiplicando numerador y denominador de 3/5 por 2: 6/10. Las fracciones equivalentes se obtienen multiplicando o dividiendo ambos términos por el mismo número.',
    },
    {
      type: 'multiple',
      topic: 'Fracciones',
      badge: 'FRACCIONES',
      text: '¿Cuánto es <strong>1/4 + 3/8</strong>?',
      options: [
        { text: '4/12', correct: false },
        { text: '5/8', correct: true },
        { text: '4/8', correct: false },
        { text: '1/2', correct: false },
      ],
      explanation: 'MCD = 8: 1/4 = 2/8. Suma: 2/8 + 3/8 = 5/8.',
    },

    // ── PORCENTAJES ──────────────────────────────────────────
    {
      type: 'multiple',
      topic: 'Porcentajes',
      badge: 'PORCENTAJES',
      text: '¿Cuánto es el <strong>20% de 50</strong>?',
      options: [
        { text: '5', correct: false },
        { text: '10', correct: true },
        { text: '15', correct: false },
        { text: '20', correct: false },
      ],
      explanation: '20% de 50 = (20/100) × 50 = 0.20 × 50 = 10.',
    },
    {
      type: 'multiple',
      topic: 'Porcentajes',
      badge: 'DESCUENTO',
      text: 'Un producto cuesta $80.000 y tiene un <strong>descuento del 25%</strong>. ¿Cuánto se paga?',
      options: [
        { text: '$55.000', correct: false },
        { text: '$60.000', correct: true },
        { text: '$65.000', correct: false },
        { text: '$70.000', correct: false },
      ],
      explanation: 'Descuento = 25% × 80.000 = 20.000. Precio final = 80.000 − 20.000 = $60.000.',
    },
    {
      type: 'multiple',
      topic: 'Porcentajes',
      badge: 'PORCENTAJES',
      text: '¿Qué porcentaje representa <strong>15 de 60</strong>?',
      options: [
        { text: '20%', correct: false },
        { text: '25%', correct: true },
        { text: '30%', correct: false },
        { text: '15%', correct: false },
      ],
      explanation: 'Porcentaje = (15/60) × 100 = 0.25 × 100 = 25%.',
    },
    {
      type: 'truefalse',
      topic: 'Porcentajes',
      badge: 'IVA',
      text: 'Si un artículo vale $100.000 y el IVA es del 19%, el precio final es <strong>$119.000</strong>.',
      options: [
        { text: '✓ Correcto', correct: true },
        { text: '✗ Incorrecto', correct: false },
      ],
      explanation: 'IVA = 19% × 100.000 = 19.000. Precio final = 100.000 + 19.000 = $119.000.',
    },
    {
      type: 'multiple',
      topic: 'Porcentajes',
      badge: 'PORCENTAJES',
      text: '¿Cuánto es el <strong>15% de 200</strong>?',
      options: [
        { text: '20', correct: false },
        { text: '25', correct: false },
        { text: '30', correct: true },
        { text: '35', correct: false },
      ],
      explanation: '15% de 200 = (15/100) × 200 = 0.15 × 200 = 30.',
    },
    {
      type: 'multiple',
      topic: 'Porcentajes',
      badge: 'AUMENTO',
      text: 'Un salario de $1.200.000 aumenta un <strong>10%</strong>. ¿Cuál es el nuevo salario?',
      options: [
        { text: '$1.300.000', correct: false },
        { text: '$1.320.000', correct: true },
        { text: '$1.310.000', correct: false },
        { text: '$1.200.100', correct: false },
      ],
      explanation: 'Aumento = 10% × 1.200.000 = 120.000. Nuevo salario = 1.200.000 + 120.000 = $1.320.000.',
    },
  ],

  // ══════════════════════════════════════════════════════════
  // NIVEL MEDIO — Regla de 3 y Tablas de Verdad
  // ══════════════════════════════════════════════════════════
  medium: [
    // ── REGLA DE 3 ───────────────────────────────────────────
    {
      type: 'multiple',
      topic: 'Regla de 3',
      badge: 'REGLA DE 3',
      text: 'Si <strong>5 cuadernos cuestan $15.000</strong>, ¿cuánto cuestan 8 cuadernos?',
      options: [
        { text: '$20.000', correct: false },
        { text: '$24.000', correct: true },
        { text: '$22.000', correct: false },
        { text: '$25.000', correct: false },
      ],
      explanation: 'Regla de 3 directa: 5 → $15.000, entonces 8 → (8 × 15.000) / 5 = 120.000 / 5 = $24.000.',
    },
    {
      type: 'multiple',
      topic: 'Regla de 3',
      badge: 'REGLA DE 3',
      text: 'Si <strong>3 obreros terminan una obra en 12 días</strong>, ¿cuántos días tardarán 6 obreros en terminarla? (regla inversa)',
      options: [
        { text: '24 días', correct: false },
        { text: '6 días', correct: true },
        { text: '8 días', correct: false },
        { text: '4 días', correct: false },
      ],
      explanation: 'Regla de 3 inversa (a más obreros, menos días): 3 × 12 = 6 × x → x = 36/6 = 6 días.',
    },
    {
      type: 'multiple',
      topic: 'Regla de 3',
      badge: 'REGLA DE 3',
      text: 'Si <strong>2 kg de arroz cuestan $6.400</strong>, ¿cuánto cuestan 5 kg?',
      options: [
        { text: '$14.000', correct: false },
        { text: '$16.000', correct: true },
        { text: '$12.800', correct: false },
        { text: '$18.000', correct: false },
      ],
      explanation: 'Regla de 3 directa: 2 → $6.400, entonces 5 → (5 × 6.400) / 2 = 32.000 / 2 = $16.000.',
    },
    {
      type: 'multiple',
      topic: 'Regla de 3',
      badge: 'REGLA DE 3',
      text: 'Si <strong>4 máquinas producen 200 piezas en 1 hora</strong>, ¿cuántas piezas producen 10 máquinas?',
      options: [
        { text: '400 piezas', correct: false },
        { text: '500 piezas', correct: true },
        { text: '300 piezas', correct: false },
        { text: '450 piezas', correct: false },
      ],
      explanation: 'Regla de 3 directa: 4 → 200, entonces 10 → (10 × 200) / 4 = 2000 / 4 = 500 piezas.',
    },
    {
      type: 'truefalse',
      topic: 'Regla de 3',
      badge: 'REGLA DE 3',
      text: 'En la regla de 3 <strong>inversa</strong>, cuando una cantidad aumenta, la otra <strong>disminuye</strong>.',
      options: [
        { text: '✓ Correcto', correct: true },
        { text: '✗ Incorrecto', correct: false },
      ],
      explanation: 'Sí. En la regla de 3 inversa las magnitudes son inversamente proporcionales: a más de una, menos de la otra. Ej: más obreros → menos días.',
    },
    {
      type: 'multiple',
      topic: 'Regla de 3',
      badge: 'REGLA DE 3',
      text: 'Si <strong>6 litros de gasolina alcanzan para 90 km</strong>, ¿cuántos litros se necesitan para 150 km?',
      options: [
        { text: '8 litros', correct: false },
        { text: '10 litros', correct: true },
        { text: '12 litros', correct: false },
        { text: '9 litros', correct: false },
      ],
      explanation: 'Regla de 3 directa: 6 → 90 km, entonces x → 150 km: x = (6 × 150) / 90 = 900 / 90 = 10 litros.',
    },

    // ── TABLAS DE VERDAD ─────────────────────────────────────
    {
      type: 'truth-table',
      topic: 'Tabla de Verdad AND',
      badge: 'TABLA DE VERDAD',
      text: 'Completa la tabla de verdad de P <span class="logic-sym">∧</span> Q (AND). Haz clic en cada "?" para alternar V/F.',
      table: {
        headers: ['P', 'Q', 'P ∧ Q'],
        rows: [
          ['V', 'V', { answer: 'V', editable: true }],
          ['V', 'F', { answer: 'F', editable: true }],
          ['F', 'V', { answer: 'F', editable: true }],
          ['F', 'F', { answer: 'F', editable: true }],
        ],
      },
      explanation: 'P ∧ Q (AND) es Verdadero SOLO cuando ambas proposiciones son verdaderas. En los demás casos es Falso.',
    },
    {
      type: 'truth-table',
      topic: 'Tabla de Verdad OR',
      badge: 'TABLA DE VERDAD',
      text: 'Completa la tabla de verdad de P <span class="logic-sym">∨</span> Q (OR).',
      table: {
        headers: ['P', 'Q', 'P ∨ Q'],
        rows: [
          ['V', 'V', { answer: 'V', editable: true }],
          ['V', 'F', { answer: 'V', editable: true }],
          ['F', 'V', { answer: 'V', editable: true }],
          ['F', 'F', { answer: 'F', editable: true }],
        ],
      },
      explanation: 'P ∨ Q (OR) es Falso SOLO cuando ambas son Falsas. En los demás casos es Verdadero.',
    },
    {
      type: 'multiple',
      topic: 'Tablas de Verdad',
      badge: 'TABLA DE VERDAD',
      text: 'Si P = <strong>Verdadero</strong> y Q = <strong>Falso</strong>, entonces P <span class="logic-sym">∧</span> Q es...',
      options: [
        { text: 'Verdadero', correct: false },
        { text: 'Falso', correct: true },
        { text: 'Indefinido', correct: false },
        { text: 'Depende', correct: false },
      ],
      explanation: 'AND es verdadero solo cuando AMBAS son V. Como Q = F, el resultado es F.',
    },
    {
      type: 'multiple',
      topic: 'Tablas de Verdad',
      badge: 'NEGACIÓN ¬',
      text: 'Si P = <strong>Verdadero</strong>, entonces <span class="logic-sym">¬</span>P (NOT P) es...',
      options: [
        { text: 'Verdadero', correct: false },
        { text: 'Falso', correct: true },
        { text: 'Igual a P', correct: false },
        { text: 'Indefinido', correct: false },
      ],
      explanation: 'La negación ¬P invierte el valor: si P = V entonces ¬P = F. Si P = F entonces ¬P = V.',
    },
  ],

  // ══════════════════════════════════════════════════════════
  // NIVEL DIFÍCIL — Conjunción avanzada + Fracciones/Porcentajes combinados
  // ══════════════════════════════════════════════════════════
  hard: [
    // ── CONJUNCIÓN LÓGICA AVANZADA ───────────────────────────
    {
      type: 'multiple',
      topic: 'Conjunción',
      badge: 'CONJUNCIÓN ∧',
      text: '¿Cuál es la negación de "Estudio <span class="logic-sym">∧</span> Trabajo" según De Morgan?',
      options: [
        { text: 'No estudio ∧ No trabajo', correct: false },
        { text: 'No estudio ∨ No trabajo', correct: true },
        { text: 'Estudio ∨ No trabajo', correct: false },
        { text: 'No estudio ∧ Trabajo', correct: false },
      ],
      explanation: 'Por la Ley de De Morgan: ¬(P ∧ Q) ≡ ¬P ∨ ¬Q. La negación de una conjunción es una disyunción de negaciones.',
    },
    {
      type: 'drag',
      topic: 'Conjunción tabla',
      badge: 'ARRASTRA Y SUELTA',
      text: 'Arrastra los valores correctos para completar la tabla de P <span class="logic-sym">∧</span> Q (AND).',
      dragData: {
        targets: [
          { id: 'and-vv', label: 'V ∧ V =', answer: 'V' },
          { id: 'and-vf', label: 'V ∧ F =', answer: 'F' },
          { id: 'and-fv', label: 'F ∧ V =', answer: 'F' },
          { id: 'and-ff', label: 'F ∧ F =', answer: 'F' },
        ],
        pieces: ['V', 'F', 'F', 'F'],
      },
      explanation: 'AND (∧) solo es V cuando AMBOS son V. En los otros 3 casos el resultado es F.',
    },
    {
      type: 'multiple',
      topic: 'Conjunción',
      badge: 'TAUTOLOGÍA',
      text: '¿La fórmula P <span class="logic-sym">∨</span> <span class="logic-sym">¬</span>P es una tautología?',
      options: [
        { text: 'Sí, siempre es Verdadera', correct: true },
        { text: 'No, puede ser Falsa', correct: false },
        { text: 'Es una contradicción', correct: false },
        { text: 'Depende del valor de P', correct: false },
      ],
      explanation: 'P ∨ ¬P (Ley del Tercero Excluido) es siempre Verdadera: si P=V entonces P∨¬P=V; si P=F entonces ¬P=V y P∨¬P=V.',
    },
    {
      type: 'truth-table',
      topic: 'Tabla condicional',
      badge: 'TABLA DE VERDAD',
      text: 'Completa la tabla del condicional P <span class="logic-sym">→</span> Q (Si P entonces Q).',
      table: {
        headers: ['P', 'Q', 'P → Q'],
        rows: [
          ['V', 'V', { answer: 'V', editable: true }],
          ['V', 'F', { answer: 'F', editable: true }],
          ['F', 'V', { answer: 'V', editable: true }],
          ['F', 'F', { answer: 'V', editable: true }],
        ],
      },
      explanation: 'P → Q es FALSO solo cuando P=V y Q=F (hipótesis verdadera, conclusión falsa). En los demás casos es Verdadero.',
    },
    {
      type: 'multiple',
      topic: 'Conjunción',
      badge: 'CONJUNCIÓN ∧',
      text: '¿Cuántos casos hacen <strong>Falsa</strong> la conjunción P <span class="logic-sym">∧</span> Q?',
      options: [
        { text: '1 caso', correct: false },
        { text: '2 casos', correct: false },
        { text: '3 casos', correct: true },
        { text: '4 casos', correct: false },
      ],
      explanation: 'De 4 combinaciones (VV, VF, FV, FF), P∧Q es F en 3: VF, FV y FF. Solo es V en VV.',
    },
    {
      type: 'multiple',
      topic: 'Conjunción',
      badge: 'BICONDICIONAL ↔',
      text: 'El bicondicional P <span class="logic-sym">↔</span> Q es Verdadero cuando...',
      options: [
        { text: 'P y Q tienen el mismo valor de verdad', correct: true },
        { text: 'P es Verdadero', correct: false },
        { text: 'Q es Falso', correct: false },
        { text: 'P y Q son siempre Falsos', correct: false },
      ],
      explanation: 'P ↔ Q (si y solo si) es V cuando ambos coinciden: V↔V=V y F↔F=V. Si difieren es F.',
    },

    // ── FRACCIONES + PORCENTAJES AVANZADOS ───────────────────
    {
      type: 'multiple',
      topic: 'Fracciones avanzadas',
      badge: 'FRACCIONES',
      text: '¿Cuánto es <strong>3/4 × 8/9</strong>?',
      options: [
        { text: '11/13', correct: false },
        { text: '2/3', correct: true },
        { text: '24/36', correct: false },
        { text: '1/2', correct: false },
      ],
      explanation: 'Multiplicación de fracciones: (3×8)/(4×9) = 24/36. Simplificando ÷12: 2/3.',
    },
    {
      type: 'multiple',
      topic: 'Porcentaje avanzado',
      badge: 'PORCENTAJE + FRACCIÓN',
      text: 'Un estudiante respondió bien <strong>18 de 24 preguntas</strong>. ¿Qué porcentaje de acierto tuvo?',
      options: [
        { text: '70%', correct: false },
        { text: '72%', correct: false },
        { text: '75%', correct: true },
        { text: '80%', correct: false },
      ],
      explanation: 'Porcentaje = (18/24) × 100 = 0.75 × 100 = 75%.',
    },
    {
      type: 'multiple',
      topic: 'Regla de 3 avanzada',
      badge: 'REGLA DE 3',
      text: 'Si <strong>8 empleados hacen el trabajo en 15 días</strong>, ¿cuántos días tardarían 12 empleados?',
      options: [
        { text: '12 días', correct: false },
        { text: '10 días', correct: true },
        { text: '8 días', correct: false },
        { text: '20 días', correct: false },
      ],
      explanation: 'Regla de 3 inversa: 8 × 15 = 12 × x → x = 120/12 = 10 días.',
    },
    {
      type: 'drag',
      topic: 'Tabla OR avanzada',
      badge: 'ARRASTRA Y SUELTA',
      text: 'Arrastra los valores correctos para la tabla de P <span class="logic-sym">∨</span> Q (OR).',
      dragData: {
        targets: [
          { id: 'or-vv', label: 'V ∨ V =', answer: 'V' },
          { id: 'or-vf', label: 'V ∨ F =', answer: 'V' },
          { id: 'or-fv', label: 'F ∨ V =', answer: 'V' },
          { id: 'or-ff', label: 'F ∨ F =', answer: 'F' },
        ],
        pieces: ['V', 'V', 'V', 'F'],
      },
      explanation: 'OR (∨) es F SOLO cuando ambos son F. En los demás 3 casos el resultado es V.',
    },
  ],
};


/* ================================================================
   3. MOTOR DE AUDIO — Web Audio API (sin archivos externos)
================================================================ */

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

/** Inicializa el contexto de audio (requiere gesto del usuario) */
function initAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

/**
 * Reproduce un tono sintético
 * @param {number} freq  Frecuencia en Hz
 * @param {number} dur   Duración en segundos
 * @param {'sine'|'square'|'sawtooth'} type Forma de onda
 * @param {number} vol   Volumen 0–1
 */
function playTone(freq, dur, type = 'sine', vol = 0.18) {
  if (!audioCtx) return;
  try {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) { /* silenciar en entornos restringidos */ }
}

/** Sonido de acierto (acorde ascendente) */
function soundCorrect() {
  playTone(523.25, 0.12, 'sine');
  setTimeout(() => playTone(659.25, 0.12, 'sine'), 90);
  setTimeout(() => playTone(783.99, 0.2, 'sine'), 180);
}

/** Sonido de error (tono descendente) */
function soundWrong() {
  playTone(220, 0.08, 'square', 0.12);
  setTimeout(() => playTone(180, 0.15, 'square', 0.10), 90);
}

/** Sonido de tiempo agotado */
function soundTimeout() {
  playTone(196, 0.3, 'sawtooth', 0.12);
}

/** Sonido de victoria */
function soundVictory() {
  [523, 587, 659, 698, 784, 880].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.18, 'sine'), i * 80)
  );
}

/** Sonido de derrota */
function soundDefeat() {
  [300, 250, 200].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.25, 'sawtooth', 0.15), i * 100)
  );
}

/* ================================================================
   4. CANVAS DE FONDO ANIMADO
   Partículas flotantes + símbolos lógicos al fondo
================================================================ */

const LOGIC_SYMBOLS = ['∧', '∨', '¬', '→', '↔', '%', '÷', '×', '½', '¾', '∑', 'V', 'F', '3/4', '≡'];

const bgCanvas = document.getElementById('bgCanvas');
const bgCtx    = bgCanvas.getContext('2d');

const particles = [];
const PARTICLE_COUNT = 55;

/** Genera una partícula aleatoria */
function createParticle() {
  return {
    x: Math.random() * bgCanvas.width,
    y: Math.random() * bgCanvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.4 + 0.1,
    symbol: Math.random() < 0.3 ? LOGIC_SYMBOLS[Math.floor(Math.random() * LOGIC_SYMBOLS.length)] : null,
    fontSize: Math.floor(Math.random() * 14 + 10),
    color: Math.random() < 0.5 ? '#00e5ff' : '#ff2d78',
    pulse: Math.random() * Math.PI * 2,
  };
}

/** Redimensiona y reinicializa el canvas */
function resizeBgCanvas() {
  bgCanvas.width  = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}

/** Dibuja y anima las partículas */
function animateBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  // Fondo con gradiente suave
  const grad = bgCtx.createRadialGradient(
    bgCanvas.width * 0.5, bgCanvas.height * 0.5, 0,
    bgCanvas.width * 0.5, bgCanvas.height * 0.5, bgCanvas.width * 0.7
  );
  grad.addColorStop(0, '#0c1628');
  grad.addColorStop(1, '#050a13');
  bgCtx.fillStyle = grad;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

  // Líneas de cuadrícula tenues
  bgCtx.strokeStyle = '#1b4a7a18';
  bgCtx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x < bgCanvas.width; x += gridSize) {
    bgCtx.beginPath(); bgCtx.moveTo(x, 0); bgCtx.lineTo(x, bgCanvas.height); bgCtx.stroke();
  }
  for (let y = 0; y < bgCanvas.height; y += gridSize) {
    bgCtx.beginPath(); bgCtx.moveTo(0, y); bgCtx.lineTo(bgCanvas.width, y); bgCtx.stroke();
  }

  // Partículas
  const now = performance.now() / 1000;
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.pulse += 0.02;
    if (p.x < 0) p.x = bgCanvas.width;
    if (p.x > bgCanvas.width) p.x = 0;
    if (p.y < 0) p.y = bgCanvas.height;
    if (p.y > bgCanvas.height) p.y = 0;

    const alpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

    if (p.symbol) {
      bgCtx.font = `${p.fontSize}px 'Orbitron', monospace`;
      bgCtx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
      bgCtx.fillText(p.symbol, p.x, p.y);
    } else {
      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      bgCtx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
      bgCtx.fill();
    }
  });

  requestAnimationFrame(animateBg);
}

/** Inicializa el canvas de fondo */
function initBgCanvas() {
  resizeBgCanvas();
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());
  animateBg();
  window.addEventListener('resize', resizeBgCanvas);
}

/* ================================================================
   5. NAVEGACIÓN ENTRE PANTALLAS
================================================================ */

/**
 * Muestra una pantalla y oculta las demás
 * @param {string} id ID de la sección a mostrar
 */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

/* ================================================================
   6. LÓGICA DEL JUEGO
================================================================ */

/**
 * Inicia una nueva partida
 * @param {'easy'|'medium'|'hard'} difficulty
 */
function startGame(difficulty) {
  initAudio();

  const cfg = DIFFICULTY_CONFIG[difficulty];
  const pool = [...QUESTIONS[difficulty]];

  // Mezclar preguntas aleatoriamente
  shuffleArray(pool);

  // Reiniciar estado
  state = {
    difficulty,
    score: 0,
    lives: TOTAL_LIVES,
    currentQuestion: 0,
    questions: pool.slice(0, cfg.questionCount),
    timerInterval: null,
    timeLeft: cfg.timePerQuestion,
    totalTime: cfg.timePerQuestion,
    answeredCorrect: 0,
    blocked: false,
  };

  updateHUD();
  showScreen('screen-game');
  loadQuestion();
}

/** Carga la pregunta actual según el estado */
function loadQuestion() {
  const q   = state.questions[state.currentQuestion];
  const cfg = DIFFICULTY_CONFIG[state.difficulty];

  state.blocked  = false;
  state.timeLeft = cfg.timePerQuestion;
  state.totalTime = cfg.timePerQuestion;

  // Actualizar badge de tipo
  document.getElementById('question-type-badge').textContent = q.badge || 'RETO';

  // Actualizar texto con HTML (para símbolos inline)
  document.getElementById('question-text').innerHTML = q.text;

  // Limpiar áreas especiales
  document.getElementById('options-grid').innerHTML    = '';
  document.getElementById('truth-table-wrap').style.display = 'none';
  document.getElementById('drag-zone').style.display        = 'none';
  document.getElementById('options-grid').style.display     = 'grid';

  // Renderizar según tipo de pregunta
  switch (q.type) {
    case 'multiple':
    case 'truefalse':
      renderMultipleChoice(q);
      break;
    case 'truth-table':
      renderTruthTable(q);
      break;
    case 'drag':
      renderDragDrop(q);
      break;
  }

  // Barra de progreso
  const pct = (state.currentQuestion / state.questions.length) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';

  // Contador de pregunta
  document.getElementById('question-counter').textContent =
    `Pregunta ${state.currentQuestion + 1} / ${state.questions.length}`;

  // Iniciar temporizador
  clearInterval(state.timerInterval);
  updateTimerUI();
  state.timerInterval = setInterval(tickTimer, 1000);
}

/* ── Temporizador ───────────────────────────────────────────── */

/** Tick del temporizador: decrementa y comprueba */
function tickTimer() {
  state.timeLeft--;
  updateTimerUI();

  if (state.timeLeft <= 0) {
    clearInterval(state.timerInterval);
    soundTimeout();
    onTimeOut();
  }
}

/** Actualiza la UI del temporizador (número + arco SVG) */
function updateTimerUI() {
  const t = state.timeLeft;
  const el = document.getElementById('timer-display');
  const circle = document.getElementById('timer-svg-circle');
  const ring = document.querySelector('.timer-ring');

  el.textContent = t;

  // Calcular offset del arco SVG
  const pct = t / state.totalTime;
  const circumf = 2 * Math.PI * 26; // ≈ 163.36
  circle.style.strokeDashoffset = circumf * (1 - pct);

  // Urgencia visual cuando queda poco tiempo (< 30%)
  if (pct < 0.3) {
    ring.classList.add('urgent');
  } else {
    ring.classList.remove('urgent');
  }
}

/** Se llama cuando se acaba el tiempo */
function onTimeOut() {
  if (state.blocked) return;
  state.blocked = true;

  // Marcar respuesta correcta visualmente
  highlightCorrectAnswer();
  loseLife();

  showFeedback(false, 0, '⌛ TIEMPO AGOTADO');
  setTimeout(nextQuestion, 2000);
}

/* ================================================================
   7. TIPOS DE RETO
================================================================ */

/* ── 7a. Opción múltiple ────────────────────────────────────── */

/**
 * Renderiza las opciones de opción múltiple o verdadero/falso
 * @param {object} q Pregunta
 */
function renderMultipleChoice(q) {
  const grid = document.getElementById('options-grid');

  // Mezclar opciones para que no siempre sea la primera la correcta
  const opts = [...q.options];
  if (q.type === 'multiple') shuffleArray(opts);

  opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="key-hint">${['A','B','C','D'][i]}</span>${opt.text}`;
    btn.dataset.correct = opt.correct;

    btn.addEventListener('click', () => {
      if (state.blocked) return;
      initAudio();
      handleMultipleAnswer(btn, opt.correct, q);
    });

    grid.appendChild(btn);
  });

  // Atajos de teclado A/B/C/D
  document.onkeydown = (e) => {
    if (state.blocked) return;
    const map = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    const idx = map[e.key.toLowerCase()];
    if (idx !== undefined) {
      const btns = grid.querySelectorAll('.option-btn');
      if (btns[idx]) btns[idx].click();
    }
  };
}

/**
 * Maneja la respuesta en opción múltiple
 * @param {HTMLElement} btn Botón presionado
 * @param {boolean} correct ¿Es correcta?
 * @param {object} q Pregunta
 */
function handleMultipleAnswer(btn, correct, q) {
  state.blocked = true;
  clearInterval(state.timerInterval);
  document.onkeydown = null;

  // Deshabilitar todos los botones
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

  if (correct) {
    btn.classList.add('correct');
    const bonus  = calcSpeedBonus();
    const points = DIFFICULTY_CONFIG[state.difficulty].pointsPerQuestion + bonus;
    state.score += points;
    state.answeredCorrect++;
    soundCorrect();
    spawnPointParticle(btn, `+${points}`);
    showFeedback(true, points, getMotivationalMsg(true));
  } else {
    btn.classList.add('wrong');
    highlightCorrectAnswer();
    loseLife();
    soundWrong();
    showFeedback(false, 0, getMotivationalMsg(false));
  }

  updateHUD();
  setTimeout(nextQuestion, 1800);
}

/* ── 7b. Tabla de verdad interactiva ───────────────────────── */

/**
 * Renderiza una tabla de verdad con celdas editables
 * @param {object} q Pregunta con campo `table`
 */
function renderTruthTable(q) {
  document.getElementById('options-grid').style.display = 'none';
  const wrap  = document.getElementById('truth-table-wrap');
  const table = document.getElementById('truth-table');
  wrap.style.display = 'block';
  table.innerHTML = '';

  const tbl = q.table;

  // Cabecera
  const thead = document.createElement('thead');
  const hrow  = document.createElement('tr');
  tbl.headers.forEach(h => {
    const th = document.createElement('th');
    th.innerHTML = h;
    hrow.appendChild(th);
  });
  thead.appendChild(hrow);
  table.appendChild(thead);

  // Cuerpo
  const tbody = document.createElement('tbody');
  const editableCells = [];

  tbl.rows.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = document.createElement('td');
      if (typeof cell === 'string') {
        td.textContent = cell;
        td.style.color = cell === 'V' ? '#00ff88' : '#ff3860';
      } else if (cell.editable) {
        // Celda a completar
        td.textContent = '?';
        td.classList.add('clickable');
        td.dataset.answer  = cell.answer;
        td.dataset.current = '?';
        td.addEventListener('click', () => toggleTableCell(td));
        editableCells.push(td);
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // Botón de verificar
  const verifyBtn = document.createElement('button');
  verifyBtn.className = 'btn btn-primary';
  verifyBtn.style.marginTop = '16px';
  verifyBtn.textContent = '✓ VERIFICAR TABLA';
  verifyBtn.addEventListener('click', () => {
    if (state.blocked) return;
    initAudio();
    verifyTruthTable(editableCells, q);
  });

  const wrap2 = document.getElementById('truth-table-wrap');
  wrap2.appendChild(verifyBtn);

  // Iniciar temporizador (ya corre desde loadQuestion)
}

/**
 * Alterna el valor de una celda editable (? → V → F → V → ...)
 * @param {HTMLTableCellElement} td
 */
function toggleTableCell(td) {
  if (state.blocked) return;
  const map = { '?': 'V', 'V': 'F', 'F': 'V' };
  const next = map[td.dataset.current] || 'V';
  td.dataset.current = next;
  td.textContent = next;
  td.style.color = next === 'V' ? '#00ff88' : '#ff3860';
}

/**
 * Verifica la tabla de verdad completada
 * @param {HTMLTableCellElement[]} cells Celdas editables
 * @param {object} q Pregunta
 */
function verifyTruthTable(cells, q) {
  state.blocked = true;
  clearInterval(state.timerInterval);

  let allCorrect = true;

  cells.forEach(td => {
    const ok = td.dataset.current === td.dataset.answer;
    td.classList.remove('clickable');
    td.classList.add(ok ? 'cell-correct' : 'cell-wrong');
    if (!ok) allCorrect = false;
  });

  // Deshabilitar botón de verificar
  const btn = document.querySelector('#truth-table-wrap .btn-primary');
  if (btn) btn.disabled = true;

  if (allCorrect) {
    const bonus  = calcSpeedBonus();
    const points = DIFFICULTY_CONFIG[state.difficulty].pointsPerQuestion + bonus;
    state.score += points;
    state.answeredCorrect++;
    soundCorrect();
    showFeedback(true, points, '¡TABLA PERFECTA!');
  } else {
    loseLife();
    soundWrong();
    showFeedback(false, 0, 'TABLA INCORRECTA');
  }

  updateHUD();
  setTimeout(nextQuestion, 2200);
}

/* ── 7c. Drag & Drop ────────────────────────────────────────── */

/** Estado del drag */
let dragState = { piece: null, pieceId: null };

/**
 * Renderiza el reto de arrastrar y soltar
 * @param {object} q Pregunta con campo `dragData`
 */
function renderDragDrop(q) {
  document.getElementById('options-grid').style.display = 'none';
  const zone    = document.getElementById('drag-zone');
  const targets = document.getElementById('drag-targets');
  const pieces  = document.getElementById('drag-pieces');
  zone.style.display = 'flex';
  targets.innerHTML  = '';
  pieces.innerHTML   = '';

  const data = q.dragData;

  // Mezclar piezas
  const shuffledPieces = shuffleArray([...data.pieces]);

  // Renderizar destinos
  data.targets.forEach(t => {
    const div = document.createElement('div');
    div.className = 'drag-target';
    div.dataset.id     = t.id;
    div.dataset.answer = t.answer;
    div.dataset.filled = '';

    const label = document.createElement('span');
    label.style.cssText = 'font-size:.7rem;color:var(--text-dim);margin-right:4px;';
    label.textContent = t.label + ' ';
    div.appendChild(label);

    const slot = document.createElement('span');
    slot.className  = 'slot-val';
    slot.textContent = '?';
    div.appendChild(slot);

    // Eventos de drop
    div.addEventListener('dragover',  e => { e.preventDefault(); div.classList.add('drag-over'); });
    div.addEventListener('dragleave', ()  => div.classList.remove('drag-over'));
    div.addEventListener('drop',      e  => handleDrop(e, div));

    // Touch support
    div.addEventListener('touchend', e => handleTouchDrop(e, div), { passive: false });

    targets.appendChild(div);
  });

  // Renderizar piezas arrastrables
  shuffledPieces.forEach((val, i) => {
    const div = document.createElement('div');
    div.className     = 'drag-piece';
    div.textContent   = val;
    div.draggable     = true;
    div.dataset.value = val;
    div.dataset.idx   = i;

    div.addEventListener('dragstart', e => {
      dragState.piece   = div;
      dragState.pieceId = i;
      div.classList.add('dragging');
      e.dataTransfer.setData('text', val);
    });
    div.addEventListener('dragend', () => div.classList.remove('dragging'));

    // Touch
    div.addEventListener('touchstart', e => touchStartDrag(e, div), { passive: false });
    div.addEventListener('touchmove',  touchMoveDrag, { passive: false });

    pieces.appendChild(div);
  });

  // Botón verificar
  const verifyBtn = document.createElement('button');
  verifyBtn.className = 'btn btn-primary';
  verifyBtn.style.cssText = 'margin-top:12px;align-self:center;';
  verifyBtn.textContent = '✓ VERIFICAR';
  verifyBtn.addEventListener('click', () => {
    if (state.blocked) return;
    initAudio();
    verifyDragDrop(q);
  });
  zone.appendChild(verifyBtn);
}

/** Maneja el drop en un destino */
function handleDrop(e, target) {
  e.preventDefault();
  target.classList.remove('drag-over');
  if (!dragState.piece) return;

  const val  = dragState.piece.dataset.value;
  const slot = target.querySelector('.slot-val');
  slot.textContent = val;
  target.dataset.filled = val;
  target.classList.add('filled');

  dragState.piece.classList.add('used');
  dragState.piece = null;
}

/** Touch drag: inicio */
let touchPiece = null, touchClone = null;
function touchStartDrag(e, div) {
  touchPiece = div;
  const rect = div.getBoundingClientRect();
  touchClone = div.cloneNode(true);
  touchClone.style.cssText = `position:fixed;opacity:.8;pointer-events:none;z-index:999;
    left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;`;
  document.body.appendChild(touchClone);
}
function touchMoveDrag(e) {
  if (!touchClone) return;
  e.preventDefault();
  const t = e.touches[0];
  touchClone.style.left = (t.clientX - 40) + 'px';
  touchClone.style.top  = (t.clientY - 20) + 'px';
}
function handleTouchDrop(e, target) {
  if (!touchPiece) return;
  e.preventDefault();
  if (touchClone) { touchClone.remove(); touchClone = null; }
  const val  = touchPiece.dataset.value;
  const slot = target.querySelector('.slot-val');
  slot.textContent = val;
  target.dataset.filled = val;
  target.classList.add('filled');
  touchPiece.classList.add('used');
  touchPiece = null;
}

/**
 * Verifica el reto drag & drop
 * @param {object} q Pregunta
 */
function verifyDragDrop(q) {
  state.blocked = true;
  clearInterval(state.timerInterval);

  const targets = document.querySelectorAll('.drag-target');
  let allCorrect = true;

  targets.forEach(t => {
    const filled = t.dataset.filled;
    const answer = t.dataset.answer;
    const ok = filled === answer;
    t.classList.add(ok ? 'cell-correct' : 'cell-wrong');
    if (!ok) allCorrect = false;
  });

  if (allCorrect) {
    const bonus  = calcSpeedBonus();
    const points = DIFFICULTY_CONFIG[state.difficulty].pointsPerQuestion + bonus;
    state.score += points;
    state.answeredCorrect++;
    soundCorrect();
    showFeedback(true, points, '¡PERFECTO!');
  } else {
    loseLife();
    soundWrong();
    showFeedback(false, 0, 'INTÉNTALO DE NUEVO');
  }

  updateHUD();
  setTimeout(nextQuestion, 2200);
}

/* ================================================================
   8. SISTEMA DE PUNTUACIÓN Y VIDAS
================================================================ */

/** Calcula el bonus de velocidad según el tiempo restante */
function calcSpeedBonus() {
  const cfg = DIFFICULTY_CONFIG[state.difficulty];
  const pct = state.timeLeft / state.totalTime;
  return Math.floor(cfg.speedBonus * pct);
}

/** Quita una vida y comprueba si la partida termina */
function loseLife() {
  state.lives--;
  updateHUD();

  // Animar la vida perdida
  const lifeIcons = document.querySelectorAll('.life-icon');
  if (lifeIcons[state.lives]) {
    lifeIcons[state.lives].classList.add('lost');
  }

  if (state.lives <= 0) {
    setTimeout(endGame, 2100);
  }
}

/** Actualiza todos los elementos del HUD */
function updateHUD() {
  document.getElementById('score-display').textContent = state.score;

  // Vidas
  const lc = document.getElementById('lives-container');
  lc.innerHTML = '';
  for (let i = 0; i < TOTAL_LIVES; i++) {
    const span = document.createElement('span');
    span.className = 'life-icon' + (i >= state.lives ? ' lost' : '');
    span.textContent = LIFE_ICON;
    lc.appendChild(span);
  }
}

/** Resalta visualmente la respuesta correcta (para opción múltiple) */
function highlightCorrectAnswer() {
  document.querySelectorAll('.option-btn').forEach(btn => {
    if (btn.dataset.correct === 'true') btn.classList.add('correct');
  });
}

/* ================================================================
   9. EFECTOS VISUALES Y MENSAJES
================================================================ */

/**
 * Muestra el overlay de feedback (correcto/incorrecto)
 * @param {boolean} correct
 * @param {number}  points Puntos obtenidos
 * @param {string}  msg    Mensaje motivacional
 */
function showFeedback(correct, points, msg) {
  const overlay = document.getElementById('feedback-overlay');
  const icon    = document.getElementById('feedback-icon');
  const text    = document.getElementById('feedback-text');
  const pts     = document.getElementById('feedback-points');
  const motiv   = document.getElementById('motivational-msg');

  overlay.className = 'feedback-overlay show ' + (correct ? 'correct' : 'wrong');
  icon.textContent  = correct ? '✓' : '✗';
  text.textContent  = correct ? '¡CORRECTO!' : 'INCORRECTO';
  pts.textContent   = correct ? `+${points} pts` : '';

  // Mensaje motivacional
  motiv.textContent = msg;
  motiv.classList.add('show');

  setTimeout(() => {
    overlay.className = 'feedback-overlay';
    motiv.classList.remove('show');
  }, 1600);
}

/**
 * Crea una partícula flotante de puntos en la posición del botón
 * @param {HTMLElement} el Elemento de referencia
 * @param {string} text   Texto (p.ej. "+10")
 */
function spawnPointParticle(el, text) {
  const rect = el.getBoundingClientRect();
  const span = document.createElement('span');
  span.className   = 'point-particle';
  span.textContent = text;
  span.style.left  = rect.left + rect.width / 2 + 'px';
  span.style.top   = rect.top + 'px';
  document.body.appendChild(span);
  setTimeout(() => span.remove(), 1000);
}

/** Frases motivacionales aleatorias */
const MOTIVATIONAL_CORRECT = [
  '¡EXCELENTE CÁLCULO!',
  '¡FRACCIÓN DOMINADA!',
  '¡PORCENTAJE CORRECTO!',
  '¡REGLA DE 3 APLICADA!',
  '¡MENTE MATEMÁTICA ACTIVADA!',
  '¡LÓGICA PERFECTA!',
  '¡OPERACIÓN APROBADA!',
];
const MOTIVATIONAL_WRONG = [
  'REPASA LAS FRACCIONES',
  'REVISA TU CÁLCULO DE PORCENTAJE',
  'LA REGLA DE 3 NUNCA FALLA… INTÉNTALO',
  'CADA ERROR ES APRENDIZAJE',
  'RECALCULANDO ESTRATEGIA…',
  'REVISA LAS TABLAS DE VERDAD',
];

function getMotivationalMsg(correct) {
  const arr = correct ? MOTIVATIONAL_CORRECT : MOTIVATIONAL_WRONG;
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ================================================================
   10. FLUJO DEL JUEGO: SIGUIENTE PREGUNTA / FIN
================================================================ */

/** Avanza a la siguiente pregunta o finaliza el juego */
function nextQuestion() {
  document.onkeydown = null;
  state.currentQuestion++;

  if (state.currentQuestion >= state.questions.length || state.lives <= 0) {
    endGame();
  } else {
    loadQuestion();
  }
}

/** Finaliza la partida y muestra resultados */
function endGame() {
  clearInterval(state.timerInterval);
  document.onkeydown = null;

  const won = state.lives > 0 &&
              state.currentQuestion >= state.questions.length;

  // Sonido
  won ? soundVictory() : soundDefeat();

  // Guardar récord
  const prevHi = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  const isNewRecord = state.score > prevHi;
  if (isNewRecord) localStorage.setItem(STORAGE_KEY, state.score);

  // Actualizar pantalla de resultado
  const accuracy = state.questions.length > 0
    ? Math.round((state.answeredCorrect / state.questions.length) * 100)
    : 0;

  document.getElementById('res-score').textContent    = state.score;
  document.getElementById('res-correct').textContent  =
    `${state.answeredCorrect} / ${state.questions.length}`;
  document.getElementById('res-accuracy').textContent = accuracy + '%';
  document.getElementById('res-level').textContent    =
    DIFFICULTY_CONFIG[state.difficulty].label;

  // Trofeo y título según resultado
  const trophy = document.getElementById('result-trophy');
  const title  = document.getElementById('result-title');
  const msg    = document.getElementById('result-message');

  if (won && accuracy >= 80) {
    trophy.textContent = '🏆';
    title.textContent  = 'MISIÓN COMPLETADA';
    msg.textContent    = '"Las matemáticas son el lenguaje en el que Dios escribió el universo." — Galileo';
  } else if (won) {
    trophy.textContent = '⭐';
    title.textContent  = 'NIVEL SUPERADO';
    msg.textContent    = '¡Buen trabajo! Sigue practicando para dominar las matemáticas aplicadas.';
  } else {
    trophy.textContent = '💡';
    title.textContent  = 'MISIÓN FALLIDA';
    msg.textContent    = '"El fracaso es simplemente la oportunidad de comenzar de nuevo, esta vez más inteligentemente." — Ford';
  }

  // Nuevo récord
  const statHi = document.getElementById('stat-hi');
  if (isNewRecord) {
    statHi.style.display = '';
    document.getElementById('res-hiscore').textContent = state.score;
  } else {
    statHi.style.display = 'none';
  }

  // Actualizar pantalla de inicio con récord
  updateHiScoreDisplay();

  showScreen('screen-result');
}

/** Actualiza el badge de récord en la pantalla de inicio */
function updateHiScoreDisplay() {
  const hi = localStorage.getItem(STORAGE_KEY) || '0';
  document.getElementById('hiscore-val').textContent = hi;
}

/** Pide confirmación para abandonar */
function confirmQuit() {
  if (confirm('¿Seguro que deseas abandonar la misión? Perderás tu progreso.')) {
    clearInterval(state.timerInterval);
    document.onkeydown = null;
    showScreen('screen-start');
  }
}

/* ================================================================
   UTILIDADES
================================================================ */

/**
 * Mezcla un array en su lugar (Fisher-Yates)
 * @param {Array} arr
 * @returns {Array} El mismo array mezclado
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ================================================================
   INICIALIZACIÓN
================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();      // Canvas de fondo animado
  updateHiScoreDisplay(); // Mostrar récord guardado
  showScreen('screen-start'); // Pantalla inicial
});