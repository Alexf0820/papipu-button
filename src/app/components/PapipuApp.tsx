import { getFormattedWorldCount } from "@/lib/supabase/worldCount";

export default async function PapipuApp() {
  const worldCount = await getFormattedWorldCount();

  return (
    <div className="papipu-page">
      <header className="papipu-counter-wrap">
        <span className="papipu-counter-label">World Total</span>
        <span id="papipu-counter" className="papipu-counter">
          {worldCount}
        </span>
      </header>

      <main className="papipu-main">
        <div className="papipu-stage">
          <div className="papipu-ring">
            <button
              id="tap-button"
              type="button"
              aria-label="Papipu Button"
              className="papipu-button"
            />
          </div>
        </div>

        <p className="papipu-tagline">
          One Button.
          <br />
          One World.
        </p>
      </main>

      <footer className="papipu-footer">
        <a
          id="papipu-support-link"
          className="papipu-footer-support"
          href="https://buymeacoffee.com/4ppopcorn"
          target="_blank"
          rel="noopener noreferrer"
        >
          Support this project
        </a>
        <a
          className="papipu-footer-credit"
          href="https://4ppopcorn.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          by Project PapipupePopcorn
        </a>
      </footer>
    </div>
  );
}
