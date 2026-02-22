import { supabase } from "@/integrations/supabase/client";
import type { AnalysisRequest, AnalysisResponse, AnalysisResult } from "@/types";

const HISTORY_KEY = "misinfo_analysis_history";

export async function analyzeContent(request: AnalysisRequest): Promise<AnalysisResponse> {
  const { data, error } = await supabase.functions.invoke("analyze-content", {
    body: request,
  });

  if (error) throw new Error(error.message || "Analysis failed");

  const result: AnalysisResponse = data;

  // Save to localStorage history
  const historyItem: AnalysisResult = {
    id: result.analysisId,
    textInput: request.text || null,
    urlInput: request.url || null,
    credibilityScore: result.credibilityScore,
    reasoning: result.reasoning,
    flags: result.flags,
    sourceAuthority: result.sourceAuthority,
    aiClassification: result.aiClassification,
    aiConfidence: result.aiConfidence,
    factCheckResults: result.factCheckResults,
    createdAt: new Date().toISOString(),
  };

  saveToHistory(historyItem);

  return result;
}

function saveToHistory(item: AnalysisResult): void {
  try {
    const history = getHistory();
    history.unshift(item);
    // Keep only last 50
    const trimmed = history.slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage might be full
  }
}

export function getHistory(): AnalysisResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
