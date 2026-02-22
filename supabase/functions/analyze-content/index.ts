import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Heuristic Analysis ───

const SUSPICIOUS_PHRASES = [
  "you won't believe", "doctors hate", "they don't want you to know",
  "exposed", "wake up", "sheeple", "mainstream media lies",
  "big pharma", "secret cure", "government cover-up", "hoax",
  "miracle cure", "banned video", "one weird trick",
];

const RELIABLE_DOMAINS = [
  "bbc.com", "bbc.co.uk", "reuters.com", "apnews.com",
  "npr.org", "nytimes.com", "theguardian.com", "washingtonpost.com",
  "wikipedia.org", "snopes.com", "factcheck.org", "nature.com",
  "sciencedirect.com", "pubmed.ncbi.nlm.nih.gov",
];

const UNRELIABLE_DOMAINS = [
  "infowars.com", "naturalnews.com", "beforeitsnews.com",
  "worldtruth.tv", "yournewswire.com",
];

function heuristicScore(text: string, urlDomain?: string) {
  let score = 50;
  const flags: string[] = [];
  const lower = text.toLowerCase();

  // Caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
  if (capsRatio > 0.4 && text.length > 10) {
    score -= 10;
    flags.push("Text in all caps — potential sensationalism");
  }

  // Exclamation marks
  const exclCount = (text.match(/!/g) || []).length;
  if (exclCount >= 3) {
    score -= 8;
    flags.push("Excessive exclamation marks detected");
  }

  // Suspicious phrases
  for (const phrase of SUSPICIOUS_PHRASES) {
    if (lower.includes(phrase)) {
      score -= 15;
      flags.push("Strong emotional / conspiracy language detected");
      break;
    }
  }

  // Citations / data
  if (/https?:\/\//.test(text)) score += 5;
  if (/\d{2,}/.test(text)) score += 3;
  if (text.includes('"')) score += 3;

  // Domain authority
  let sourceAuthority: number | null = null;
  if (urlDomain) {
    if (RELIABLE_DOMAINS.some((d) => urlDomain.includes(d))) {
      sourceAuthority = 85;
      score += 20;
    } else if (UNRELIABLE_DOMAINS.some((d) => urlDomain.includes(d))) {
      sourceAuthority = 15;
      score -= 20;
      flags.push("Source is from a known unreliable domain");
    } else {
      sourceAuthority = 55;
    }
    if (urlDomain.startsWith("https")) score += 5;
  }

  score = Math.max(0, Math.min(100, score));
  return { score, flags: flags.slice(0, 5), sourceAuthority };
}

// ─── URL text extraction ───

async function extractTextFromUrl(url: string): Promise<{ text: string; domain: string }> {
  const res = await fetch(url, { headers: { "User-Agent": "MisinfoDetector/1.0" } });
  if (!res.ok) throw new Error("Could not fetch URL");
  const html = await res.text();
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
  const domain = new URL(url).hostname;
  return { text: cleaned, domain };
}

// ─── AI Classification via Lovable AI ───

async function aiClassify(text: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return { classification: null, confidence: null, factCheckResults: null };

  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch("https://api.openai.com/v1/chat/completions"), {
      method: "POST",
      headers: {
       Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `
You are a professional misinformation detection and fact-checking AI.

Today's real-world date is ${today}.
You MUST use this as the current date when evaluating claims.

If a claim refers to future events, classify it as "unverifiable" rather than assuming it already happened.

Analyze the given text and respond ONLY using the required JSON format.
Be cautious with uncertain facts and avoid inventing dates or events.
Today's exact date is ${today}. Do not guess or approximate the year.
`

Return this exact JSON structure:
{
  "classification": "one of: credible, misleading, likely_false, satire, opinion, unverifiable",
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation",
  "factCheckResults": [
    {
      "claim": "key claim found",
      "rating": "True / Mostly True / Half True / Mostly False / False / Unverifiable",
      "source": "your reasoning source"
    }
  ]
}

Be concise but thorough. Focus on factual accuracy.`,
          },
          { role: "user", content: `Analyze this text for misinformation:\n\n${text.slice(0, 1500)}` },
        ],
      }),
    });

    if (response.status === 429) {
      console.error("AI rate limited");
      return { classification: null, confidence: null, factCheckResults: null };
    }
    if (response.status === 402) {
      console.error("AI payment required");
      return { classification: null, confidence: null, factCheckResults: null };
    }
    if (!response.ok) {
      console.error("AI error:", response.status);
      return { classification: null, confidence: null, factCheckResults: null };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle potential markdown wrapping)
    const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    return {
      classification: parsed.classification || null,
      confidence: parsed.confidence || null,
      factCheckResults: parsed.factCheckResults || null,
    };
  } catch (e) {
    console.error("AI classification failed:", e);
    return { classification: null, confidence: null, factCheckResults: null };
  }
}

// ─── Main handler ───

serve(async (req) => {
console.log("NEW VERSION RUNNING 🚀");
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, url } = await req.json();

    if (!text && !url) {
      return new Response(
        JSON.stringify({ error: "Provide either 'text' or 'url'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let analysisText = text || "";
    let urlDomain: string | undefined;

    // Extract text from URL if needed
    if (url) {
      try {
        const extracted = await extractTextFromUrl(url);
        analysisText = extracted.text;
        urlDomain = extracted.domain;
      } catch {
        return new Response(
          JSON.stringify({ error: "Could not fetch the provided URL" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Run heuristic + AI in parallel
    const [heuristic, ai] = await Promise.all([
      Promise.resolve(heuristicScore(analysisText, urlDomain)),
      aiClassify(analysisText),
    ]);

    // Combine scores: if AI says likely_false, lower score; if credible, raise it
    let finalScore = heuristic.score;
    if (ai.classification === "likely_false") finalScore = Math.max(0, finalScore - 20);
    else if (ai.classification === "misleading") finalScore = Math.max(0, finalScore - 10);
    else if (ai.classification === "credible") finalScore = Math.min(100, finalScore + 10);

    // Generate reasoning
    let reasoning: string;
    if (finalScore >= 70) {
      reasoning =
        "This content appears mostly credible based on our analysis. Always verify important claims through multiple trusted sources.";
    } else if (finalScore >= 40) {
      reasoning =
        "This content shows mixed credibility signals. We recommend fact-checking key claims before sharing.";
    } else {
      reasoning =
        "This content shows multiple indicators commonly found in misinformation. We strongly recommend verifying claims through trusted sources before sharing.";
    }

    const analysisId = crypto.randomUUID();

    const body = {
      credibilityScore: finalScore,
      reasoning,
      flags: heuristic.flags,
      sourceAuthority: heuristic.sourceAuthority,
      aiClassification: ai.classification,
      aiConfidence: ai.confidence,
      factCheckResults: ai.factCheckResults,
      analysisId,
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
