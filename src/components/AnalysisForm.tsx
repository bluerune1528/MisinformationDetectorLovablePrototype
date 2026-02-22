import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Link as LinkIcon, Search } from "lucide-react";

interface Props {
  onSubmit: (data: { text?: string; url?: string }) => void;
  isLoading: boolean;
}

const AnalysisForm = ({ onSubmit, isLoading }: Props) => {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [tab, setTab] = useState("text");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "text" && text.trim()) {
      onSubmit({ text: text.trim() });
    } else if (tab === "url" && url.trim()) {
      onSubmit({ url: url.trim() });
    }
  };

  const isValid = tab === "text" ? text.trim().length > 0 : url.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Analyze Text
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Analyze URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Textarea
            placeholder="Paste a claim, headline, or article text here to check for misinformation…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[140px] resize-none text-base"
            disabled={isLoading}
          />
        </TabsContent>

        <TabsContent value="url">
          <Input
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="text-base h-12"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Enter a URL to extract and analyze its content
          </p>
        </TabsContent>
      </Tabs>

      <Button
        type="submit"
        size="lg"
        className="w-full mt-4 text-base font-semibold"
        disabled={!isValid || isLoading}
      >
        <Search className="h-5 w-5 mr-2" />
        {isLoading ? "Analyzing…" : "Check for Misinformation"}
      </Button>
    </form>
  );
};

export default AnalysisForm;
