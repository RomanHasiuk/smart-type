let audioCtx: AudioContext | null = null;

function initAudio(): AudioContext {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Генерує тональний звук заданої частоти через Web Audio API.
 * 
 * ЯК ЕКСПЕРИМЕНТУВАТИ ЗІ ЗВУКАМИ:
 * - freq: частота ноти в Герцах (Гц).
 *   Приклади частот:
 *   - 261.63 Hz -> C4 (До 4-ї октави)
 *   - 440.00 Hz -> A4 (Ля - еталонна нота)
 *   - 523.25 Hz -> C5 (До 5-ї октави)
 *   - 659.25 Hz -> E5 (Мі 5-ї октави)
 *   - 783.99 Hz -> G5 (Соль 5-ї октави)
 *   - 1046.50 Hz -> C6 (До 6-ї октави)
 * 
 * - type: тип звукової хвилі:
 *   - 'sine' (за замовчуванням): м'який, чистий свист/дзвіночок
 *   - 'triangle': трішки тепліший, флейтовий звук
 *   - 'square': 8-бітний ретро-звук консолей
 *   - 'sawtooth': різкий електронний бас/зумер
 */
function playTone(
  freq: number,
  startTimeOffset: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.15
) {
  try {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    const startTime = ctx.currentTime + startTimeOffset;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (err) {
    console.error("Audio feedback error:", err);
  }
}

/**
 * Звук початку запису: висхідний ніжний подвійний біп (C5 -> E5).
 */
export const playStartSound = () => {
  playTone(523.25, 0, 0.12, "sine", 0.15); // C5
  playTone(659.25, 0.10, 0.20, "sine", 0.15); // E5
};

/**
 * Звук зупинки запису: спадний ніжний подвійний біп (E5 -> C5).
 */
export const playStopSound = () => {
  playTone(659.25, 0, 0.12, "sine", 0.15); // E5
  playTone(523.25, 0.10, 0.20, "sine", 0.15); // C5
};

/**
 * Звук помилки: низький електронний зумер (C3 -> G2).
 */
export const playErrorSound = () => {
  try {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.value = 130.81; // C3
    osc.frequency.exponentialRampToValueAtTime(98.0, ctx.currentTime + 0.3); // G2

    const startTime = ctx.currentTime;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.3);
  } catch (err) {
    console.error("Не вдалося відтворити звук помилки:", err);
  }
};
