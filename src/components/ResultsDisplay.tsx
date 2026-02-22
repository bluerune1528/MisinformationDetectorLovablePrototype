import { AlertTriangle, CheckCircle, HelpCircle, Brain, ExternalLink, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResponse } from "@/types";
import { getCredibilityLabel, getCredibilityBgColor, getCredibilityColor } from "@/utils/formatters";

interface Props {
  result: AnalysisResponse;
}

const ScoreIcon = ({ score }: { score: number }) => {
  if (score >= 70) return <CheckCircle className="h-8 w-8 text-green-600" />;
  if (score >= 40) return <HelpCircle className="h-8 w-8 text-yellow-600" />;
  return <AlertTriangle className="h-8 w-8 text-red-600" />;
};

const ResultsDisplay = ({ result }: Props) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Score Card */}
      <Card className={`border-2 ${getCredibilityBgColor(result.credibilityScore)}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <ScoreIcon score={result.credibilityScore} />
            <div className="flex-1">
              <div className="flex items-baseline gap-3">
                <span className={`text-4xl font-bold ${getCredibilityColor(result.credibilityScore)}`}>
                  {result.credibilityScore}
                </span>
                <span className="text-muted-foreground text-sm">/ 100</span>
              </div>
              <p className={`text-lg font-semibold ${getCredibilityColor(result.credibilityScore)}`}>
                {getCredibilityLabel(result.aiClassification, result.credibilityScore)}
              </p>
            </div>
            {result.sourceAuthority !== null && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Source Authority</p>
                <p className="text-2xl font-bold text-foreground">{result.sourceAuthority}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Classification */}
      {result.aiClassification && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Classification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {result.aiClassification}
              </Badge>
              {result.aiConfidence !== null && (
                <span className="text-sm text-muted-foreground">
                  {Math.round(result.aiConfidence * 100)}% confidence
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reasoning */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">{result.reasoning}</p>
        </CardContent>
      </Card>

      {/* Flags */}
      {result.flags.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Flag className="h-5 w-5 text-destructive" />
              Warning Flags ({result.flags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.flags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Fact Check Results */}
      {result.factCheckResults && result.factCheckResults.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Fact-Check Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.factCheckResults.map((fc, i) => (
                <li key={i} className="border-b border-border last:border-0 pb-3 last:pb-0">
                  <p className="text-sm font-medium">{fc.claim}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{fc.rating}</Badge>
                    <span className="text-xs text-muted-foreground">— {fc.source}</span>
                    {fc.url && (
                      <a href={fc.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsDisplay;
