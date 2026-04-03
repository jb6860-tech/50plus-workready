/*
 * DESIGN: "Warm Authority" — Navy footer with gold tagline and privacy link
 */
import { Link } from "wouter";

export default function PageFooter() {
  return (
    <footer
      className="py-4 px-4 text-center mt-6"
      style={{ borderTop: "1px solid #E8D9C0" }}
    >
      <p
        className="text-xs italic"
        style={{ color: "#8B7355", fontFamily: "'Source Sans 3', sans-serif" }}
      >
        Built for the experienced. Designed for the future.
      </p>
      <div className="flex items-center justify-center gap-4 mt-2">
        <Link
          href="/privacy"
          className="text-xs underline"
          style={{ color: "#1a2e5a", fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Privacy Policy
        </Link>
        <span className="text-xs" style={{ color: "#c9a84c" }}>·</span>
        <Link
          href="/pricing"
          className="text-xs underline"
          style={{ color: "#1a2e5a", fontFamily: "'Source Sans 3', sans-serif" }}
        >
          Pricing & Plans
        </Link>
      </div>
    </footer>
  );
}
