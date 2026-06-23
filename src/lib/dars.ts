/**
 * Extract completed UW course codes from pasted text — a DARS audit, an
 * unofficial transcript, or just a list a student types. We can't call the real
 * DARS API (it requires UW authentication), so pasting the audit text is the
 * pragmatic bridge: students open their audit at myplan.uw.edu, copy it, and
 * paste it here.
 *
 * Strategy: pull out anything shaped like a course code and keep only the ones
 * that resolve to a real course in the catalog. Handles multi-word departments
 * ("B BIO 180", "E E 215") and compact forms ("CSE143").
 */
export function parseCompletedCodes(
  text: string,
  isKnown: (id: string) => boolean,
): string[] {
  const found = new Set<string>();
  const upper = ` ${text.toUpperCase()} `;

  // Spaced form: up to three uppercase department words, then a 3-digit number.
  const spaced = /([A-Z][A-Z&]{0,4}(?:\s+[A-Z][A-Z&]{0,4}){0,2})\s+(\d{3})\b/g;
  let m: RegExpExecArray | null;
  while ((m = spaced.exec(upper)) !== null) {
    const words = m[1].split(/\s+/).filter(Boolean);
    const num = m[2];
    // Try the longest department suffix first to strip junk leading words.
    for (let start = 0; start < words.length; start++) {
      const candidate = `${words.slice(start).join(" ")} ${num}`;
      if (isKnown(candidate)) {
        found.add(candidate);
        break;
      }
    }
  }

  // Compact form: CSE143
  const compact = /\b([A-Z]{2,5})(\d{3})\b/g;
  while ((m = compact.exec(upper)) !== null) {
    const candidate = `${m[1]} ${m[2]}`;
    if (isKnown(candidate)) found.add(candidate);
  }

  return [...found].sort();
}
