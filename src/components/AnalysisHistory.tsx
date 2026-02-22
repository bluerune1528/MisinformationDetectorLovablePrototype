import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { AnalysisResult } from "@/types";
import { getCredibilityLabel, getCredibilityColor, formatDate, truncateText } from "@/utils/formatters";

interface Props {
  history: AnalysisResult[];
  onClear: () => void;
}

const AnalysisHistory = ({ history, onClear }: Props) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No analyses yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Go to the Analyze tab to check some content!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{history.length} analysis results</p>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      {history.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.textInput
                    ? truncateText(item.textInput)
                    : item.urlInput
                    ? truncateText(item.urlInput)
                    : "Unknown input"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(item.createdAt)}
                </p>
                {item.flags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {item.flags.slice(0, 2).map((flag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {truncateText(flag, 30)}
                      </Badge>
                    ))}
                    {item.flags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.flags.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className={`text-2xl font-bold ${getCredibilityColor(item.credibilityScore)}`}>
                  {item.credibilityScore}
                </span>
                <p className={`text-xs font-medium ${getCredibilityColor(item.credibilityScore)}`}>
                  {getCredibilityLabel(item.credibilityScore)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalysisHistory;
