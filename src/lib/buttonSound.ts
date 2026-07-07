const BUTTON_POP_SRC = "/sounds/button-pop.wav";
const VOLUME = 0.58;
const POOL_SIZE = 6;

let audioContext: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loadPromise: Promise<AudioBuffer | null> | null = null;
let pool: HTMLAudioElement[] | null = null;
let poolIndex = 0;

function getAudioContext(): AudioContext {
  audioContext ??= new AudioContext();
  return audioContext;
}

function loadBuffer(): Promise<AudioBuffer | null> {
  if (buffer) {
    return Promise.resolve(buffer);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const response = await fetch(BUTTON_POP_SRC);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const context = getAudioContext();
      buffer = await context.decodeAudioData(arrayBuffer.slice(0));
      return buffer;
    } catch (error) {
      console.warn("Button pop preload failed:", error);
      return null;
    }
  })();

  return loadPromise;
}

function playFromBuffer(audioBuffer: AudioBuffer): void {
  const context = getAudioContext();
  const source = context.createBufferSource();
  const gain = context.createGain();

  gain.gain.value = VOLUME;
  source.buffer = audioBuffer;
  source.connect(gain);
  gain.connect(context.destination);
  source.start(0);
}

function getPoolAudio(): HTMLAudioElement {
  if (!pool) {
    pool = Array.from({ length: POOL_SIZE }, () => {
      const audio = new Audio(BUTTON_POP_SRC);
      audio.preload = "auto";
      return audio;
    });
  }

  const audio = pool[poolIndex % POOL_SIZE];
  poolIndex += 1;
  return audio;
}

function playFromPool(): void {
  try {
    const audio = getPoolAudio();
    audio.volume = VOLUME;
    audio.currentTime = 0;
    void audio.play().catch((error) => {
      console.warn("Button pop play failed:", error);
    });
  } catch (error) {
    console.warn("Button pop play failed:", error);
  }
}

export function primeButtonPop(): void {
  void loadBuffer();
}

export function playButtonPop(): void {
  void (async () => {
    try {
      const context = getAudioContext();
      await context.resume();

      const audioBuffer = await loadBuffer();
      if (audioBuffer) {
        playFromBuffer(audioBuffer);
        return;
      }
    } catch (error) {
      console.warn("Button pop play failed:", error);
    }

    playFromPool();
  })();
}
