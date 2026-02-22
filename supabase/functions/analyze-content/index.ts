import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

async function searchFactCheck(claim: string) {
  const key = Deno.env.get("GOOGLE_FACTCHECK_API_KEY");

  const url =
    `https://factchecktools.googleapis.com/v1alpha1/claims:search` +
    `?query=${encodeURIComponent(claim)}&key=${key}`;

  const res = await fetch(url);
  const data = await res.json();

  return data.claims ?? [];
}

async function searchWeb(query: string) {
  const key = Deno.env.get("TAVILY_API_KEY");

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      api_key: key,
      query,
      search_depth: "advanced",
      max_results: 5
    })
  });

  const data = await res.json();
  return data.results ?? [];
}
 function summarizeFactChecks(claims: any[]) {
  if (!claims.length) return "No verified fact-check results found.";

  return claims.slice(0, 3).map((c: any) => {
    const publisher = c.claimReview?.[0]?.publisher?.name ?? "Unknown";
    const rating = c.claimReview?.[0]?.textualRating ?? "No rating";
    const title = c.text ?? "Claim";

    return `${publisher} rated "${title}" as: ${rating}`;
  }).join("\n");
}

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

// ─── AI Classification ───
async function aiClassify(
  text: string,
  factSummary: string,
  webResults: any[]
){
  console.log("🔥 AI FUNCTION ENTERED");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

if (!GROQ_API_KEY) {
  console.error("Missing GROQ API key");
  return { classification: null, confidence: null };
}
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
       messages: [
  {
    role: "system",
   content: `
You are an advanced misinformation detection and fact-checking AI.

Your job is to evaluate a claim using REAL EVIDENCE, not guesses.

Today's date is: ${today}

--------------------------------------------------
EVIDENCE SOURCES
--------------------------------------------------

1) Verified Fact-Check Database Results:
${factSummary}

2) Web Search Evidence (recent sources):
${webResults.map(r =>
  `Title: ${r.title}
Source: ${r.url}
Summary: ${r.content}`
).join("\n\n")}

--------------------------------------------------
REASONING RULES
--------------------------------------------------

You MUST follow this hierarchy:

STEP 1 — Fact-Check Authority (highest priority)
If reputable fact-checking organizations (AFP, Reuters, AP, PolitiFact, BBC, Snopes, etc.)
have rated the claim:
- False → classification = "likely_false"
- True → classification = "credible"
- Misleading → classification = "misleading"

STEP 2 — Scientific & Historical Consensus
If overwhelming scientific or historical consensus contradicts the claim,
classify as "likely_false" even if no fact-check entry exists.

STEP 3 — Evidence Support
If multiple reliable sources support the claim → "credible".

STEP 4 — Uncertainty
Use "uncertain" ONLY when:
- evidence conflicts, OR
- claim refers to future/unverifiable events.

DO NOT default to uncertainty when strong evidence exists.

--------------------------------------------------
OUTPUT STYLE
--------------------------------------------------

Provide a SHORT explanation suitable for normal users:
- clear and direct
- reference evidence logically (do not list URLs)

--------------------------------------------------
RESPONSE FORMAT (STRICT JSON)
--------------------------------------------------

Return ONLY valid JSON:

{
  "classification": "credible | misleading | likely_false | uncertain",
  "confidence": number (0-100),
  "analysis": "short explanation for the user",
  "factCheckResults": []
}

Confidence Guidelines:
- 85–100 → strong verified consensus
- 60–85 → reliable evidence
- 40–60 → mixed/uncertain evidence
- 0–40 → strong contradiction

Never output text outside JSON.
`
  },
          { role: "user", content: `Analyze this text for misinformation:\n\n${text.slice(0, 1500)}` },
        ],
      }),
    });
    const data = await response.json();

const aiText =
  data.choices?.[0]?.message?.content ?? "{}";

const aiResult = JSON.parse(aiText);

return aiResult;

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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔥 FUNCTION STARTED");
    const { text, url } = await req.json();
    const factChecks = await searchFactCheck(text);
    const factSummary = summarizeFactChecks(factChecks);
    const webResults = await searchWeb(text);
   

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
  aiClassify(analysisText, factSummary, webResults),
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
