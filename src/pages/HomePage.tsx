import { useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import AnalysisForm from "@/components/AnalysisForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import LoadingSpinner from "@/components/LoadingSpinner";
import { analyzeContent } from "@/services/analysisService";
import type { AnalysisResponse } from "@/types";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const handleSubmit = async (data: { text?: string; url?: string }) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await analyzeContent(data);
      setResult(response);
    } catch (err: any) {
      toast.error(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Check for Misinformation
          </h1>
          <p className="text-muted-foreground">
            Paste text or a URL to analyze its credibility using heuristics + AI
          </p>
        </div>

        <AnalysisForm onSubmit={handleSubmit} isLoading={isLoading} />

        <div className="mt-8">
          {isLoading && <LoadingSpinner />}
          {result && !isLoading && <ResultsDisplay result={result} />}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
