import { useState, useEffect } from "react";
import Header from "@/components/Header";
import AnalysisHistory from "@/components/AnalysisHistory";
import { getHistory, clearHistory } from "@/services/analysisService";
import type { AnalysisResult } from "@/types";

const HistoryPage = () => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Analysis History</h1>
        <AnalysisHistory history={history} onClear={handleClear} />
      </main>
    </div>
  );
};

export default HistoryPage;
