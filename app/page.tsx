"use client";

// app/page.tsx

import Controller from "@/components/Controller/Controller";
import "./page.css";

export default function HomePage() {
  return (
    <main>
      <Controller />
      <p className="credit">
        Music credit:{" "}
        <a
          href="https://open.spotify.com/artist/5e8lAFGws51fgjO9MWXnrt"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "inherit",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
          }}
          aria-label="Ankyl on Spotify (opens in a new tab)"
        >
          Ankyl - “Fennec Takes Charge”
        </a>
      </p>
    </main>
  );
}
