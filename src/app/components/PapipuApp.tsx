"use client";

import { useState } from "react";

const PLACEHOLDER_COUNT = "000000000000000000000000";

export default function PapipuApp() {
  const [pressed, setPressed] = useState(false);
  const [flashing, setFlashing] = useState(false);

  const press = () => {
    setPressed(true);
    setFlashing(true);
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
              onPointerDown={press}
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
