/*
 * DESIGN: "Warm Authority" — Navy footer with gold tagline
 */
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
    </footer>
  );
}
