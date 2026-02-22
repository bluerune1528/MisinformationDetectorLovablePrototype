export interface AnalysisResult {
  id: string;
  textInput: string | null;
  urlInput: string | null;
  credibilityScore: number;
  reasoning: string;
  flags: string[];
  sourceAuthority: number | null;
  aiClassification: string | null;
  aiConfidence: number | null;
  factCheckResults: FactCheckResult[] | null;
  createdAt: string;
}

export interface FactCheckResult {
  claim: string;
  rating: string;
  source: string;
  url?: string;
}

export interface AnalysisRequest {
  text?: string;
  url?: string;
}

export interface AnalysisResponse {
  credibilityScore: number;
  reasoning: string;
  flags: string[];
  sourceAuthority: number | null;
  aiClassification: string | null;
  aiConfidence: number | null;
  factCheckResults: FactCheckResult[] | null;
  analysisId: string;
}
