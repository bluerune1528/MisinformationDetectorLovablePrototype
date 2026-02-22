export function getCredibilityLabel(
  classification?: string,
  score?: number
): string {

  if (classification) {
    const map: Record<string, string> = {
      credible: "Likely Credible",
      misleading: "Misleading",
      likely_false: "Likely Misinformation",
      uncertain: "Uncertain"
    };

    return map[classification] ?? "Uncertain";
  }

  // fallback (old behaviour)
  if (score !== undefined) {
    if (score >= 70) return "Likely Credible";
    if (score >= 40) return "Uncertain";
  }

  return "Likely Misinformation";
}
export function getCredibilityColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

export function getCredibilityBgColor(score: number): string {
  if (score >= 70) return "bg-green-100 border-green-300";
  if (score >= 40) return "bg-yellow-100 border-yellow-300";
  return "bg-red-100 border-red-300";
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncateText(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}
