const BUTTON_POP_SRC = "/sounds/button-pop.m4a";

const audioCache: Record<string, HTMLAudioElement> = {};

function getAudio(src: string): HTMLAudioElement {
  if (!audioCache[src]) {
    const audio = new Audio();
    audio.preload = "none";
    audio.src = src;
    audio.addEventListener("error", () => {
      console.warn("Audio skipped (not found or unsupported):", src);
    });
    audioCache[src] = audio;
  }
  return audioCache[src];
}

function tryPlaySrc(src: string): void {
  if (!src) return;

  try {
    const audio = getAudio(src);

    if (audio.error) {
      return;
    }

    audio.currentTime = 0;
    if (audio.readyState === 0) {
      audio.load();
    }

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch((error) => {
        console.warn("Audio play failed:", src, error);
      });
    }
  } catch (error) {
    console.warn("Audio play failed:", src, error);
  }
}

export function playButtonPop(): void {
  tryPlaySrc(BUTTON_POP_SRC);
}
