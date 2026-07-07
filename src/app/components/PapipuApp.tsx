"use client";

import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { playButtonPop } from "@/lib/buttonSound";

const PLACEHOLDER_COUNT = "000000000000000000000000";
const SOUND_GUARD_MS = 120;

export default function PapipuApp() {
  const [pressed, setPressed] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const lastSoundAtRef = useRef(0);

  const playSoundOnce = () => {
    const now = Date.now();
    if (now - lastSoundAtRef.current < SOUND_GUARD_MS) {
      return;
    }
    lastSoundAtRef.current = now;
    playButtonPop();
  };

  const pressVisual = () => {
    setPressed(true);
    setFlashing(true);
  };

  const handleTouchStart = () => {
    playSoundOnce();
    pressVisual();
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    playSoundOnce();
    pressVisual();
  };

  const release = () => setPressed(false);

  return (
    <div className="papipu-page">
      <header className="papipu-counter-wrap">
        <span className="papipu-counter-label">World Total</span>
        <span
          className={`papipu-counter${flashing ? " papipu-counter-flash" : ""}`}
          onAnimationEnd={() => setFlashing(false)}
        >
          {PLACEHOLDER_COUNT}
        </span>
      </header>

      <main className="papipu-main">
        <div className="papipu-stage">
          <div className="papipu-ring">
            <button
              type="button"
              aria-label="Papipu Button"
              className={`papipu-button${pressed ? " papipu-button-pressed" : ""}`}
              onTouchStart={handleTouchStart}
              onPointerDown={handlePointerDown}
              onPointerUp={release}
              onPointerLeave={release}
              onPointerCancel={release}
            />
          </div>
        </div>

        <p className="papipu-tagline">
          One Button.
          <br />
          One World.
        </p>
      </main>

      <footer className="papipu-footer">by Project PapipupePopcorn</footer>
    </div>
  );
}
