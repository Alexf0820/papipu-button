import type { Metadata } from "next";
import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Info · ${SITE_NAME}`,
  description: "About, privacy, terms, and contact for PapipuButton.",
};

export default function InfoPage() {
  return (
    <div className="papipu-info-page">
      <header className="papipu-info-header">
        <Link className="papipu-info-back" href="/">
          ← {SITE_NAME}
        </Link>
        <h1 className="papipu-info-title">Info</h1>
      </header>

      <main className="papipu-info-main">
        <section className="papipu-info-section">
          <h2 className="papipu-info-heading">About</h2>
          <p className="papipu-info-text">
            PapipuButton is a shared world counter. One red button, one running
            total for everyone. The first release from Project PapipupePopcorn.
          </p>
        </section>

        <section className="papipu-info-section">
          <h2 className="papipu-info-heading">Privacy</h2>
          <p className="papipu-info-text">
            We do not ask you to sign in. No personal information is collected.
            Button presses update the shared world count. If analytics is enabled,
            anonymous usage events may be collected to understand how the site is
            used.
          </p>
        </section>

        <section className="papipu-info-section">
          <h2 className="papipu-info-heading">Terms</h2>
          <p className="papipu-info-text">
            PapipuButton is provided for entertainment. Use it at your own
            discretion. The world count and milestone moments are part of the
            experience, not guarantees of any outcome.
          </p>
        </section>

        <section className="papipu-info-section">
          <h2 className="papipu-info-heading">Contact</h2>
          <p className="papipu-info-text">
            Questions, feedback, or ideas? Visit{" "}
            <a
              className="papipu-info-link"
              href="https://4ppopcorn.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Project PapipupePopcorn
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
