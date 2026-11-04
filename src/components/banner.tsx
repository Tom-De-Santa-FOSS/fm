import { useCallback, useEffect, useRef, useState } from "react";

import { formatMoney } from "../lib/format";
import { minimumOrderRs } from "../lib/products";

const announcements = [
  "Delivery In Sukkur Only, No Rohri",
  `Minimum Order ${formatMoney(minimumOrderRs)}`,
  "Prices Change Daily",
  "Free Delivery On 1st Order",
  "Free Delivery On Orders Above 3000",
];

export const Banner = () => {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const paused = hovered || focused || reducedMotion;
  const scroller = useRef<HTMLElement>(null);

  const move = useCallback(
    (direction: number) => {
      const next =
        (index + direction + announcements.length) % announcements.length;

      const slide = scroller.current?.querySelectorAll("p")[next];

      if (slide) {
        scroller.current?.scrollTo({
          behavior: "instant",
          left: slide.offsetLeft,
        });
        setIndex(next);
      }
    },
    [index]
  );

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Browser preferences are unavailable during server rendering.
    // oxlint-disable-next-line react/set-state-in-effect
    setReducedMotion(preference.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    preference.addEventListener("change", onChange);

    return () => preference.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused) {
      return;
    }

    const timer = window.setInterval(() => move(1), 5000);

    return () => window.clearInterval(timer);
  }, [move, paused]);

  return (
    <section aria-label="Store announcements" className="banner">
      <div
        className="banner-inner"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setFocused(false);
          }
        }}
      >
        <button
          type="button"
          aria-label="Previous announcement"
          onClick={() => move(-1)}
        >
          &lt;
        </button>
        <section
          ref={scroller}
          aria-label="Announcements. Scroll horizontally to read all messages."
          // Keyboard users need to focus the scroll container to read overflowing messages.
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className="banner-scroller"
          onScroll={(event) => {
            const container = event.currentTarget;
            setIndex(Math.round(container.scrollLeft / container.clientWidth));
          }}
        >
          {announcements.map((announcement) => (
            <p key={announcement}>{announcement}</p>
          ))}
        </section>
        <span
          className="sr-only"
          aria-live={paused ? "polite" : "off"}
          aria-atomic="true"
        >
          {announcements[index]}
        </span>
        <button
          type="button"
          aria-label="Next announcement"
          onClick={() => move(1)}
        >
          &gt;
        </button>
      </div>
    </section>
  );
};
